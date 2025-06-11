import {jest} from "@jest/globals";
import {updateTicker} from "../dashboard.js";

describe('updateTicker', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
    document.body.innerHTML = '<div id="btc-price"></div><div id="eth-price"></div><div id="ray-price"></div>';
  });

  test('uses cached data on fetch failure', async () => {
    const data = {bitcoin:{usd:1}, ethereum:{usd:2}, raydium:{usd:3}};
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(data) });
    await updateTicker();
    expect(document.getElementById('btc-price').textContent).toBe('BTC: $1');

    fetch.mockRejectedValueOnce(new Error('net'));
    document.getElementById('btc-price').textContent = '';
    await updateTicker();
    expect(document.getElementById('btc-price').textContent).toBe('BTC: $1');
  });

  test('avoids overlapping requests', async () => {
    let resolve;
    const p = new Promise(r => { resolve = r; });
    fetch.mockReturnValueOnce(p);
    const first = updateTicker();
    const second = updateTicker();
    expect(fetch).toHaveBeenCalledTimes(1);
    resolve({ ok: true, json: () => Promise.resolve({bitcoin:{usd:1}, ethereum:{usd:2}, raydium:{usd:3}}) });
    await first;
    await second;
    expect(document.getElementById('btc-price').textContent).toBe('BTC: $1');
  });
});
