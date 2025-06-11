import {jest} from "@jest/globals";
import {fetchRayNews, fetchBtcAndFng, initTradingView} from '../dashboard.js';

describe('dashboard functions', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    document.body.innerHTML = '';
HTMLCanvasElement.prototype.getContext = jest.fn();
  });

  test('fetchRayNews populates list with items', async () => {
    const mockData = { items: [ {title: 'Post 1', link: 'https://example.com'} ] };
    fetch.mockResolvedValue({ json: () => Promise.resolve(mockData) });
    document.body.innerHTML = '<ul id="news-list"></ul>';
    await fetchRayNews();
    expect(document.querySelectorAll('#news-list li').length).toBe(1);
    expect(document.querySelector('#news-list li a').textContent).toBe('Post 1');
  });

  test('fetchBtcAndFng calls Chart with data', async () => {
    const fng = { data: [ {value: '40', timestamp: 1000000} ] };
    const btc = { prices: [ [1, 50000] ] };
    fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(fng) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(btc) });
    global.Chart = jest.fn();
    document.body.innerHTML = '<div id="btc-fng-card"><canvas id="btcFngChart"></canvas></div>';
    await fetchBtcAndFng();
    expect(global.Chart).toHaveBeenCalled();
  });

  test('initTradingView uses TradingView.widget', () => {
    global.TradingView = { widget: jest.fn() };
    document.body.innerHTML = '<div id="ethbtc-chart"></div>';
    initTradingView();
    expect(global.TradingView.widget).toHaveBeenCalledWith(expect.objectContaining({ symbol: 'BINANCE:ETHBTC' }));
  });
});
