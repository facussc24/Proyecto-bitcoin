import {jest} from "@jest/globals";

jest.useFakeTimers();

const mockApi = {
  fetchSnapshot: jest.fn(),
  fetchEthBtc: jest.fn(),
  fetchVolumes: jest.fn(),
  fetchGauge: jest.fn(),
  fetchNews: jest.fn()
};

const mockUi = {
  initLoader: jest.fn(() => () => {}),
  renderSnapshot: jest.fn(),
  renderNews: jest.fn(),
  showError: jest.fn(),
  renderFngGauge: jest.fn(),
  setUpdated: jest.fn()
};

const mockCharts = {
  renderEthBtc: jest.fn(),
  renderVolumes: jest.fn()
};

jest.unstable_mockModule('../../assets/js/modules/api.js', () => mockApi);
jest.unstable_mockModule('../../assets/js/modules/ui.js', () => mockUi);
jest.unstable_mockModule('../../assets/js/modules/charts.js', () => mockCharts);

const {start} = await import('../../assets/js/main.js');

const {fetchSnapshot} = mockApi;
const {renderSnapshot} = mockUi;

describe('main.js refresh', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="btc-price"></div>';
    jest.clearAllMocks();
    renderSnapshot.mockImplementation(data => {
      const el = document.getElementById('btc-price');
      if (el) el.textContent = `$${data.bitcoin.usd}`;
    });
    mockApi.fetchEthBtc.mockResolvedValue({labels: [], ratios: []});
    mockApi.fetchVolumes.mockResolvedValue({labels: [], rayVol: [], cakeVol: [], cetusVol: [], orcaVol: []});
    mockApi.fetchGauge.mockResolvedValue({value: 0, classification: ''});
    mockApi.fetchNews.mockResolvedValue([]);
  });

  test('start sets refresh interval and updates DOM', async () => {
    fetchSnapshot.mockResolvedValue({bitcoin:{usd:1}});
    const spy = jest.spyOn(global, 'setInterval');
    await start();
    expect(spy).toHaveBeenCalledWith(expect.any(Function), 60000);
    expect(document.getElementById('btc-price').textContent).toBe('$1');
    fetchSnapshot.mockResolvedValue({bitcoin:{usd:2}});
    jest.advanceTimersByTime(60000);
    await Promise.resolve();
    expect(document.getElementById('btc-price').textContent).toBe('$2');
  });
});
