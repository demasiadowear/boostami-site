export default async function handler(req, res) {
  const targets = [
    { url: 'https://www.sealines.eu', name: 'homepage' },
    { url: 'https://www.sealines.eu/traghetti-grecia', name: 'traghetti_grecia' }
  ];
  
  const results = {};
  
  // Fetch and measure individual resources
  async function getResourceSize(url) {
    try {
      const absUrl = url.startsWith('//') ? 'https:' + url : url;
      const r = await fetch(absUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const body = await r.arrayBuffer();
      return { size: body.byteLength, status: r.status, contentType: r.headers.get('content-type') };
    } catch(e) {
      return { error: e.message };
    }
  }
  
  for (const target of targets) {
    try {
      // Multiple TTFB measurements
      const ttfbMeasurements = [];
      for (let i = 0; i < 3; i++) {
        const start = Date.now();
        const response = await fetch(target.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Accept': 'text/html',
            'Accept-Language': 'it-IT,it;q=0.9',
            'Cache-Control': 'no-cache'
          }
        });
        const ttfb = Date.now() - start;
        ttfbMeasurements.push(ttfb);
        if (i === 0) {
          var html = await response.text();
          var htmlSize = new TextEncoder().encode(html).length;
        } else {
          await response.text();
        }
      }
      
      // Extract all CSS from link tags (both orderings of attributes)
      const cssLinks = [...html.matchAll(/<link[^>]*(?:rel=["']stylesheet["'][^>]*href=["']([^"']+)["']|href=["']([^"']+)["'][^>]*rel=["']stylesheet["'])[^>]*>/gi)]
        .map(m => m[1] || m[2]).filter(Boolean);
      
      // Extract stylesheets from wp_head or similar
      const allStylesheets = [...new Set(cssLinks)];
      
      // Extract JS with attributes
      const scriptTags = [...html.matchAll(/<script([^>]*)(?:src=["']([^"']+)["'])([^>]*)>/gi)];
      const jsResources = scriptTags.map(m => {
        const attrs = m[1] + ' ' + m[3];
        return {
          url: m[2],
          async: /\basync\b/i.test(attrs),
          defer: /\bdefer\b/i.test(attrs),
          type: (attrs.match(/type=["']([^"']+)["']/i) || [])[1],
          id: (attrs.match(/id=["']([^"']+)["']/i) || [])[1]
        };
      });
      
      // Detect additional resources loaded via wp_head, preconnect, dns-prefetch
      const preconnects = [...html.matchAll(/<link[^>]*rel=["'](?:preconnect|dns-prefetch)["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
      
      // Detect if page uses WordPress
      const isWordpress = html.includes('wp-content') || html.includes('wp-includes') || html.includes('wp-json');
      
      // Detect inline CSS and JS volumes  
      const inlineStyles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
      const inlineScripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
      
      // Find images with full attribute details
      const imgTags = [...html.matchAll(/<img([^>]*)>/gi)].map(m => {
        const tag = m[1];
        return {
          src: (tag.match(/src=["']([^"']+)["']/i) || [])[1] || '',
          srcset: (tag.match(/srcset=["']([^"']+)["']/i) || [])[1] || '',
          loading: (tag.match(/loading=["'](\w+)["']/i) || [])[1] || 'eager',
          width: (tag.match(/width=["'](\d+)["']/i) || [])[1],
          height: (tag.match(/height=["'](\d+)["']/i) || [])[1],
          decoding: (tag.match(/decoding=["'](\w+)["']/i) || [])[1],
          fetchpriority: (tag.match(/fetchpriority=["'](\w+)["']/i) || [])[1]
        };
      });
      
      // Count non-data images  
      const externalImages = imgTags.filter(i => !i.src.startsWith('data:'));
      
      // Get sizes of JS resources
      const jsSizes = {};
      await Promise.all(jsResources.slice(0, 15).map(async (js) => {
        const size = await getResourceSize(js.url);
        jsSizes[js.url] = size;
      }));
      
      // Get sizes of CSS resources
      const cssSizes = {};
      await Promise.all(allStylesheets.slice(0, 15).map(async (css) => {
        const absUrl = css.startsWith('http') ? css : new URL(css, target.url).href;
        const size = await getResourceSize(absUrl);
        cssSizes[css] = size;
      }));
      
      // Detect compression header
      const compCheck = await fetch(target.url, {
        headers: { 'Accept-Encoding': 'gzip, deflate, br', 'User-Agent': 'Mozilla/5.0' }
      });
      const contentEncoding = compCheck.headers.get('content-encoding');
      const transferSize = parseInt(compCheck.headers.get('content-length') || '0');
      await compCheck.text();
      
      // Check response headers
      const headerCheck = await fetch(target.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const cacheControl = headerCheck.headers.get('cache-control');
      const serverHeader = headerCheck.headers.get('server');
      const xPoweredBy = headerCheck.headers.get('x-powered-by');
      await headerCheck.text();
      
      results[target.name] = {
        ttfb_measurements_ms: ttfbMeasurements,
        ttfb_avg_ms: Math.round(ttfbMeasurements.reduce((a,b) => a+b, 0) / ttfbMeasurements.length),
        html_size_bytes: htmlSize,
        html_size_kb: Math.round(htmlSize / 1024 * 10) / 10,
        html_transfer_size: transferSize,
        content_encoding: contentEncoding,
        cache_control: cacheControl,
        server: serverHeader,
        x_powered_by: xPoweredBy,
        is_wordpress: isWordpress,
        css_external_count: allStylesheets.length,
        css_external_urls: allStylesheets,
        css_sizes: cssSizes,
        js_resources: jsResources,
        js_sizes: jsSizes,
        preconnects,
        images_total: imgTags.length,
        images_external: externalImages.length,
        images_data_uri: imgTags.length - externalImages.length,
        images_eager: imgTags.filter(i => i.loading === 'eager').length,
        images_lazy: imgTags.filter(i => i.loading === 'lazy').length,
        images_without_dimensions: externalImages.filter(i => !i.width || !i.height).length,
        external_images_detail: externalImages.slice(0, 30),
        inline_styles_count: inlineStyles.length,
        inline_styles_total_bytes: inlineStyles.reduce((a, m) => a + m[1].length, 0),
        inline_scripts_count: inlineScripts.length,
        inline_scripts_total_bytes: inlineScripts.reduce((a, m) => a + m[1].length, 0),
        iframes: [...html.matchAll(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1])
      };
    } catch (e) {
      results[target.name] = { error: e.message };
    }
  }
  
  res.status(200).json(results);
}
