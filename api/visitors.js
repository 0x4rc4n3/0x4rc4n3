// Real visitor counter. Vercel Function backed by Redis (Upstash, added from Vercel > Storage).
// GET  -> { count }            read the current number
// POST -> { count }            count this browser once, then return the number
const KEY = 'portfolio:visitors';
const url = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const BOT = /bot|crawl|spider|slurp|headless|preview|facebookexternalhit|monitor|curl|wget|python-requests|lighthouse/i;

async function redis(cmd) {
  const r = await fetch(url(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method not allowed' });
  }
  if (!url() || !token()) return res.status(503).json({ error: 'counter not configured' });
  try {
    if (req.method === 'POST') {
      // only count requests that come from this site's own pages (not scripts hitting the URL directly)
      const fetchSite = req.headers['sec-fetch-site'];
      const originHost = req.headers.origin ? new URL(req.headers.origin).host : '';
      const sameSite = fetchSite ? fetchSite === 'same-origin' : originHost === req.headers.host;
      if (!sameSite) return res.status(403).json({ error: 'forbidden' });
      if (BOT.test(String(req.headers['user-agent'] || ''))) {
        return res.status(200).json({ count: Number((await redis(['GET', KEY])) || 0) });
      }
      return res.status(200).json({ count: Number(await redis(['INCR', KEY])) });
    }
    return res.status(200).json({ count: Number((await redis(['GET', KEY])) || 0) });
  } catch {
    return res.status(502).json({ error: 'counter unavailable' });
  }
}
