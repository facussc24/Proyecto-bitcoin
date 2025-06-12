export const OFFLINE_DATA = {
  snapshot: {
    bitcoin: { usd: 30000, usd_24h_change: 0 },
    ethereum: { usd: 2000, usd_24h_change: 0 },
    raydium: { usd: 0.5, usd_24h_change: 0 },
  },
  ethbtc: {
    labels: ['2024-01-01'],
    ratios: [0.053],
  },
  volumes: {
    labels: ['2024-01-01'],
    datasets: [
      { label: 'RAY', data: [100000] },
      { label: 'CAKE', data: [80000] },
      { label: 'CETUS', data: [50000] },
      { label: 'ORCA', data: [75000] },
      { label: 'UNI', data: [120000] },
      { label: 'SUSHI', data: [60000] },
      { label: 'CRV', data: [55000] },
      { label: '1INCH', data: [45000] },
    ],
  },
  fng: { value: 50, classification: 'Neutral' },
  news: [
    { title: 'Sin conexión: datos de ejemplo', link: '#', date: Date.now() },
  ],
};
