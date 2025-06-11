# Bitcoin Dashboard

This project contains a small dashboard (`index.html`) that displays Bitcoin price data, the Fear & Greed index, an ETH/BTC chart, RAY indicators and a news feed. The page uses **Bootswatch** for styling and **Chart.js** for the BTC chart. JavaScript code lives in `src/dashboard.js`.

The layout now includes a responsive navbar, a hero banner and a footer. Custom styles and images live under the `assets/` folder.

## Running locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Decode the asset files:
   ```bash
   npm run extract-assets
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
- **Bootstrap JS** [`bootstrap@5.3.2`](https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js)
- **Chart.js** [`chart.js@3.9.1`](https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js)
- **chartjs-gauge-v3** [`chartjs-gauge-v3@3.0.0`](https://cdn.jsdelivr.net/npm/chartjs-gauge-v3@3.0.0/dist/chartjs-gauge.min.js)

The gauge showing the Fear & Greed index relies on this plugin and is loaded automatically from the CDN when you open `index.html`.

## Customizing API endpoints

The dashboard uses several public APIs. You can change them inside `src/dashboard.js`:

- **Fear & Greed index**: `https://api.alternative.me/fng/?limit=30`
- **Bitcoin prices**: `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily`
- **Raydium data**: `https://api.coingecko.com/api/v3/coins/raydium/market_chart?vs_currency=usd&days=30&interval=daily`
- **News feed**: `https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/search?q=bitcoin`

The news section pulls headlines from Google News using the rss2json service.
It refreshes automatically every five minutes to show the latest articles.

## Adding images

Place your images in the `assets/img/` directory and reference them from HTML or CSS using a relative path, e.g. `assets/img/my-photo.jpg`.
The default logo and hero background are provided only as Base64 text files so that no binary files are tracked in Git.

### Extracting provided images

Some platforms do not allow binary files to be checked in directly. For that case,
the repository also includes the images encoded as Base64 text (`logo.txt` and
`hero-bg.txt`). Run the helper script to decode them:

```bash
scripts/extract_assets.sh
```

After running the script you will have `logo.png` and `hero-bg.jpg` in
`assets/img/` ready to use.
