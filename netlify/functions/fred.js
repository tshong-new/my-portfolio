exports.handler = async (event) => {
  try {
    // FRED 직접 접근 — 서버사이드라 CORS 없음
    const urls = [
      'https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAMLH0A0HYM2',
      'https://fred.stlouisfed.org/data/BAMLH0A0HYM2.txt',
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,text/plain,application/xhtml+xml,*/*',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          redirect: 'follow',
        });

        if (!res.ok) continue;
        const text = await res.text();

        // 파싱: DATE,VALUE 또는 공백 구분
        const lines = text.trim().split('\n');
        let lastVal = null, lastDate = null;

        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (!line || line.startsWith('DATE') || line.startsWith('observation')) continue;
          // CSV: 2024-03-01,3.25  or TXT: 2024-03-01  3.25
          const parts = line.split(/[,\s]+/).filter(Boolean);
          if (parts.length >= 2 && parts[1] !== '.') {
            const val = parseFloat(parts[1]);
            if (!isNaN(val)) {
              lastVal = val;
              lastDate = parts[0];
              break;
            }
          }
        }

        if (lastVal !== null) {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'max-age=3600',
            },
            body: JSON.stringify({ value: lastVal, date: lastDate }),
          };
        }
      } catch(e) { continue; }
    }

    return {
      statusCode: 503,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'FRED 조회 실패' }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
