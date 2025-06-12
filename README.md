# Crypto Dashboard

This project provides a lightweight dashboard (`index.html`) that displays real‑time cryptocurrency information. It uses **Bootswatch Flatly** for styling and **Chart.js** to render the graphs.  Chart.js and the gauge plugin are bundled locally to avoid external network dependencies.

JavaScript code is organised in ES modules under `assets/js/`:

- `api.js` – all API requests
- `charts.js` – Chart.js configuration helpers
- `ui.js` – DOM helpers and loading screen
- `main.js` – orchestrates data fetching and rendering

## Running locally

1. Install dependencies (only required for tests and asset extraction):
   ```bash
   npm install
   ```
2. Decode image assets (optional):
   ```bash
   npm run extract-assets
   ```
3. Serve the page and open it in your browser:
   ```bash
   python -m http.server
   # then visit http://localhost:8000/index.html
   ```

The dashboard fetches live data from the internet, so an active connection is normally required. If the network is unavailable and no cached data exists, a small set of bundled example data is displayed so the charts remain visible. Data automatically refreshes every 5 minutes. Each section also has an **Actualizar** button to manually trigger a refresh at any time.

## Tests

Run the automated tests with (ensure you've installed dependencies via `npm install` first):

```bash
npm test
```

## APIs used

- **CoinGecko** – prices and historical market data
- **Alternative.me** – Fear & Greed index
- **Google News RSS (via rss2json)** – latest cryptocurrency headlines

## Error handling

API requests are performed through a helper that retries failed fetches up to
two times with a short delay. All exported functions in `api.js` use this helper
so that temporary network issues are automatically mitigated.

## Available scripts

- `npm test` – run Jest unit tests
- `npm run extract-assets` – decode images from `assets/img/*.txt`

