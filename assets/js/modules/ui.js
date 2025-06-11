let totalSteps = 1;
let currentStep = 0;

function progressBar() {
  return document.getElementById('loading-progress');
}

export function initLoading(steps) {
  totalSteps = steps;
  currentStep = 0;
  const bar = progressBar();
  if (bar) {
    bar.style.width = '0%';
    bar.textContent = '0%';
  }
}

export function advanceLoading() {
  currentStep += 1;
  const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));
  const bar = progressBar();
  if (bar) {
    bar.style.width = `${percent}%`;
    bar.textContent = `${percent}%`;
  }
}

export function finishLoading() {
  const screen = document.getElementById('loading-screen');
  if (screen) {
    screen.classList.add('fade-out');
    setTimeout(() => {
      screen.remove();
    }, 300);
  }
}

export function showError(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function updateSnapshot(data) {
  const list = [
    { key: 'bitcoin', prefix: 'btc' },
    { key: 'ethereum', prefix: 'eth' },
    { key: 'raydium', prefix: 'ray' },
  ];
  list.forEach(item => {
    const price = data[item.key].usd;
    const change = data[item.key].usd_24h_change;
    const priceEl = document.getElementById(`${item.prefix}-price`);
    const changeEl = document.getElementById(`${item.prefix}-change`);
    if (priceEl) priceEl.textContent = `$${price.toLocaleString('en-US')}`;
    if (changeEl) {
      const arrow = change >= 0 ? 'bi-arrow-up' : 'bi-arrow-down';
      changeEl.innerHTML = `<i class="bi ${arrow}"></i> ${change.toFixed(2)}%`;
      changeEl.className = change >= 0 ? 'price-change-up' : 'price-change-down';
    }
  });
  const updated = document.getElementById('prices-updated');
  if (updated) updated.textContent = `Actualizado: ${new Date().toLocaleTimeString()}`;
}

export function updateNews(items) {
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
