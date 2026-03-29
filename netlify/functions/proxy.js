// ── Netlify Function: proxy.js ────────────────────────────────────────────
// Yahoo Finance / 기타 GET 프록시

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const targetUrl = event.queryStringParameters?.url;
  if (!targetUrl) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'url parameter required' }) };
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; portfolio-app/1.0)',
        'Accept': 'application/json',
      },
    });
    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { ...headers, 'Content-Type': res.headers.get('content-type') || 'application/json' },
      body: text,
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
