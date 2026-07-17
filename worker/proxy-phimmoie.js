// Cloudflare Worker — CORS proxy for phimmoie.fm (PhimMoiChill).
// phimmoie.fm is server-rendered but sends no Access-Control-Allow-Origin, so the
// TV app can't fetch its pages directly. This relays the HTML with CORS headers.
// The stream itself (opstream90 .m3u8) already sends CORS:* and is played direct
// by hls.js — it does NOT go through this worker.
//
// Deploy: Workers & Pages -> Create Worker -> paste -> Deploy, then put the
//   workers.dev URL into app.js:  const CORS = '.../fetch?url='

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (request.method === 'POST') {
    const body = await request.text().catch(() => '(unreadable)');
    console.log('[TV]', body);
    return new Response('ok', { headers: corsHeaders() });
  }

  const reqUrl = new URL(request.url);
  if (reqUrl.pathname !== '/fetch') {
    return new Response('Not found', { status: 404, headers: corsHeaders() });
  }

  const target = reqUrl.searchParams.get('url');
  if (!target) return new Response('Missing url', { status: 400, headers: corsHeaders() });
  let host;
  try { host = new URL(target).hostname; } catch (_) {
    return new Response('Invalid url', { status: 400, headers: corsHeaders() });
  }
  if (!host.endsWith('phimmoie.fm')) {
    return new Response('Host not allowed: ' + host, { status: 403, headers: corsHeaders() });
  }

  const r = await fetch(target, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'vi,en;q=0.9',
      'Referer': 'https://phimmoie.fm/',
    },
  });
  const text = await r.text();
  return new Response(text, {
    status: r.status,
    headers: { ...corsHeaders(), 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
