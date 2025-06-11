// Elementos de los gráficos
const ethbtcCtx = document.getElementById('ethbtcChart');
const volumeCtx = document.getElementById('volumeChart');
const fngCtx = document.getElementById('fngGauge');

let ethbtcChart;
let volumeChart;
let fngChart;

// ---- Obtención de precios y variaciones ----
async function loadPrices() {
  const errorEl = document.getElementById('prices-error');
  const updatedEl = document.getElementById('prices-updated');
  errorEl.textContent = '';
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,raydium&vs_currencies=usd&include_24hr_change=true'
    );
    const data = await res.json();

    updatePrice('btc', data.bitcoin.usd, data.bitcoin.usd_24h_change);
    updatePrice('eth', data.ethereum.usd, data.ethereum.usd_24h_change);
    updatePrice('ray', data.raydium.usd, data.raydium.usd_24h_change);

    updatedEl.textContent = 'Última actualización: ' + new Date().toLocaleTimeString();
  } catch (err) {
    console.error('Error en precios', err);
    errorEl.textContent = 'Datos no disponibles';
  }
}

function updatePrice(prefix, price, change) {
  const priceEl = document.getElementById(prefix + '-price');
  const changeEl = document.getElementById(prefix + '-change');
  priceEl.textContent = '$' + price.toLocaleString('en-US');
  const arrow = change >= 0 ? 'bi-arrow-up' : 'bi-arrow-down';
  changeEl.innerHTML = `<i class="bi ${arrow}"></i> ${change.toFixed(2)}%`;
  changeEl.className = change >= 0 ? 'price-change-up' : 'price-change-down';
}

// ---- Gráfico ETH/BTC ----
async function loadEthBtc() {
  const loading = document.getElementById('ethbtc-loading');
  const errorEl = document.getElementById('ethbtc-error');
  loading.style.display = 'block';
  errorEl.textContent = '';

  try {
    const [ethRes, btcRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily'),
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily')
    ]);
    const eth = await ethRes.json();
    const btc = await btcRes.json();

    const labels = eth.prices.map(p => new Date(p[0]).toISOString().split('T')[0]);
    const ratios = eth.prices.map((p, i) => p[1] / btc.prices[i][1]);

    ethbtcChart?.destroy();
    ethbtcChart = new Chart(ethbtcCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'ETH/BTC',
          data: ratios,
          borderColor: '#0dcaf0',
          tension: 0.2,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { title: { display: false } },
          y: { title: { display: 'Ratio' } }
        }
      }
    });

    ethbtcCtx.style.display = 'block';
  } catch (err) {
    console.error('Error ETH/BTC', err);
    errorEl.textContent = 'Datos no disponibles';
  } finally {
    loading.style.display = 'none';
  }
}

