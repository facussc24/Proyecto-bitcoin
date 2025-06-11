# Bitcoin Dashboard

This project contains a small dashboard (`index.html`) that displays Bitcoin price data, the Fear & Greed index, an ETH/BTC comparison chart and a news feed. The page relies on **Chart.js** for the charts and uses a **Bootswatch** theme for basic styling. Both libraries are loaded from public CDNs so no additional setup is required.

## Running locally

1. Clone or download this repository.
2. Open the `index.html` file in your web browser.
   - You can double‑click the file or serve it with a simple web server, e.g. `python -m http.server` and navigate to `http://localhost:8000/index.html`.

The page will fetch live data from the internet, so an active connection is required.

## Dependencies

The following third‑party libraries are included via CDN links:

- **Bootswatch** (Cerulean theme) [`bootswatch@5.3.2`](https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/cerulean/bootstrap.min.css)
- **Chart.js** [`chart.js@3.9.1`](https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js)

## Customizing API endpoints

The dashboard uses several public APIs. If you wish to use different data sources, edit the URLs found in `index.html`:

- **Fear & Greed index**: default is `https://api.alternative.me/fng/?limit=30`.
- **Bitcoin prices**: default is `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily`.
- **Ethereum prices**: default is `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily`.
- **News feed**: default is the RAY subreddit RSS feed fetched via AllOrigins `https://api.allorigins.win/raw?url=https://www.reddit.com/r/raydium/.rss`.

Replace these URLs with your preferred endpoints to change the displayed data.
