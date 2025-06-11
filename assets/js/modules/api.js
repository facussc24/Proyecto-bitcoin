export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function getPrices() {
  return fetchJSON(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,raydium&vs_currencies=usd&include_24hr_change=true'
  );
}

export async function getEthBtc() {
  const [eth, btc] = await Promise.all([
    fetchJSON('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily'),
    fetchJSON('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily'),
  ]);
  const labels = eth.prices.map(p => new Date(p[0]).toISOString().split('T')[0]);
  const ratios = eth.prices.map((p, i) => p[1] / btc.prices[i][1]);
  return { labels, ratios };
}

export async function getVolumes() {
  const [ray, cake, cetus, orca] = await Promise.all([
    fetchJSON('https://api.coingecko.com/api/v3/coins/raydium/market_chart?vs_currency=usd&days=30&interval=daily'),
    fetchJSON('https://api.coingecko.com/api/v3/coins/pancakeswap-token/market_chart?vs_currency=usd&days=30&interval=daily'),
    fetchJSON('https://api.coingecko.com/api/v3/coins/cetus-protocol/market_chart?vs_currency=usd&days=30&interval=daily'),
    fetchJSON('https://api.coingecko.com/api/v3/coins/orca/market_chart?vs_currency=usd&days=30&interval=daily'),
  ]);

  const labels = ray.total_volumes.map(v => new Date(v[0]).toISOString().split('T')[0]);
  const rayVol = ray.total_volumes.map(v => v[1]);
  const cakeVol = cake.total_volumes.map(v => v[1]);
  const cetusVol = cetus.total_volumes.map(v => v[1]);
  const orcaVol = orca.total_volumes.map(v => v[1]);
  return { labels, rayVol, cakeVol, cetusVol, orcaVol };
}

export async function getFng() {
  const data = await fetchJSON('https://api.alternative.me/fng/?limit=1&format=json');
  return Number(data.data[0].value);
}

export async function getNews() {
  const data = await fetchJSON('https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/search?q=cryptocurrency&hl=es&gl=ES&ceid=ES:es');
  return data.items.slice(0, 5).map(item => ({
    title: item.title,
    link: item.link,
    date: item.pubDate,
  }));
}
