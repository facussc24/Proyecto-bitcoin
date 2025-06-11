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
  initTradingView();
  setInterval(fetchGoogleNews, 300000);
}

// Initialize when DOM is ready
if (document.readyState !== 'loading') {
  initDashboard();
} else {
  document.addEventListener('DOMContentLoaded', initDashboard);
}
