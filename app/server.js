const express = require('express');
const redis = require('redis');
const winston = require('winston');
const promClient = require('prom-client');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Prometheus 메트릭 설정
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);

// Winston 로거 설정
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: '/app/logs/app.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Redis 클라이언트 설정
let redisClient;
if (process.env.REDIS_URL) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });
  
  redisClient.on('error', (err) => {
    logger.error('Redis Client Error', err);
  });
  
  redisClient.connect().catch(err => {
    logger.error('Redis connection failed', err);
  });
}

// 미들웨어
app.use(express.json());

// 메트릭 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestCounter.labels(req.method, route, res.statusCode).inc();
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: duration,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
});

// 라우트
app.get('/', async (req, res) => {
  try {
    let visitorCount = 0;
    
    if (redisClient && redisClient.isReady) {
      visitorCount = await redisClient.incr('visitor_count');
    }
    
    res.json({
      message: 'Hello World!',
      timestamp: new Date().toISOString(),
      visitorCount: visitorCount,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    logger.error('Error in / route', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Error generating metrics', error);
    res.status(500).end();
  }
});

app.get('/api/test', (req, res) => {
  logger.info('Test API called');
  res.json({ 
    message: 'Test endpoint working!',
    data: {
      randomNumber: Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString()
    }
  });
});

// 에러 처리
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 처리
app.use((req, res) => {
  logger.warn('404 - Route not found', {
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  res.status(404).json({ error: 'Route not found' });
});

// 서버 시작
app.listen(port, () => {
  logger.info(`Server started on port ${port}`, {
    port: port,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  if (redisClient && redisClient.isReady) {
    await redisClient.quit();
  }
  
  process.exit(0);
});
