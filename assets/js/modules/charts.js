import Chart from '../vendor/chart.esm.js';
import { GaugeController } from '../vendor/chartjs-gauge.esm.js';

Chart.register(GaugeController);

export function renderEthBtc(ctx, labels, ratios, onComplete) {
  return new Chart(ctx, {
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
}

export function renderVolumes(ctx, labels, datasets, onComplete) {
  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      animation: { onComplete },
      scales: { y: { title: { display: true, text: 'Volumen (USD)' } } },
    },
  });
}

export function renderGauge(ctx, value, onComplete) {
  return new Chart(ctx, {
    type: 'gauge',
    data: {
      datasets: [
        {
          value,
          data: [20, 20, 20, 20, 20],
          minValue: 0,
          backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#198754', '#0d6efd'],
        },
      ],
    },
    options: {
      responsive: true,
      needle: { radiusPercentage: 2, widthPercentage: 3, lengthPercentage: 80 },
      valueLabel: { display: false },
      trackColor: '#343a40',
      plugins: { legend: { display: false } },
      animation: { onComplete },
    },
  });
}