// ---- Gráfico de volúmenes ----
async function loadVolumes() {
  const loading = document.getElementById('volume-loading');
  const errorEl = document.getElementById('volume-error');
  const summaryEl = document.getElementById('volume-summary');
  loading.style.display = 'block';
  errorEl.textContent = '';

  try {
    const [rayRes, cakeRes, cetusRes, orcaRes, uniRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/coins/raydium/market_chart?vs_currency=usd&days=30&interval=daily'),
      fetch('https://api.coingecko.com/api/v3/coins/pancakeswap-token/market_chart?vs_currency=usd&days=30&interval=daily'),
      fetch('https://api.coingecko.com/api/v3/coins/cetus-protocol/market_chart?vs_currency=usd&days=30&interval=daily'),
      fetch('https://api.coingecko.com/api/v3/coins/orca/market_chart?vs_currency=usd&days=30&interval=daily'),
      fetch('https://api.coingecko.com/api/v3/coins/uniswap/market_chart?vs_currency=usd&days=30&interval=daily')
    ]);

    const [ray, cake, cetus, orca, uni] = await Promise.all([
      rayRes.json(),
      cakeRes.json(),
      cetusRes.json(),
      orcaRes.json(),
      uniRes.json()
    ]);

    const labels = ray.total_volumes.map(v => new Date(v[0]).toISOString().split('T')[0]);
    const rayVol = ray.total_volumes.map(v => v[1]);
    const cakeVol = cake.total_volumes.map(v => v[1]);
    const cetusVol = cetus.total_volumes.map(v => v[1]);
    const orcaVol = orca.total_volumes.map(v => v[1]);
    const uniVol = uni.total_volumes.map(v => v[1]);

    volumeChart?.destroy();
    volumeChart = new Chart(volumeCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'RAY', data: rayVol, borderColor: '#0d6efd', borderWidth: 3, tension: 0.2, fill: false },
          { label: 'CAKE', data: cakeVol, borderColor: '#adb5bd', borderDash: [5,5], tension: 0.2, fill: false },
          { label: 'CETUS', data: cetusVol, borderColor: '#20c997', borderDash: [5,2], tension: 0.2, fill: false },
          { label: 'ORCA', data: orcaVol, borderColor: '#ffc107', borderDash: [2,3], tension: 0.2, fill: false },
          { label: 'UNI', data: uniVol, borderColor: '#6610f2', borderDash: [6,3], tension: 0.2, fill: false }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: { title: { display: true, text: 'Volumen (USD)' } }
        }
      }
    });

    volumeCtx.style.display = 'block';

    const volumes24 = [rayVol, cakeVol, cetusVol, orcaVol, uniVol].map(arr => arr[arr.length - 1]);
    const total = volumes24.reduce((a, b) => a + b, 0);
    const share = total ? (volumes24[0] / total * 100).toFixed(1) : '0';
    summaryEl.textContent =
      `Vol. 24h – RAY $${(volumes24[0]/1e6).toFixed(2)}M | CAKE $${(volumes24[1]/1e6).toFixed(2)}M | ` +
      `CETUS $${(volumes24[2]/1e6).toFixed(2)}M | ORCA $${(volumes24[3]/1e6).toFixed(2)}M | ` +
      `UNI $${(volumes24[4]/1e6).toFixed(2)}M. Cuota RAY: ${share}% del total.`;
  } catch (err) {
    console.error('Error en volúmenes', err);
    errorEl.textContent = 'Datos no disponibles';
  } finally {
    loading.style.display = 'none';
  }
}

// ---- Gauge Fear & Greed ----
async function loadFng() {
  const errorEl = document.getElementById('fng-error');
  const textEl = document.getElementById('fng-text');
  errorEl.textContent = '';

  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1&format=json');
    const data = await res.json();
    const value = Number(data.data[0].value);
    const label = data.data[0].value_classification;

    fngChart?.destroy();
    fngChart = new Chart(fngCtx, {
      type: 'gauge',
      data: {
        datasets: [{
          value,
          data: [20, 20, 20, 20, 20],
          minValue: 0,
          backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#198754', '#0d6efd']
        }]
      },
      options: {
        responsive: true,
        needle: { radiusPercentage: 2, widthPercentage: 3, lengthPercentage: 80 },
        valueLabel: { display: false },
        trackColor: '#343a40',
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    textEl.textContent = `Actualmente: ${label}`;
  } catch (err) {
    console.error('Error Fear & Greed', err);
    errorEl.textContent = 'Datos no disponibles';
  }
}

// ---- Noticias vía RSS ----
async function loadNews() {
  const loader = document.getElementById('news-loading');
  const list = document.getElementById('news-list');
  const errorEl = document.getElementById('news-error');
  loader.style.display = 'block';
  errorEl.textContent = '';
  list.innerHTML = '';

  try {
    const res = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/search?q=cryptocurrency&hl=es&gl=ES&ceid=ES:es'
    );
    const data = await res.json();

    data.items.slice(0, 5).forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      const date = new Date(item.pubDate).toLocaleDateString();
      li.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a> <small class="text-muted d-block">${date}</small>`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Error noticias', err);
    errorEl.textContent = 'Datos no disponibles';
  } finally {
    loader.style.display = 'none';
  }
}

// ---- Inicialización ----
document.addEventListener('DOMContentLoaded', () => {
  loadPrices();
  loadEthBtc();
  loadVolumes();
  loadFng();
  loadNews();
  setInterval(loadPrices, 5 * 60 * 1000);
  setInterval(loadEthBtc, 5 * 60 * 1000);
  setInterval(loadVolumes, 10 * 60 * 1000);
  setInterval(loadFng, 5 * 60 * 1000);
  setInterval(loadNews, 15 * 60 * 1000);
});
