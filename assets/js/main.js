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
import { OFFLINE_DATA } from '../data/offlineData.js';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const CACHE_TTL = REFRESH_INTERVAL;

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

function cacheGetFresh(key, maxAge = CACHE_TTL) {
  const cached = cacheGet(key);
  if (cached && Date.now() - cached.ts < maxAge) {
    return cached;
  }
  return null;
}

function loadSnapshot(tick) {
  const t = tick || initLoader(1);
  const cachedFresh = cacheGetFresh('snapshot');
  if (cachedFresh) {
    renderSnapshot(cachedFresh.data);
    setUpdated('prices-updated', cachedFresh.ts);
    t();
    return Promise.resolve();
  }
  return fetchSnapshot()
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
      } else if (OFFLINE_DATA.snapshot) {
        renderSnapshot(OFFLINE_DATA.snapshot);
        setUpdated('prices-updated');
      } else {
        showError('prices-error', 'Datos no disponibles');
      }
    })
    .finally(t);
}

function loadEthBtc(tick) {
  const t = tick || initLoader(1);
  const cachedFresh = cacheGetFresh('ethbtc');
  if (cachedFresh) {
    renderEthBtc(
      document.getElementById('ethbtcChart'),
      cachedFresh.data.labels,
      cachedFresh.data.ratios
    );
    setUpdated('ethbtc-updated', cachedFresh.ts);
    t();
    return Promise.resolve();
  }
  return fetchEthBtc()
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
      } else if (OFFLINE_DATA.ethbtc) {
        renderEthBtc(
          document.getElementById('ethbtcChart'),
          OFFLINE_DATA.ethbtc.labels,
          OFFLINE_DATA.ethbtc.ratios
        );
        setUpdated('ethbtc-updated');
      } else {
        showError('ethbtc-error', 'Datos no disponibles');
      }
    })
    .finally(t);
}

function loadVolumes(tick) {
  const t = tick || initLoader(1);
  const cachedFresh = cacheGetFresh('volumes');
  if (cachedFresh) {
    renderVolumes(
      document.getElementById('volumeChart'),
      cachedFresh.data.labels,
      cachedFresh.data.sets
    );
    setUpdated('volume-updated', cachedFresh.ts);
    t();
    return Promise.resolve();
  }
  return fetchVolumes()
    .then(d => {
      const styleMap = {
        RAY: { borderColor: '#0d6efd' },
        CAKE: { borderColor: '#adb5bd', borderDash: [5, 5] },
        CETUS: { borderColor: '#20c997', borderDash: [5, 2] },
        ORCA: { borderColor: '#ffc107', borderDash: [2, 3] },
        UNI: { borderColor: '#6610f2', borderDash: [3, 3] },
        SUSHI: { borderColor: '#fd7e14', borderDash: [4, 4] },
        CRV: { borderColor: '#6f42c1', borderDash: [1, 2] },
        '1INCH': { borderColor: '#d63384', borderDash: [4, 2] },
      };

      const sets = d.datasets
        .filter(ds => Array.isArray(ds.data) && ds.data.length)
        .map(ds => {
          const style = styleMap[ds.label] || {};
          return {
            label: ds.label,
            data: ds.data,
            tension: 0.2,
            fill: false,
            ...style,
          };
        });

      if (!sets.length) {
        showError('volume-error', 'Datos no disponibles');
        return;
      }

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
      } else if (OFFLINE_DATA.volumes) {
        const styleMap = {
          RAY: { borderColor: '#0d6efd' },
          CAKE: { borderColor: '#adb5bd', borderDash: [5, 5] },
          CETUS: { borderColor: '#20c997', borderDash: [5, 2] },
          ORCA: { borderColor: '#ffc107', borderDash: [2, 3] },
          UNI: { borderColor: '#6610f2', borderDash: [3, 3] },
          SUSHI: { borderColor: '#fd7e14', borderDash: [4, 4] },
          CRV: { borderColor: '#6f42c1', borderDash: [1, 2] },
          '1INCH': { borderColor: '#d63384', borderDash: [4, 2] },
        };
        const sets = OFFLINE_DATA.volumes.datasets
          .filter(ds => Array.isArray(ds.data) && ds.data.length)
          .map(ds => ({
            label: ds.label,
            data: ds.data,
            tension: 0.2,
            fill: false,
            ...(styleMap[ds.label] || {}),
          }));
        if (!sets.length) {
          showError('volume-error', 'Datos no disponibles');
          return;
        }
        renderVolumes(
          document.getElementById('volumeChart'),
          OFFLINE_DATA.volumes.labels,
          sets
        );
        setUpdated('volume-updated');
      } else {
        showError('volume-error', 'Datos no disponibles');
      }
    })
    .finally(t);
}

function loadGauge(tick) {
  const t = tick || initLoader(1);
  const cachedFresh = cacheGetFresh('fng');
  if (cachedFresh) {
    renderFngGauge(cachedFresh.data);
    setUpdated('fng-updated', cachedFresh.ts);
    t();
    return Promise.resolve();
  }
  return fetchGauge()
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
      } else if (OFFLINE_DATA.fng) {
        renderFngGauge(OFFLINE_DATA.fng);
        setUpdated('fng-updated');
      } else {
        showError('fng-error', 'Datos no disponibles');
      }
    })
    .finally(t);
}

function loadNews(tick) {
  const t = tick || initLoader(1);
  const cachedFresh = cacheGetFresh('news');
  if (cachedFresh) {
    renderNews(cachedFresh.data);
    setUpdated('news-updated', cachedFresh.ts);
    t();
    return Promise.resolve();
  }
  return fetchNews()
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
      } else if (OFFLINE_DATA.news) {
        renderNews(OFFLINE_DATA.news);
        setUpdated('news-updated');
      } else {
        showError('news-error', 'Datos no disponibles');
      }
    })
    .finally(t);
}

function start() {
  console.log('start');
  const tick = initLoader(5);

  Promise.allSettled([
    loadSnapshot(tick),
    loadEthBtc(tick),
    loadVolumes(tick),
    loadGauge(tick),
    loadNews(tick),
  ]);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded');
  start();
  setInterval(start, REFRESH_INTERVAL);

  const btnPrices = document.getElementById('refresh-prices');
  if (btnPrices) {
    btnPrices.addEventListener('click', () => {
      btnPrices.disabled = true;
      loadSnapshot().finally(() => {
        btnPrices.disabled = false;
      });
    });
  }

  const btnFng = document.getElementById('refresh-fng');
  if (btnFng) {
    btnFng.addEventListener('click', () => {
      btnFng.disabled = true;
      loadGauge().finally(() => {
        btnFng.disabled = false;
      });
    });
  }

  const btnEthBtc = document.getElementById('refresh-ethbtc');
  if (btnEthBtc) {
    btnEthBtc.addEventListener('click', () => {
      btnEthBtc.disabled = true;
      loadEthBtc().finally(() => {
        btnEthBtc.disabled = false;
      });
    });
  }

  const btnVolumes = document.getElementById('refresh-volumes');
  if (btnVolumes) {
    btnVolumes.addEventListener('click', () => {
      btnVolumes.disabled = true;
      loadVolumes().finally(() => {
        btnVolumes.disabled = false;
      });
    });
  }

  const btnNews = document.getElementById('refresh-news');
  if (btnNews) {
    btnNews.addEventListener('click', () => {
      btnNews.disabled = true;
      loadNews().finally(() => {
        btnNews.disabled = false;
      });
    });
  }
});
