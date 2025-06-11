import { fetchSnapshot, fetchEthBtc, fetchVolumes, fetchGauge, fetchNews } from './modules/api.js';
import { renderEthBtc, renderVolumes, renderGauge } from './modules/charts.js';
import { initLoader, renderSnapshot, renderNews, showError } from './modules/ui.js';

function start() {
  const tick = initLoader(5);

  Promise.allSettled([
    fetchSnapshot()
      .then(renderSnapshot)
      .catch(() => showError('prices-error', 'Datos no disponibles'))
      .finally(tick),

    fetchEthBtc()
      .then(d => renderEthBtc(document.getElementById('ethbtcChart'), d.labels, d.ratios))
      .catch(() => showError('ethbtc-error', 'Datos no disponibles'))
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
      })
      .catch(() => showError('volume-error', 'Datos no disponibles'))
      .finally(tick),

    fetchGauge()
      .then(data => renderGauge(document.getElementById('fngGauge'), data))
      .catch(() => showError('fng-error', 'Datos no disponibles'))
      .finally(tick),

    fetchNews()
      .then(renderNews)
      .catch(() => showError('news-error', 'Datos no disponibles'))
      .finally(tick)
  ]);
}

document.addEventListener('DOMContentLoaded', start);
