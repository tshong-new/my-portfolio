// ── Netlify Function: proxy.js ────────────────────────────────────────────
// Yahoo Finance + Claude API 프록시
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // ── Claude API 프록시 ──────────────────────────────────────────────────
  if (event.httpMethod === 'POST' && event.path.includes('proxy')) {
    try {
      const body = JSON.parse(event.body || '{}');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return { statusCode: res.status, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  // ── Yahoo Finance / 기타 GET 프록시 ───────────────────────────────────
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
