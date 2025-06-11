import {jest} from "@jest/globals";
import {fetchGoogleNews, fetchBtcAndFng, fetchRayData, initTradingView} from '../dashboard.js';
import {fetchSnapshot} from '../../assets/js/modules/api.js';

describe('dashboard functions', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    document.body.innerHTML = '';
HTMLCanvasElement.prototype.getContext = jest.fn();
  });

  test('fetchGoogleNews populates list with items', async () => {
    const mockData = { items: [ {title: 'Post 1', link: 'https://example.com'} ] };
    fetch.mockResolvedValue({ json: () => Promise.resolve(mockData) });
    document.body.innerHTML = '<ul id="google-news-list"></ul>';
    await fetchGoogleNews();
    expect(document.querySelectorAll('#google-news-list li').length).toBe(1);
    expect(document.querySelector('#google-news-list li a').textContent).toBe('Post 1');
  });

  test('fetchBtcAndFng draws chart and gauge', async () => {
    const fng = { data: [ {value: '40', timestamp: 1000000} ] };
    const btc = { prices: [ [1, 50000] ] };
    fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(fng) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(btc) });
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
});
