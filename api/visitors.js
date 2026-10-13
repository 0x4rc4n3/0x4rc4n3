// Real visitor counter. Vercel Function backed by Redis (Upstash, added from Vercel > Storage).
// GET  -> { count }            read the current number
// POST -> { count }            increment on each page view, then return the number
const KEY = 'portfolio:visitors';
const url = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
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
    if (req.method === 'POST') return res.status(200).json({ count: Number(await redis(['INCR', KEY])) });
    return res.status(200).json({ count: Number((await redis(['GET', KEY])) || 0) });
  } catch {
    return res.status(502).json({ error: 'counter unavailable' });
  }
}
