import { Chart, registerables } from '../vendor/chart.esm.js';
import { setUpdated } from './ui.js';

Chart.register(...registerables);

export function renderEthBtc(ctx, labels, ratios, onComplete) {
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'ETH/BTC',
          data: ratios,
          borderColor: '#0dcaf0',
          tension: 0.2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      animation: { onComplete },
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { title: { display: true, text: 'Ratio' } },
      },
    },
  });
  setUpdated('ethbtc-updated');
  return chart;
}

export function renderVolumes(ctx, labels, datasets, onComplete) {
  const chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      animation: { onComplete },
      scales: { y: { title: { display: true, text: 'Volumen (USD)' } } },
    },
  });
  setUpdated('volume-updated');
  return chart;
}
