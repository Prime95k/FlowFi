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

    // Etherscan V2 supports BSC via chainid=56
    params.chainid = '56';

    const qs = new URLSearchParams(params).toString();
    // V2 endpoint (same base URL, different chainid)
    const url = `https://api.etherscan.io/v2/api?${qs}`;

    const response = await fetch(url, { headers: { 'User-Agent': 'flowfi/1.0' } });
    if (!response.ok) {
      return res.status(502).json({ status: '0', message: `BscScan HTTP ${response.status}`, result: [] });
    }

    const data = await response.json();
    console.log(`[bsc v2] action=${params.action} status=${data.status} count=${Array.isArray(data.result) ? data.result.length : data.result}`);
    return res.status(200).json(data);

  } catch (err) {
    console.error('[bsc proxy error]', err.message);
    return res.status(500).json({ status: '0', message: `Proxy error: ${err.message}`, result: [] });
  }
}
