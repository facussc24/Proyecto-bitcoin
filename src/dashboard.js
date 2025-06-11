export async function fetchBtcAndFng() {
  const card = document.getElementById('btc-fng-card');
  const canvas = document.getElementById('btcFngChart');
  if (!canvas || !card) return;

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
    const bgColors = fngValues.map(v => v > 50 ? 'rgba(0,150,0,0.6)' : 'rgba(200,0,0,0.6)');

    card.querySelector('.error-message')?.remove();
    canvas.style.display = 'block';

    new Chart(canvas.getContext('2d'), {
      data: {
        labels,
        datasets: [
          {
            type: 'line',
            label: 'BTC Precio (USD)',
            data: btcValues,
            borderColor: '#ff9900',
            yAxisID: 'y1',
            tension: 0.1,
            fill: false
          },
          {
            type: 'bar',
            label: 'Fear & Greed',
            data: fngValues,
            backgroundColor: bgColors,
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        maintainAspectRatio: true,
        scales: {
          y1: { type: 'linear', position: 'left', title: { display: true, text: 'Precio USD' } },
          y2: { type: 'linear', position: 'right', min: 0, max: 100, title: { display: true, text: 'F&G' }, grid: { drawOnChartArea: false } }
        }
      }
    });
  } catch (err) {
    console.error('Error fetching BTC & FNG data', err);
    canvas.style.display = 'none';
    card.querySelector('.error-message')?.remove();
    const msg = document.createElement('div');
    msg.className = 'text-danger error-message';
    msg.textContent = 'Datos de BTC/F&G no disponibles';
    card.appendChild(msg);
  }
}

export async function fetchRayNews() {
  const list = document.getElementById('news-list');
  if (!list) return;
  try {
    const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.reddit.com/r/raydium/.rss', {cache: 'no-store'});
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

// Initialize when DOM is ready
if (document.readyState !== 'loading') {
  fetchBtcAndFng();
  fetchRayNews();
  initTradingView();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    fetchBtcAndFng();
    fetchRayNews();
    initTradingView();
  });
}
setInterval(fetchRayNews, 300000);
