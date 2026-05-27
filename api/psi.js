export default async function handler(req, res) {
  const targets = [
    { url: 'https://www.sealines.eu', name: 'homepage' },
    { url: 'https://www.sealines.eu/traghetti-grecia', name: 'traghetti_grecia' }
  ];
  
  const results = {};
  
  for (const target of targets) {
    try {
      const startTime = Date.now();
      const response = await fetch(target.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8'
        }
      });
      const ttfb = Date.now() - startTime;
      const html = await response.text();
      const htmlSize = new TextEncoder().encode(html).length;
      
      // Extract resources
      const cssLinks = [...html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
      const cssLinks2 = [...html.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/gi)].map(m => m[1]);
      const allCss = [...new Set([...cssLinks, ...cssLinks2])];
      
      const scripts = [...html.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
      const images = [...html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => {
        const tag = m[0];
        return {
          src: m[1],
          loading: tag.match(/loading=["'](\w+)["']/i)?.[1] || 'eager',
          width: tag.match(/width=["'](\d+)["']/i)?.[1],
          height: tag.match(/height=["'](\d+)["']/i)?.[1]
        };
      });
      
      const preloads = [...html.matchAll(/<link[^>]*rel=["']preload["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map(m => ({
        url: m[1],
        as: m[0].match(/as=["'](\w+)["']/i)?.[1]
      }));
      
      const inlineStyles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1].length);
      const inlineScripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1].length);
      
      const iframes = [...html.matchAll(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
      
      // Detect third-party domains
      const allUrls = [...allCss, ...scripts, ...images.map(i => i.src), ...iframes];
      const thirdParty = allUrls.filter(u => {
        try {
          const host = new URL(u, target.url).hostname;
          return !host.includes('sealines.eu');
        } catch { return false; }
      });
      
      // Check for font loading
      const fontFaces = [...html.matchAll(/@font-face\s*\{[^}]*url\(['"]?([^'")\s]+)['"]?\)[^}]*\}/gi)].map(m => m[1]);
      const fontPreloads = preloads.filter(p => p.as === 'font');
      
      // Fetch sizes of key resources
      const resourceSizes = {};
      const resourcesToCheck = [...allCss.slice(0, 10), ...scripts.slice(0, 10)];
      
      await Promise.all(resourcesToCheck.map(async (url) => {
        try {
          const absUrl = url.startsWith('http') ? url : new URL(url, target.url).href;
          const r = await fetch(absUrl, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
          const size = parseInt(r.headers.get('content-length') || '0');
          resourceSizes[url] = { size, contentType: r.headers.get('content-type'), status: r.status };
        } catch(e) {
          resourceSizes[url] = { error: e.message };
        }
      }));
      
      // Check for render-blocking indicators
      const asyncScripts = [...html.matchAll(/<script[^>]*(async|defer)[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[2]);
      const blockingScripts = scripts.filter(s => !asyncScripts.includes(s));
      
      // Check meta tags
      const viewport = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1];
      const charset = html.match(/<meta[^>]*charset=["']?([^"'\s>]+)["']?[^>]*>/i)?.[1];
      
      // Check for critical rendering path issues  
      const hasDoctype = html.trimStart().toLowerCase().startsWith('<!doctype');
      
      results[target.name] = {
        status: response.status,
        ttfb_ms: ttfb,
        html_size_bytes: htmlSize,
        html_size_kb: Math.round(htmlSize / 1024 * 10) / 10,
        css_files: allCss.length,
        css_urls: allCss,
        js_files: scripts.length,
        js_urls: scripts,
        blocking_scripts: blockingScripts,
        async_defer_scripts: asyncScripts,
        images_total: images.length,
        images_eager: images.filter(i => i.loading === 'eager').length,
        images_lazy: images.filter(i => i.loading === 'lazy').length,
        images_detail: images,
        iframes: iframes,
        preloads: preloads,
        inline_styles_count: inlineStyles.length,
        inline_styles_total_chars: inlineStyles.reduce((a,b) => a+b, 0),
        inline_scripts_count: inlineScripts.length,
        inline_scripts_total_chars: inlineScripts.reduce((a,b) => a+b, 0),
        third_party_resources: thirdParty,
        font_faces: fontFaces,
        font_preloads: fontPreloads,
        resource_sizes: resourceSizes,
        viewport,
        charset,
        has_doctype: hasDoctype
      };
    } catch (e) {
      results[target.name] = { error: e.message };
    }
  }
  
  // Now try PSI API with a fresh approach (different user agent)
  for (const strategy of ['mobile', 'desktop']) {
    for (const [name, url] of [['homepage', 'https://www.sealines.eu'], ['traghetti_grecia', 'https://www.sealines.eu/traghetti-grecia']]) {
      if (strategy === 'desktop' && name === 'traghetti_grecia') continue; // skip desktop for internal page
      
      const key = `psi_${name}_${strategy}`;
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance`;
      
      try {
        const r = await fetch(apiUrl);
        const data = await r.json();
        
        if (data.error) {
          results[key] = { error: data.error.message?.substring(0, 200) };
        } else {
          const lr = data.lighthouseResult || {};
          const audits = lr.audits || {};
          const score = (lr.categories?.performance?.score || 0) * 100;
          
          const getMetric = (k) => ({ value: audits[k]?.numericValue, display: audits[k]?.displayValue, score: audits[k]?.score });
          
          const opportunities = [];
          for (const [k, audit] of Object.entries(audits)) {
            const d = audit.details || {};
            if (d.overallSavingsMs > 0 || d.overallSavingsBytes > 0) {
              opportunities.push({
                id: k, title: audit.title,
                savingsMs: d.overallSavingsMs, savingsBytes: d.overallSavingsBytes,
                items: (d.items || []).slice(0, 15).map(i => ({
                  url: (i.url || '').substring(0, 200),
                  wastedMs: i.wastedMs, wastedBytes: i.wastedBytes, totalBytes: i.totalBytes
                }))
              });
            }
          }
          
          const renderBlocking = (audits['render-blocking-resources']?.details?.items || []).map(i => ({
            url: i.url, totalBytes: i.totalBytes, wastedMs: i.wastedMs
          }));
          
          const largePayloads = (audits['total-byte-weight']?.details?.items || [])
            .filter(i => i.totalBytes > 100 * 1024)
            .map(i => ({ url: (i.url || '').substring(0, 200), totalBytes: i.totalBytes }));
          
          const fieldData = {};
          const loading = data.loadingExperience?.metrics || {};
          for (const [mk, mv] of Object.entries(loading)) {
            fieldData[mk] = { percentile: mv.percentile, category: mv.category };
          }
          
          results[key] = {
            score,
            metrics: {
              lcp: getMetric('largest-contentful-paint'),
              cls: getMetric('cumulative-layout-shift'),
              tbt: getMetric('total-blocking-time'),
              fcp: getMetric('first-contentful-paint'),
              si: getMetric('speed-index'),
              ttfb: getMetric('server-response-time'),
            },
            fieldData,
            opportunities,
            renderBlocking,
            largePayloads,
            failedAudits: Object.entries(audits)
              .filter(([_, a]) => a.score !== null && a.score !== undefined && a.score < 1)
              .map(([k, a]) => ({ id: k, title: a.title, score: a.score, display: a.displayValue }))
          };
        }
      } catch(e) {
        results[key] = { error: e.message };
      }
    }
  }
  
  res.status(200).json(results);
}
