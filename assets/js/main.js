import {
  fetchSnapshot,
  fetchEthBtc,
  fetchVolumes,
  fetchGauge,
  fetchNews,
} from './api.js';
import { renderEthBtc, renderVolumes } from './charts.js';
import {
  initLoader,
  renderSnapshot,
  renderNews,
  showError,
  renderFngGauge,
  setUpdated,
} from './ui.js';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function cacheSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch (e) {
    console.warn('Cache set failed', e);
  }
}

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Cache get failed', e);
    return null;
  }
}

function start() {
  console.log('start');
  const tick = initLoader(5);

  Promise.allSettled([
    fetchSnapshot()
      .then(data => {
        const cached = cacheGet('snapshot');
        if (!cached || !isEqual(cached.data, data)) {
          renderSnapshot(data);
        } else {
          setUpdated('prices-updated');
        }
        cacheSet('snapshot', data);
      })
      .catch(err => {
        console.log('snapshot error', err);
        const cached = cacheGet('snapshot');
        if (cached) {
          renderSnapshot(cached.data);
          setUpdated('prices-updated', cached.ts);
        } else {
          showError('prices-error', 'Datos no disponibles');
        }
      })
      .finally(tick),

    fetchEthBtc()
      .then(d => {
        const cached = cacheGet('ethbtc');
        if (!cached || !isEqual(cached.data, d)) {
          renderEthBtc(
            document.getElementById('ethbtcChart'),
            d.labels,
            d.ratios
          );
        } else {
          setUpdated('ethbtc-updated');
        }
        cacheSet('ethbtc', d);
      })
      .catch(err => {
        console.log('ethbtc error', err);
        const cached = cacheGet('ethbtc');
        if (cached) {
          renderEthBtc(
            document.getElementById('ethbtcChart'),
            cached.data.labels,
            cached.data.ratios
          );
          setUpdated('ethbtc-updated', cached.ts);
        } else {
          showError('ethbtc-error', 'Datos no disponibles');
        }
      })
      .finally(tick),

    fetchVolumes()
      .then(d => {
        const styleMap = {
          RAY: { borderColor: '#0d6efd' },
          CAKE: { borderColor: '#adb5bd', borderDash: [5, 5] },
          CETUS: { borderColor: '#20c997', borderDash: [5, 2] },
          ORCA: { borderColor: '#ffc107', borderDash: [2, 3] },
          UNI: { borderColor: '#6610f2', borderDash: [3, 3] },
        };

        const sets = d.datasets.map(ds => {
          const style = styleMap[ds.label] || {};
          return {
            label: ds.data ? ds.label : `${ds.label} (Datos no disponibles)`,
            data: ds.data || [],
            tension: 0.2,
            fill: false,
            ...style,
          };
        });

        const payload = { labels: d.labels, sets };
        const cached = cacheGet('volumes');
        if (!cached || !isEqual(cached.data, payload)) {
          renderVolumes(document.getElementById('volumeChart'), d.labels, sets);
        } else {
          setUpdated('volume-updated');
        }
        cacheSet('volumes', payload);
      })
      .catch(err => {
        console.log('volumes error', err);
        const cached = cacheGet('volumes');
        if (cached) {
          renderVolumes(
            document.getElementById('volumeChart'),
            cached.data.labels,
            cached.data.sets
          );
          setUpdated('volume-updated', cached.ts);
        } else {
          showError('volume-error', 'Datos no disponibles');
        }
      })
      .finally(tick),

    fetchGauge()
      .then(data => {
        const cached = cacheGet('fng');
        if (!cached || !isEqual(cached.data, data)) {
          renderFngGauge(data);
        } else {
          setUpdated('fng-updated');
        }
        cacheSet('fng', data);
      })
      .catch(err => {
        console.log('gauge error', err);
        const cached = cacheGet('fng');
        if (cached) {
          renderFngGauge(cached.data);
          setUpdated('fng-updated', cached.ts);
        } else {
          showError('fng-error', 'Datos no disponibles');
        }
      })
      .finally(tick),

    fetchNews()
      .then(data => {
        const cached = cacheGet('news');
        if (!cached || !isEqual(cached.data, data)) {
          renderNews(data);
        } else {
          setUpdated('news-updated');
        }
        cacheSet('news', data);
      })
      .catch(err => {
        console.log('news error', err);
        const cached = cacheGet('news');
        if (cached) {
          renderNews(cached.data);
          setUpdated('news-updated', cached.ts);
        } else {
          showError('news-error', 'Datos no disponibles');
        }
      })
      .finally(tick)
  ]);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded');
  start();
  setInterval(start, REFRESH_INTERVAL);
});
