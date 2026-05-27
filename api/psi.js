export default async function handler(req, res) {
  const targets = [
    { url: 'https://www.sealines.eu', strategy: 'mobile', name: 'homepage_mobile' },
    { url: 'https://www.sealines.eu', strategy: 'desktop', name: 'homepage_desktop' },
    { url: 'https://www.sealines.eu/traghetti-grecia', strategy: 'mobile', name: 'traghetti_grecia_mobile' }
  ];
  
  const results = {};
  
  for (const target of targets) {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(target.url)}&strategy=${target.strategy}&category=performance`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.error) {
        results[target.name] = { error: data.error.message };
        continue;
      }
      
      const lr = data.lighthouseResult || {};
      const audits = lr.audits || {};
      const score = (lr.categories?.performance?.score || 0) * 100;
      
      // Extract metrics
      const getMetric = (key) => ({
        value: audits[key]?.numericValue,
        display: audits[key]?.displayValue,
        score: audits[key]?.score
      });
      
      // Extract opportunities
      const opportunities = [];
      for (const [key, audit] of Object.entries(audits)) {
        const d = audit.details || {};
        if (d.overallSavingsMs > 0 || d.overallSavingsBytes > 0) {
          const items = (d.items || []).map(i => ({
            url: (i.url || '').substring(0, 150),
            wastedMs: i.wastedMs,
            wastedBytes: i.wastedBytes,
            totalBytes: i.totalBytes
          }));
          opportunities.push({
            title: audit.title,
            savingsMs: d.overallSavingsMs,
            savingsBytes: d.overallSavingsBytes,
            items
          });
        }
      }
      
      // Render blocking resources
      const rbItems = (audits['render-blocking-resources']?.details?.items || []).map(i => ({
        url: i.url,
        totalBytes: i.totalBytes,
        wastedMs: i.wastedMs
      }));
      
      // Large payloads > 100KB
      const largePayloads = (audits['total-byte-weight']?.details?.items || [])
        .filter(i => i.totalBytes > 100 * 1024)
        .map(i => ({ url: (i.url || '').substring(0, 150), totalBytes: i.totalBytes }));
      
      // Field data
      const fieldData = {};
      const loading = data.loadingExperience?.metrics || {};
      for (const [k, v] of Object.entries(loading)) {
        fieldData[k] = { percentile: v.percentile, category: v.category };
      }
      
      results[target.name] = {
        score,
        metrics: {
          lcp: getMetric('largest-contentful-paint'),
          cls: getMetric('cumulative-layout-shift'),
          tbt: getMetric('total-blocking-time'),
          fcp: getMetric('first-contentful-paint'),
          speedIndex: getMetric('speed-index'),
          ttfb: getMetric('server-response-time'),
          tti: getMetric('interactive'),
          inp: getMetric('experimental-interaction-to-next-paint')
        },
        fieldData,
        opportunities,
        renderBlockingResources: rbItems,
        largePayloads,
        failedAudits: Object.entries(audits)
          .filter(([_, a]) => a.score !== null && a.score !== undefined && a.score < 1)
          .map(([key, a]) => ({ key, title: a.title, score: a.score, display: a.displayValue }))
      };
    } catch (e) {
      results[target.name] = { error: e.message };
    }
  }
  
  res.status(200).json(results);
}
