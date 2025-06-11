export async function fetchBtcAndFng() {
  const card = document.getElementById('btc-fng-card');
  const priceCanvas = document.getElementById('btcFngChart');
  const gaugeCanvas = document.getElementById('fngGauge');
  if (!priceCanvas || !card || !gaugeCanvas) return;

  try {
    const [fngRes, btcRes] = await Promise.all([
      fetch('https://api.alternative.me/fng/?limit=30'),
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily')
    ]);
    const fngJson = await fngRes.json();
    const btcJson = await btcRes.json();
    const fngData = fngJson.data.reverse();
    const btcPrices = btcJson.prices;

    const labels = fngData.map(e => new Date(e.timestamp * 1000).toISOString().split('T')[0]);
    const fngValues = fngData.map(e => Number(e.value));
    const btcValues = btcPrices.map(p => p[1]);
    const latestFng = fngValues[fngValues.length - 1];

    card.querySelector('.error-message')?.remove();
    priceCanvas.style.display = 'block';

    new Chart(priceCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'BTC Precio (USD)',
            data: btcValues,
            borderColor: '#ff9900',
            tension: 0.1,
            fill: false,
            yAxisID: 'y'
          },
          {
            label: 'Fear & Greed',
            data: fngValues,
            borderColor: '#007bff',
            tension: 0.1,
            fill: false,
            yAxisID: 'fng'
          }
        ]
      },
      options: {
        maintainAspectRatio: true,
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Precio USD' }
          },
          fng: {
            type: 'linear',
            position: 'right',
            min: 0,
            max: 100,
            title: { display: true, text: 'F&G' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });

    new Chart(gaugeCanvas.getContext('2d'), {
      type: 'gauge',
      data: {
        datasets: [{
          value: latestFng,
          data: [25, 25, 25, 25],
          minValue: 0,
          backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745']
        }]
      },
      options: {
        responsive: true,
        needle: { radius: '2%', width: '3.2%', length: '80%' },
        valueLabel: { display: true }
      }
    });
  } catch (err) {
    console.error('Error fetching BTC & FNG data', err);
    priceCanvas.style.display = 'none';
    card.querySelector('.error-message')?.remove();
    const msg = document.createElement('div');
    msg.className = 'text-danger error-message';
    msg.textContent = 'Datos de BTC/F&G no disponibles';
    card.appendChild(msg);
  }
}

export async function fetchGoogleNews() {
  const list = document.getElementById('google-news-list');
  if (!list) return;
  try {
    const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/search?q=bitcoin', {cache: 'no-store'});
    const data = await res.json();
    list.innerHTML = '';
    data.items.slice(0, 10).forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      const date = new Date(item.pubDate).toLocaleDateString();
      const snippet = item.description || item.contentSnippet || '';
      li.innerHTML = `
        <div class="news-item">
          <a href="${item.link}" target="_blank">${item.title || 'Sin título'}</a>
          <small class="text-muted d-block">${date}</small>
          <p class="mb-0">${snippet}</p>
        </div>`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Error fetching news', err);
    list.innerHTML = '<li class="list-group-item text-danger">No se pudo cargar el feed</li>';
  }
}

export async function fetchRayData() {
  const priceCanvas = document.getElementById('rayPriceChart');
  const volumeCanvas = document.getElementById('rayVolumeChart');
  if (!priceCanvas || !volumeCanvas) return;

  try {
    const [rayRes, cakeRes, cetusRes] = await Promise.all([
      fetch(
        'https://api.coingecko.com/api/v3/coins/raydium/market_chart?vs_currency=usd&days=30&interval=daily'
      ),
      fetch(
        'https://api.coingecko.com/api/v3/coins/pancakeswap-token/market_chart?vs_currency=usd&days=30&interval=daily'
      ),
      fetch(
        'https://api.coingecko.com/api/v3/coins/cetus-protocol/market_chart?vs_currency=usd&days=30&interval=daily'
      )
    ]);

    if (!rayRes.ok) throw new Error('Failed to fetch RAY data');
    if (!cakeRes.ok) throw new Error('Failed to fetch CAKE data');
    if (!cetusRes.ok) throw new Error('Failed to fetch CETUS data');

    const rayJson = await rayRes.json();
    const cakeJson = await cakeRes.json();
    const cetusJson = await cetusRes.json();

    const labels = rayJson.prices.map(p =>
      new Date(p[0]).toISOString().split('T')[0]
    );
    const rayPrices = rayJson.prices.map(p => p[1]);
    const rayVolumes = rayJson.total_volumes.map(v => v[1]);
    const cakeVolumes = cakeJson.total_volumes.map(v => v[1]);
    const cetusVolumes = cetusJson.total_volumes.map(v => v[1]);

    const sma = rayPrices.map((_, idx, arr) => {
      const start = Math.max(0, idx - 6);
      const slice = arr.slice(start, idx + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      return sum / slice.length;
    });

    new Chart(priceCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'RAY Precio (USD)', data: rayPrices, borderColor: '#6610f2', tension: 0.1, fill: false },
          { label: 'SMA 7d', data: sma, borderColor: '#20c997', borderDash: [5,5], tension: 0.1, fill: false }
        ]
      },
      options: { maintainAspectRatio: true }
    });

    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    new Chart(volumeCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['RAY', 'CAKE', 'CETUS'],
        datasets: [
          {
            label: 'Promedio Volumen 30d',
            data: [avg(rayVolumes), avg(cakeVolumes), avg(cetusVolumes)],
            backgroundColor: ['#6610f2', '#f3ba2f', '#20c997']
          }
        ]
      },
      options: { maintainAspectRatio: true }
    });
  } catch (err) {
    console.error('Error fetching RAY data', err);
  }
}

