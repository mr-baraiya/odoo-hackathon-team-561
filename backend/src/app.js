const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const qs = require('qs');
const constant = require('./config/constant');
const Logger = require('./service/logger');
const errorHandler = require('./middleware/errorHandler');
const requestId = require('./middleware/requestId');
const apiRoutes = require('./routes/app.route');
const { getDocsHtml } = require('./utils/docsHtml');


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

const vars = require('./config/var');

// Strict CORS Origin policy derived from FRONTEND_URL
const allowedFrontendUrl = (vars.frontendUrl || 'http://localhost:5173').replace(/\/$/, '');

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, mobile apps, curl/Postman)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');
    const isVercelDomain = cleanOrigin.endsWith('.vercel.app') || cleanOrigin.includes('vercel.app');
    const isAllowedConfig = cleanOrigin === allowedFrontendUrl || allowedFrontendUrl === '*';
    const isLocalDev = cleanOrigin.startsWith('http://localhost:') || cleanOrigin.startsWith('http://127.0.0.1:') || /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))/.test(cleanOrigin);
    const isDevEnv = (process.env.NODE_ENV || 'dev') !== 'production' && (process.env.NODE_ENV || 'dev') !== 'prod';

    if (isAllowedConfig || isVercelDomain || isLocalDev || isDevEnv) {
      return callback(null, true);
    }

    console.warn(`[CORS Blocked] Origin: ${origin} not allowed by policy (${allowedFrontendUrl})`);
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


const healthRoutes = require('./routes/health.route');

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/favicon.png', (req, res) => res.status(204).end());

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
