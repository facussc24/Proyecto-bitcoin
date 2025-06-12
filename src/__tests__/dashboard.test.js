import {jest} from "@jest/globals";
import {fetchGoogleNews, fetchBtcAndFng, fetchRayData, initTradingView} from '../dashboard.js';
import {fetchSnapshot} from '../../assets/js/api.js';

describe('dashboard functions', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    document.body.innerHTML = '';
HTMLCanvasElement.prototype.getContext = jest.fn();
    localStorage.clear();
  });

  test('fetchGoogleNews populates list with items', async () => {
    const mockData = { items: [ {title: 'Post 1', link: 'https://example.com'} ] };
    fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockData) });
    document.body.innerHTML = '<ul id="google-news-list"></ul>';
    await fetchGoogleNews();
    expect(document.querySelectorAll('#google-news-list li').length).toBe(1);
    expect(document.querySelector('#google-news-list li a').textContent).toBe('Post 1');
  });

  test('fetchBtcAndFng draws chart and gauge', async () => {
    const fng = { data: [ {value: '40', timestamp: 1000000} ] };
    const btc = { prices: [ [1, 50000] ] };
    fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(fng) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(btc) });
    global.Chart = jest.fn();
    document.body.innerHTML = '<div id="btc-fng-card"><canvas id="btcFngChart"></canvas><canvas id="fngGauge"></canvas></div>';
    await fetchBtcAndFng();
    expect(global.Chart).toHaveBeenCalledTimes(2);
  });

  test('fetchRayData draws charts', async () => {
    const ray = { prices: [[1, 1]], total_volumes: [[1, 100]] };
    const cake = { total_volumes: [[1, 150]] };
    const cetus = { total_volumes: [[1, 50]] };
    fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(ray) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(cake) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(cetus) });
    global.Chart = jest.fn();
    document.body.innerHTML = '<canvas id="rayPriceChart"></canvas><canvas id="rayVolumeChart"></canvas>';
    await fetchRayData();
    expect(global.Chart).toHaveBeenCalledTimes(2);
  });

  test('initTradingView uses TradingView.widget', () => {
    global.TradingView = { widget: jest.fn() };
    document.body.innerHTML = '<div id="ethbtc-chart"></div>';
    initTradingView();
    expect(global.TradingView.widget).toHaveBeenCalledWith(expect.objectContaining({ symbol: 'BINANCE:ETHBTC' }));
  });

  test('fetchSnapshot retries on failure', async () => {
    const data = { ok: true };
    fetch
      .mockRejectedValueOnce(new Error('net'))
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(data) });
    const result = await fetchSnapshot();
    expect(result).toEqual(data);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('updateTicker caches data and reuses pending request', async () => {
    jest.resetModules();
    const { updateTicker } = await import('../dashboard.js');
    const prices = { bitcoin: { usd: 1 }, ethereum: { usd: 2 }, raydium: { usd: 3 } };
    let resolveFetch;
    fetch.mockReturnValue(new Promise(r => { resolveFetch = r; }));
    document.body.innerHTML = '<div id="btc-price"></div><div id="eth-price"></div><div id="ray-price"></div>';
    const p1 = updateTicker();
    updateTicker();
    expect(fetch).toHaveBeenCalledTimes(1);
    resolveFetch({ ok: true, json: () => Promise.resolve(prices) });
    await p1;
    expect(localStorage.getItem('ticker-cache')).toBe(JSON.stringify(prices));
  });

  test('updateTicker falls back to cached values on error', async () => {
    jest.resetModules();
    const { updateTicker } = await import('../dashboard.js');
    const cached = { bitcoin: { usd: 10 }, ethereum: { usd: 20 }, raydium: { usd: 30 } };
    localStorage.setItem('ticker-cache', JSON.stringify(cached));
    fetch.mockRejectedValue(new Error('fail'));
    document.body.innerHTML = '<div id="btc-price"></div><div id="eth-price"></div><div id="ray-price"></div>';
    await updateTicker();
    expect(document.getElementById('btc-price').textContent).toBe('BTC: $10');
    expect(document.getElementById('eth-price').textContent).toBe('ETH: $20');
    expect(document.getElementById('ray-price').textContent).toBe('RAY: $30');
  });
});
