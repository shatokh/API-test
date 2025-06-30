import client from 'prom-client';
// Собираем дефолтные метрики Node.js (CPU, память, GC и т.п.)
client.collectDefaultMetrics();

// Гистограмма времени HTTP-запросов
export const httpHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

// Middleware для замера времени каждого запроса
export function metricsMiddleware(req, res, next) {
  const end = httpHistogram.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => end({ code: res.statusCode }));
  next();
}

// Endpoint для Prometheus
export async function metricsEndpoint(req, res) {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}
