export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const params = { ...req.query };
    const envKey = process.env.BSCSCAN_API_KEY;
    if (envKey) params.apikey = envKey;
    if (!params.apikey) params.apikey = 'YourApiKeyToken';

    const qs = new URLSearchParams(params).toString();
    const url = `https://api.bscscan.com/api?${qs}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'flowfi/1.0' }
    });

    if (!response.ok) {
      return res.status(502).json({
        status: '0',
        message: `BscScan returned HTTP ${response.status}`,
        result: []
      });
    }

    const data = await response.json();
    console.log(`[bsc proxy] action=${params.action} address=${params.address?.slice(0,10)} status=${data.status} count=${Array.isArray(data.result) ? data.result.length : data.result}`);
    return res.status(200).json(data);

  } catch (err) {
    console.error('[bsc proxy error]', err.message);
    return res.status(500).json({
      status: '0',
      message: `Proxy error: ${err.message}`,
      result: []
    });
  }
}
