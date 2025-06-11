# Proyecto Bitcoin

Pequeño panel con gráficos BTC y un feed de noticias sobre RAY.

## Configurar la fuente de noticias

Dentro de `index.html` se definen dos constantes que controlan la carga del feed:

```javascript
const NEWS_FEED_URL = 'https://api.allorigins.win/raw?url=https://www.reddit.com/r/raydium/.rss';
const NEWS_INTERVAL = 10000; // milisegundos
```

`NEWS_FEED_URL` puede apuntar a cualquier RSS (por ejemplo Google News) o a un endpoint JSON de X.

Ejemplo para Google News:

```javascript
const NEWS_FEED_URL = 'https://api.allorigins.win/raw?url=https://news.google.com/rss/search?q=raydium';
```

Ejemplo para X:

```javascript
const NEWS_FEED_URL = 'https://cdn.syndication.twimg.com/widgets/timelines/profile?screen_name=RaydiumProtocol';
```

`NEWS_INTERVAL` define cada cuánto tiempo se vuelve a solicitar el feed. El valor está en milisegundos y por defecto es 10 000 (10 segundos).
