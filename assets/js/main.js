const ethbtcChartCtx = document.getElementById('ethbtcChart');
const volumeChartCtx = document.getElementById('volumeChart');
let ethbtcChart;
let volumeChart;

async function loadEthBtc() {
  const priceEl = document.getElementById('ethbtc-price');
  const changeEl = document.getElementById('ethbtc-change');
  const updatedEl = document.getElementById('ethbtc-updated');
  const loadingEl = document.getElementById('ethbtc-loading');
  const errorEl = document.getElementById('ethbtc-error');
  loadingEl.style.display = 'block';
  errorEl.textContent = '';
  try {
    const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=btc&include_24hr_change=true');
    const priceData = await priceRes.json();
    const ratio = priceData.ethereum.btc;
    const change = priceData.ethereum.btc_24h_change;
    priceEl.textContent = ratio.toFixed(6) + ' BTC';
    changeEl.innerHTML = `${change >= 0 ? '<i class="bi bi-arrow-up"></i>' : '<i class="bi bi-arrow-down"></i>'} ${change.toFixed(2)}%`;
    changeEl.className = change >= 0 ? 'text-success' : 'text-danger';
    updatedEl.textContent = 'Última actualización: ' + new Date().toLocaleTimeString();

    const [ethHistRes, btcHistRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily'),
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily')
    ]);
    const ethHist = await ethHistRes.json();
    const btcHist = await btcHistRes.json();

    const labels = ethHist.prices.map(p => new Date(p[0]).toISOString().split('T')[0]);
    const ratios = ethHist.prices.map((p, i) => p[1] / btcHist.prices[i][1]);

    if (ethbtcChart) ethbtcChart.destroy();
    ethbtcChart = new Chart(ethbtcChartCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'ETH/BTC',
          data: ratios,
          borderColor: 'cyan',
          tension: 0.2,
          fill: false
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: false } },
          y: { title: { display: false } }
        }
      }
    });
    ethbtcChartCtx.style.display = 'block';
  } catch (err) {
    console.error('Error cargando ETH/BTC', err);
    errorEl.textContent = 'Datos no disponibles actualmente';
  } finally {
    loadingEl.style.display = 'none';
  }
}

async function loadVolumes() {
  const loadingEl = document.getElementById('volume-loading');
  const summaryEl = document.getElementById('volume-summary');
  const errorEl = document.getElementById('volume-error');
  loadingEl.style.display = 'block';
  errorEl.textContent = '';
  try {
    const [rayRes, cakeRes, cetusRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/coins/raydium/market_chart?vs_currency=usd&days=30&interval=daily'),
      fetch('https://api.coingecko.com/api/v3/coins/pancakeswap-token/market_chart?vs_currency=usd&days=30&interval=daily'),
      fetch('https://api.coingecko.com/api/v3/coins/cetus-protocol/market_chart?vs_currency=usd&days=30&interval=daily')
    ]);
    const ray = await rayRes.json();
    const cake = await cakeRes.json();
    const cetus = await cetusRes.json();
    const labels = ray.total_volumes.map(v => new Date(v[0]).toISOString().split('T')[0]);
    const rayVol = ray.total_volumes.map(v => v[1]);
    const cakeVol = cake.total_volumes.map(v => v[1]);
    const cetusVol = cetus.total_volumes.map(v => v[1]);

    if (volumeChart) volumeChart.destroy();
    volumeChart = new Chart(volumeChartCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'RAY', data: rayVol, borderColor: '#0d6efd', tension: 0.2, fill: false },
          { label: 'CAKE', data: cakeVol, borderColor: '#adb5bd', tension: 0.2, fill: false },
          { label: 'CETUS', data: cetusVol, borderColor: '#20c997', tension: 0.2, fill: false }
        ]
      },
      options: {
        plugins: { legend: { display: true } },
        scales: {
          y: {
            title: { display: true, text: 'Volumen (USD)' }
          }
        }
      }
    });
    volumeChartCtx.style.display = 'block';
    const r24 = rayVol[rayVol.length - 1];
    const c24 = cakeVol[cakeVol.length - 1];
    const ct24 = cetusVol[cetusVol.length - 1];
    const pctCake = c24 ? (r24 / c24 * 100).toFixed(1) : '0';
    const pctCetus = ct24 ? (r24 / ct24 * 100).toFixed(1) : '0';
    summaryEl.textContent = `Vol. 24h: RAY $${(r24/1e6).toFixed(2)} M | CAKE $${(c24/1e6).toFixed(2)} M | CETUS $${(ct24/1e6).toFixed(2)} M. RAY equivale al ${pctCake}% del volumen de PancakeSwap y ${pctCetus}% del de Cetus.`;
  } catch (err) {
    console.error('Error cargando volúmenes', err);
    errorEl.textContent = 'Datos no disponibles actualmente';
  } finally {
    loadingEl.style.display = 'none';
  }
}

async function loadSecondary() {
  const btcPriceEl = document.getElementById('btc-price');
  const fngValueEl = document.getElementById('fng-value');
  try {
    const [btcRes, fngRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'),
      fetch('https://api.alternative.me/fng/?limit=1&format=json')
    ]);
    const btcData = await btcRes.json();
    const fngData = await fngRes.json();
    const btcPrice = btcData.bitcoin.usd;
    const btcChange = btcData.bitcoin.usd_24h_change;
    btcPriceEl.innerHTML = `$${btcPrice.toLocaleString()} <small class="${btcChange>=0?'text-success':'text-danger'}">${btcChange.toFixed(2)}%</small>`;
    const fng = fngData.data[0];
    fngValueEl.textContent = `${fng.value} – ${fng.value_classification}`;
  } catch (err) {
    console.error('Error secundario', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadEthBtc();
  loadVolumes();
  loadSecondary();
  setInterval(loadEthBtc, 5 * 60 * 1000);
  setInterval(loadSecondary, 5 * 60 * 1000);
});
