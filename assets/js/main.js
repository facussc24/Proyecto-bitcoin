import { getPrices, getEthBtc, getVolumes, getFng, getNews } from './modules/api.js';
import { renderEthBtc, renderVolumes, renderFngGauge } from './modules/charts.js';
import { initLoading, advanceLoading, finishLoading, updateSnapshot, updateNews, showError } from './modules/ui.js';

async function init() {
  // total steps: 5 fetches + 3 chart renders
  initLoading(8);

  // Prices snapshot
  try {
    const prices = await getPrices();
    updateSnapshot(prices);
  } catch (err) {
    console.error('Precios', err);
    showError('prices-error', 'Datos no disponibles');
  }
  advanceLoading();

  // ETH/BTC
  let ethbtcData;
  try {
    ethbtcData = await getEthBtc();
  } catch (err) {
    console.error('ETH/BTC', err);
    showError('ethbtc-error', 'Datos no disponibles');
  }
  advanceLoading();

  // Volumes
  let volData;
  try {
    volData = await getVolumes();
  } catch (err) {
    console.error('Volúmenes', err);
    showError('volume-error', 'Datos no disponibles');
  }
  advanceLoading();

  // Fear & Greed
  let fngValue = null;
  try {
    fngValue = await getFng();
  } catch (err) {
    console.error('F&G', err);
    showError('fng-error', 'Datos no disponibles');
  }
  advanceLoading();

  // News
  try {
    const news = await getNews();
    updateNews(news);
  } catch (err) {
    console.error('Noticias', err);
    showError('news-error', 'Datos no disponibles');
  }
  advanceLoading();

  // Render charts if data available
  if (ethbtcData) {
    renderEthBtc(
      document.getElementById('ethbtcChart'),
      ethbtcData.labels,
      ethbtcData.ratios,
      advanceLoading
    );
  } else {
    advanceLoading();
  }

  if (volData) {
    const datasets = [
      { label: 'RAY', data: volData.rayVol, borderColor: '#0d6efd', borderWidth: 3, tension: 0.2, fill: false },
      { label: 'CAKE', data: volData.cakeVol, borderColor: '#adb5bd', borderDash: [5,5], tension: 0.2, fill: false },
      { label: 'CETUS', data: volData.cetusVol, borderColor: '#20c997', borderDash: [5,2], tension: 0.2, fill: false },
      { label: 'ORCA', data: volData.orcaVol, borderColor: '#ffc107', borderDash: [2,3], tension: 0.2, fill: false },
    ];
    renderVolumes(
      document.getElementById('volumeChart'),
      volData.labels,
      datasets,
      advanceLoading
    );
  } else {
    advanceLoading();
  }

  if (fngValue !== null) {
    renderFngGauge(document.getElementById('fngGauge'), fngValue, advanceLoading);
  } else {
    advanceLoading();
  }

  finishLoading();
}

document.addEventListener('DOMContentLoaded', init);
