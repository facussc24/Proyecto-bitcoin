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
        datasets: [{
          label: 'BTC Precio (USD)',
          data: btcValues,
          borderColor: '#ff9900',
          tension: 0.1,
          fill: false
        }]
      },
      options: {
        maintainAspectRatio: true,
        scales: { y: { type: 'linear', position: 'left', title: { display: true, text: 'Precio USD' } } }
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
        needle: { radiusPercentage: 2, widthPercentage: 3.2, lengthPercentage: 80 },
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
      const a = document.createElement('a');
      a.href = item.link;
      a.textContent = item.title || 'Sin título';
      a.target = '_blank';
      li.appendChild(a);
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Error fetching news', err);
    list.innerHTML = '<li class="list-group-item text-danger">No se pudo cargar el feed</li>';
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
  initTradingView();
  setInterval(fetchGoogleNews, 300000);
}

// Initialize when DOM is ready
if (document.readyState !== 'loading') {
  initDashboard();
} else {
  document.addEventListener('DOMContentLoaded', initDashboard);
}
