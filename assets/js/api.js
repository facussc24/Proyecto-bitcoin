const TIMEOUT = 8000;

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

async function getJSON(url, retries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      await new Promise(r => setTimeout(r, 100));
    }
  }
  throw lastErr;
}

/** CoinGecko: precios y cambios 24h */
export async function fetchSnapshot() {
  console.log('fetchSnapshot');
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
  console.log('fetchEthBtc');
  try {
    const [eth, btc] = await Promise.all([
      getJSON(
        'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily'
      ),
      getJSON(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily'
      ),
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
export const VOLUME_PROTOCOLS = [
  { id: 'raydium', symbol: 'RAY' },
  { id: 'pancakeswap-token', symbol: 'CAKE' },
  { id: 'cetus-protocol', symbol: 'CETUS' },
  { id: 'orca', symbol: 'ORCA' },
  { id: 'uniswap', symbol: 'UNI' },
  { id: 'sushi', symbol: 'SUSHI' },
  { id: 'curve-dao-token', symbol: 'CRV' },
  { id: '1inch', symbol: '1INCH' },
];

export async function fetchVolumes() {
  console.log('fetchVolumes');
  const protocols = VOLUME_PROTOCOLS;

  const results = await Promise.allSettled(
    protocols.map(p =>
      getJSON(
        `https://api.coingecko.com/api/v3/coins/${p.id}/market_chart?vs_currency=usd&days=30&interval=daily`
      )
    )
  );

  let labels = [];
  const datasets = [];
  results.forEach((res, idx) => {
    const proto = protocols[idx];
    if (res.status === 'fulfilled' && Array.isArray(res.value.total_volumes)) {
      if (!labels.length) {
        labels = res.value.total_volumes.map(v =>
          new Date(v[0]).toISOString().split('T')[0]
        );
      }
      datasets.push({
        label: proto.symbol,
        data: res.value.total_volumes.map(v => v[1]),
      });
    } else {
      console.error(`Volúmenes ${proto.symbol}`, res.reason);
    }
  });

  return { labels, datasets };
}

/** Alternative.me: Fear & Greed */
export async function fetchGauge() {
  console.log('fetchGauge');
  try {
    const data = await getJSON('https://api.alternative.me/fng/?limit=1&format=json');
    const latest = data.data[0];
    return {
      value: Number(latest.value),
      classification: latest.value_classification,
    };
  } catch (err) {
    console.error('F&G', err);
    throw err;
  }
}

/** Noticias vía RSS */
export async function fetchNews() {
  console.log('fetchNews');
  const rss = 'https://news.google.com/rss/search?q=cryptocurrency&hl=es&gl=ES&ceid=ES:es';
  const url = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`)}`;
  try {
    const data = await getJSON(url);
    const json = typeof data.contents === 'string' ? JSON.parse(data.contents) : data;
    return json.items.slice(0, 5).map(it => ({ title: it.title, link: it.link, date: it.pubDate }));
  } catch (err) {
    console.error('Noticias', err);
    throw err;
  }
}
