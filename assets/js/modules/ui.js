// Gestiona la pantalla de carga y utilidades de interfaz
let totalTasks = 0;
let completed = 0;
let forceTimeout;

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
  list.innerHTML = '';
  items.forEach(it => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    const date = new Date(it.date).toLocaleDateString();
    li.innerHTML = `<a href="${it.link}" target="_blank">${it.title}</a> <small class="text-muted d-block">${date}</small>`;
    list.appendChild(li);
  });
}
