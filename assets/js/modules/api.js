const TIMEOUT = 8000;

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

async function getJSON(url) {
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** CoinGecko: precios y cambios 24h */
export async function fetchSnapshot() {
  try {
    return await getJSON(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,raydium&vs_currencies=usd&include_24hr_change=true'
    );
  } catch (err) {
    console.error('Snapshot', err);
    throw err;
  }
}

/** CoinGecko: histórico ETH/BTC */
export async function fetchEthBtc() {
  try {
    const [eth, btc] = await Promise.all([
      getJSON('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily'),
      getJSON('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily'),
    ]);
    const labels = eth.prices.map(p => new Date(p[0]).toISOString().split('T')[0]);
    const ratios = eth.prices.map((p, i) => p[1] / btc.prices[i][1]);
    return { labels, ratios };
  } catch (err) {
    console.error('ETH/BTC', err);
    throw err;
  }
}

/** CoinGecko: volúmenes de varios tokens */
export async function fetchVolumes() {
  try {
    const [ray, cake, cetus, orca] = await Promise.all([
      getJSON('https://api.coingecko.com/api/v3/coins/raydium/market_chart?vs_currency=usd&days=30&interval=daily'),
      getJSON('https://api.coingecko.com/api/v3/coins/pancakeswap-token/market_chart?vs_currency=usd&days=30&interval=daily'),
      getJSON('https://api.coingecko.com/api/v3/coins/cetus-protocol/market_chart?vs_currency=usd&days=30&interval=daily'),
      getJSON('https://api.coingecko.com/api/v3/coins/orca/market_chart?vs_currency=usd&days=30&interval=daily'),
    ]);
    const labels = ray.total_volumes.map(v => new Date(v[0]).toISOString().split('T')[0]);
    const rayVol = ray.total_volumes.map(v => v[1]);
    const cakeVol = cake.total_volumes.map(v => v[1]);
    const cetusVol = cetus.total_volumes.map(v => v[1]);
    const orcaVol = orca.total_volumes.map(v => v[1]);
    return { labels, rayVol, cakeVol, cetusVol, orcaVol };
  } catch (err) {
    console.error('Volúmenes', err);
    throw err;
  }
}

/** Alternative.me: Fear & Greed */
export async function fetchGauge() {
  try {
    const data = await getJSON('https://api.alternative.me/fng/?limit=1&format=json');
    return Number(data.data[0].value);
  } catch (err) {
    console.error('F&G', err);
    throw err;
  }
}

/** Noticias vía RSS */
export async function fetchNews() {
  try {
    const data = await getJSON('https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/search?q=cryptocurrency&hl=es&gl=ES&ceid=ES:es');
    return data.items.slice(0, 5).map(it => ({ title: it.title, link: it.link, date: it.pubDate }));
  } catch (err) {
    console.error('Noticias', err);
    throw err;
  }
}
