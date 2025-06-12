// Gestiona la pantalla de carga y utilidades de interfaz
import { Chart } from './vendor/chart.esm.js';
import { GaugeController } from './vendor/chartjs-gauge.esm.js';

Chart.register(GaugeController);

let totalTasks = 0;
let completed = 0;
let forceTimeout;
let fngChart;

function hideLoader() {
  const screen = document.getElementById('loader-screen');
  if (!screen) return;
  screen.classList.add('fade-out');
  setTimeout(() => screen.remove(), 300);
}

/**
 * Inicializa el loader global.
 * @param {number} total Número total de tareas que deben completarse
 * @returns {Function} Función tick() que avanza el progreso
 */
export function initLoader(total) {
  totalTasks = total;
  completed = 0;
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');
  if (bar) bar.style.width = '0%';
  if (label) label.textContent = '0 %';
  clearTimeout(forceTimeout);
  forceTimeout = setTimeout(hideLoader, 15000);

  return function tick() {
    completed += 1;
    const pct = Math.min(100, Math.round((completed / totalTasks) * 100));
    if (bar) bar.style.width = `${pct}%`;
    if (label) label.textContent = `${pct} %`;
    if (completed >= totalTasks) hideLoader();
  };
}

export function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

export function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}

export function renderSnapshot(data) {
  const pairs = [
    { key: 'bitcoin', pre: 'btc' },
    { key: 'ethereum', pre: 'eth' },
    { key: 'raydium', pre: 'ray' },
  ];
  pairs.forEach(p => {
    const priceEl = document.getElementById(`${p.pre}-price`);
    const changeEl = document.getElementById(`${p.pre}-change`);
    const price = data[p.key].usd;
    const change = data[p.key].usd_24h_change;
    if (priceEl) priceEl.textContent = `$${price.toLocaleString('en-US')}`;
    if (changeEl) {
      const arrow = change >= 0 ? 'bi-arrow-up' : 'bi-arrow-down';
      changeEl.innerHTML = `<i class="bi ${arrow}"></i> ${change.toFixed(2)}%`;
      changeEl.className = change >= 0 ? 'price-change-up' : 'price-change-down';
    }
  });
  const upd = document.getElementById('prices-updated');
  if (upd) upd.textContent = `Actualizado: ${new Date().toLocaleTimeString()}`;
}

export function renderNews(items) {
  const list = document.getElementById('news-list');
  if (!list) return;
  list.replaceChildren();
  items.forEach(it => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    const link = document.createElement('a');
    link.textContent = it.title;
    link.href = it.link;
    link.target = '_blank';
    const dateEl = document.createElement('small');
    dateEl.className = 'text-muted d-block';
    dateEl.textContent = new Date(it.date).toLocaleDateString();
    li.appendChild(link);
    li.appendChild(dateEl);
    list.appendChild(li);
  });
  setUpdated('news-updated');
}

export function setUpdated(id, date = new Date()) {
  const el = document.getElementById(id);
  if (el) el.textContent = `Actualizado: ${new Date(date).toLocaleTimeString()}`;
}

export function renderFngGauge(data) {
  const canvas = document.getElementById('fngGauge');
  const label = document.getElementById('fng-label');
  if (!canvas || !label) return;
  const { value, classification } =
    typeof data === 'object' ? data : { value: data, classification: '' };

  if (fngChart) {
    fngChart.data.datasets[0].value = value;
    fngChart.update();
  } else {
    fngChart = new Chart(canvas.getContext('2d'), {
      type: 'gauge',
      data: {
        datasets: [
          {
            value,
            data: [25, 25, 25, 25],
            minValue: 0,
            backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#198754'],
          },
        ],
      },
      options: {
        responsive: true,
        needle: { radius: '2%', width: '3.2%', length: '80%' },
        valueLabel: { display: true },
      },
    });
  }
  label.textContent = classification ? `${classification} (${value})` : value;
  setUpdated('fng-updated');
}
