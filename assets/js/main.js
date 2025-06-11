import { fetchSnapshot, fetchEthBtc, fetchVolumes, fetchGauge, fetchNews } from './modules/api.js';
import { renderEthBtc, renderVolumes } from './modules/charts.js';
import { initLoader, renderSnapshot, renderNews, showError, renderFngGauge, setUpdated } from './modules/ui.js';

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
  const tick = initLoader(5);

  Promise.allSettled([
    fetchSnapshot()
      .then(data => {
        renderSnapshot(data);
        cacheSet('snapshot', data);
      })
      .catch(() => {
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
        renderEthBtc(
          document.getElementById('ethbtcChart'),
          d.labels,
          d.ratios
        );
        cacheSet('ethbtc', d);
      })
      .catch(() => {
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
        const sets = [
          { label: 'RAY', data: d.rayVol, borderColor: '#0d6efd', tension: 0.2, fill: false },
          { label: 'CAKE', data: d.cakeVol, borderColor: '#adb5bd', borderDash: [5, 5], tension: 0.2, fill: false },
          { label: 'CETUS', data: d.cetusVol, borderColor: '#20c997', borderDash: [5, 2], tension: 0.2, fill: false },
          { label: 'ORCA', data: d.orcaVol, borderColor: '#ffc107', borderDash: [2, 3], tension: 0.2, fill: false }
        ];
        renderVolumes(document.getElementById('volumeChart'), d.labels, sets);
        cacheSet('volumes', { labels: d.labels, sets });
      })
      .catch(() => {
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
        renderFngGauge(data);
        cacheSet('fng', data);
      })
      .catch(() => {
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
        renderNews(data);
        cacheSet('news', data);
      })
      .catch(() => {
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

document.addEventListener('DOMContentLoaded', start);