export async function fetchDefiComparison() {
  const tableBody = document.querySelector('#defi-table tbody');
  const errorEl = document.getElementById('defi-error');
  if (!tableBody) return;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString();

  const protocols = [
    { id: 'raydium', cg: 'raydium', repo: 'raydium-io/raydium-ui', type: 'dex' },
    { id: 'orca', cg: 'orca', repo: 'orca-so/whirlpools', type: 'dex' },
    { id: 'jupiter', cg: 'jupiter', repo: 'jup-ag/jupiter-react-native', type: 'aggregator' },
    { id: 'pancakeswap', cg: 'pancakeswap-token', repo: 'pancakeswap/pancake-frontend', type: 'dex' },
    { id: 'cetus', cg: 'cetus-protocol', repo: 'cetus-labs/cetus-amm', type: 'dex' }
  ];

  try {
    const data = await Promise.all(
      protocols.map(async p => {
        const volumeUrl =
          p.type === 'aggregator'
            ? `https://api.llama.fi/summary/aggregators/${p.id}`
            : `https://api.llama.fi/summary/dexs/${p.id}`;
        const volume24h = await fetch(volumeUrl)
          .then(r => r.json())
          .then(d => d.total24h)
          .catch(() => null);

        const tvl = await fetch(`https://api.llama.fi/protocol/${p.id}`)
          .then(r => r.json())
          .then(d => d.tvl[d.tvl.length - 1]?.totalLiquidityUSD)
          .catch(() => null);

        const fees24h = await fetch(`https://api.llama.fi/summary/fees/${p.id}`)
          .then(r => r.json())
          .then(d => d.total24h)
          .catch(() => null);
        const annualFees = fees24h != null ? fees24h * 365 : null;

        const marketCap = await fetch(
          `https://api.coingecko.com/api/v3/coins/${p.cg}`
        )
          .then(r => r.json())
          .then(d => d.market_data?.market_cap?.usd)
          .catch(() => null);

        const commits = await fetch(
          `https://api.github.com/repos/${p.repo}/commits?since=${since}`
        )
          .then(r => r.json())
          .then(arr => (Array.isArray(arr) ? arr.length : null))
          .catch(() => null);

        return { name: p.id.toUpperCase(), volume24h, tvl, annualFees, marketCap, commits };
      })
    );

    tableBody.innerHTML = '';
    const maxes = {
      volume24h: Math.max(...data.map(d => d.volume24h || 0)),
      tvl: Math.max(...data.map(d => d.tvl || 0)),
      annualFees: Math.max(...data.map(d => d.annualFees || 0)),
      marketCap: Math.max(...data.map(d => d.marketCap || 0)),
      commits: Math.max(...data.map(d => d.commits || 0))
    };

    const fmt = n =>
      n != null ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : 'N/A';

    data.forEach(d => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${d.name}</td>
        <td class="${d.volume24h === maxes.volume24h ? 'leader' : ''}" data-sort="${d.volume24h || 0}">${fmt(d.volume24h)}</td>
        <td class="${d.tvl === maxes.tvl ? 'leader' : ''}" data-sort="${d.tvl || 0}">${fmt(d.tvl)}</td>
        <td class="${d.annualFees === maxes.annualFees ? 'leader' : ''}" data-sort="${d.annualFees || 0}">${fmt(d.annualFees)}</td>
        <td class="${d.marketCap === maxes.marketCap ? 'leader' : ''}" data-sort="${d.marketCap || 0}">${fmt(d.marketCap)}</td>
        <td class="${d.commits === maxes.commits ? 'leader' : ''}" data-sort="${d.commits || 0}">${d.commits ?? 'N/A'}</td>
      `;
      tableBody.appendChild(row);
    });

    errorEl.textContent = '';
  } catch (err) {
    console.error('Error fetching DeFi data', err);
    errorEl.textContent = 'No se pudo cargar la tabla DeFi';
  }
}

function makeSortable(table) {
  const headers = table.querySelectorAll('th');
  headers.forEach((th, idx) => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => sortTable(table, idx));
  });
}

function sortTable(table, idx) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const asc = table.dataset.sortAsc === '1';
  rows.sort((a, b) => {
    const av = parseFloat(a.children[idx].dataset.sort || 0);
    const bv = parseFloat(b.children[idx].dataset.sort || 0);
    return asc ? av - bv : bv - av;
  });
  table.dataset.sortAsc = asc ? '0' : '1';
  rows.forEach(r => tbody.appendChild(r));
}

export function initTradingView() {
  if (!window.TradingView) return;
  new TradingView.widget({
    container_id: 'ethbtc-chart',
    width: '100%',
    height: 300,
    symbol: 'BINANCE:ETHBTC',
    interval: 'D',
    timezone: 'Etc/UTC',
    theme: 'light',
    style: '1',
    locale: 'en'
  });
}

function initDashboard() {
  fetchBtcAndFng();
  fetchGoogleNews();
  fetchRayData();
  fetchDefiComparison();
  initTradingView();
  const defiTable = document.getElementById('defi-table');
  if (defiTable) makeSortable(defiTable);
  setInterval(fetchGoogleNews, 300000);
  setInterval(fetchDefiComparison, 300000);
}

// Initialize when DOM is ready
if (document.readyState !== 'loading') {
  initDashboard();
} else {
  document.addEventListener('DOMContentLoaded', initDashboard);
}
