# Bitcoin Dashboard

This project contains a small dashboard (`index.html`) that displays Bitcoin price data, the Fear & Greed index, an ETH/BTC chart and a news feed. The page uses **Bootswatch** for styling and **Chart.js** for the BTC chart. JavaScript code lives in `src/dashboard.js`.

## Running locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Generate the image assets (not tracked in git):
   ```bash
   node scripts/extract_assets.js
   ```
3. Serve the page (for example with Python) and open it in your browser:
   ```bash
   python -m http.server
   # then visit http://localhost:8000/index.html
   ```

The dashboard fetches live data from the internet so an active connection is required.

## Tests

Run the automated tests with:

```bash
npm test
```

## Dependencies

- **Bootswatch** (Cerulean theme) [`bootswatch@5.3.2`](https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/cerulean/bootstrap.min.css)
- **Chart.js** [`chart.js@3.9.1`](https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js)

## Customizing API endpoints

The dashboard uses several public APIs. You can change them inside `src/dashboard.js`:

- **Fear & Greed index**: `https://api.alternative.me/fng/?limit=30`
- **Bitcoin prices**: `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily`
- **News feed**: `https://api.rss2json.com/v1/api.json?rss_url=https://www.reddit.com/r/raydium/.rss`

