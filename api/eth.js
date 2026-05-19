export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const params = { ...req.query };
    const envKey = process.env.ETHERSCAN_API_KEY;
    if (envKey) params.apikey = envKey;
    if (!params.apikey) params.apikey = 'YourApiKeyToken';

    // Etherscan V2 — chainid=1 for Ethereum Mainnet
    params.chainid = '1';

    const qs = new URLSearchParams(params).toString();
    // V2 endpoint
    const url = `https://api.etherscan.io/v2/api?${qs}`;

    const response = await fetch(url, { headers: { 'User-Agent': 'flowfi/1.0' } });
    if (!response.ok) {
      return res.status(502).json({ status: '0', message: `Etherscan HTTP ${response.status}`, result: [] });
    }

    const data = await response.json();
    console.log(`[eth v2] action=${params.action} status=${data.status} count=${Array.isArray(data.result) ? data.result.length : data.result}`);
    return res.status(200).json(data);

  } catch (err) {
    console.error('[eth proxy error]', err.message);
    return res.status(500).json({ status: '0', message: `Proxy error: ${err.message}`, result: [] });
  }
}
