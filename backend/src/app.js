const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const qs = require('qs');
const constant = require('@/config/constant');
const Logger = require('@/service/logger');
const errorHandler = require('@/middleware/errorHandler');
const requestId = require('@/middleware/requestId');
const apiRoutes = require('@/routes/app.route');
const { getDocsHtml } = require('@/utils/docsHtml');


const app = express();

app.set('view engine', 'ejs');

app.use(requestId);

morgan.token('requestId', (req) => req.id);

app.use(morgan(':method :url Status : :status, Time taken: :response-time ms, Request ID: :requestId', {
  stream: { write: (message) => Logger.info(message) },
}));

app.use((req, res, next) => {
  const rawQuery = req.url.split('?')[1] || '';
  req.customQuery = qs.parse(rawQuery);
  next();
});

const vars = require('@/config/var');

// Strict CORS Origin policy derived from FRONTEND_URL
const allowedFrontendUrl = vars.frontendUrl || 'http://localhost:5173';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, mobile apps, curl/Postman)
    if (!origin) return callback(null, true);
    if (origin === allowedFrontendUrl || allowedFrontendUrl === '*') {
      return callback(null, true);
    }
    // In local dev mode, allow localhost origins
    if (vars.env === 'dev' && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS Error: Origin ${origin} is not allowed by FRONTEND_URL policy.`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


const healthRoutes = require('@/routes/health.route');

app.get('/ping', (req, res) => { res.send('pong (DealFlow360)'); });
app.use('/health', healthRoutes);


app.get('/', (req, res) => { res.setHeader('Content-Type', 'text/html'); res.send(getDocsHtml()); });
app.get('/docs', (req, res) => { res.setHeader('Content-Type', 'text/html'); res.send(getDocsHtml()); });
app.get('/api', (req, res, next) => {
  if (req.accepts('html')) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(getDocsHtml());
  }
  return next();
});


app.use('/files', express.static(constant.tmpStoragePath));

// Detailed API Logging Middleware for all incoming API routes
app.use('/api', (req, res, next) => {
  console.log(`\n====================================================`);
  console.log(`[API INCOMING] ${req.method} ${req.originalUrl} | IP: ${req.ip || req.socket.remoteAddress}`);
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    console.log(`[API PAYLOAD]`, JSON.stringify(sanitizedBody, null, 2));
  }
  next();
});

app.use('/api', apiRoutes);

app.use(errorHandler);


module.exports = app;
