# Bitcoin Dashboard

Este proyecto contiene un pequeño panel (`index.html`) que muestra el precio de Bitcoin, el índice Fear & Greed, un gráfico ETH/BTC y un feed de noticias. La página utiliza **Bootswatch** para el estilo y **Chart.js** para el gráfico de BTC. El código JavaScript se encuentra en `src/dashboard.js`.

El diseño incluye una barra de navegación responsive, un hero banner y un pie de página. Los estilos personalizados y las imágenes viven dentro de la carpeta `assets/`.

## Ejecutar en local

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Sirve la página (por ejemplo con Python) y ábrela en tu navegador:
   ```bash
   python -m http.server
   # luego visita http://localhost:8000/index.html
   ```

El panel obtiene datos en vivo de internet, por lo que necesitas una conexión activa.

## Pruebas

Ejecuta los tests automatizados con:

```bash
npm test
```

## Dependencias

- **Bootswatch** (tema Cerulean) [`bootswatch@5.3.2`](https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/cerulean/bootstrap.min.css)
- **Bootstrap JS** [`bootstrap@5.3.2`](https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js)
- **Chart.js** [`chart.js@3.9.1`](https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js)

## Personalizar APIs

El panel utiliza varias APIs públicas. Puedes cambiarlas en `src/dashboard.js`:

- **Índice Fear & Greed**: `https://api.alternative.me/fng/?limit=30`
- **Precios de Bitcoin**: `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily`
- **Feed de noticias**: `https://api.rss2json.com/v1/api.json?rss_url=https://www.reddit.com/r/raydium/.rss`

## Imágenes

Coloca tus imágenes en `assets/img/` y refiérete a ellas desde HTML o CSS con una ruta relativa, por ejemplo `assets/img/mi-foto.jpg`. El logo y la imagen del hero están provistos sólo como archivos de texto en Base64 para evitar guardar binarios en Git.

### Extraer las imágenes incluidas

Si tu plataforma no permite almacenar binarios en el repositorio, ejecuta el siguiente script para decodificar los archivos `logo.txt` y `hero-bg.txt`:

```bash
scripts/extract_assets.sh
```

Después de correr el script obtendrás `logo.png` y `hero-bg.jpg` en `assets/img/` listos para usar.
