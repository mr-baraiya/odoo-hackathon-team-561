const winston = require('winston');
const config = require('./config');
const { loggerOptions } = require('../../config/var');

const { format, transports } = winston;
const { combine, timestamp, printf, colorize, uncolorize } = format;

// Add custom levels and colors safely
if (config && config.customLevels && config.customLevels.colors) {
  winston.addColors(config.customLevels.colors);
}

// Time Stamp format for logs
const TS = timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });

const formatMessage = (msg) => {
  if (msg === null || msg === undefined) return '';
  if (typeof msg === 'string') return msg.trim();
  if (typeof msg === 'object') {
    try {
      return JSON.stringify(msg);
    } catch (e) {
      return String(msg);
    }
  }
  return String(msg).trim();
};

// Log format for console (handles both dev and production environments safely)
const consoleFormate = {
  dev: printf((info) => `[${info.timestamp}] ${info.level} : ${formatMessage(info.message)}${info.stack ? `\n ${info.stack}` : ''}`),
  prod: printf((info) => `[${info.timestamp}] {"level": "${info.level}", "service":"${info.service || 'dealflow360'}", "message":${JSON.stringify(formatMessage(info.message))}, "stack": "${info.stack || ''}"}`),
};

const currentEnv = (loggerOptions.env || 'dev').toLowerCase();
const selectedFormat = (currentEnv === 'dev' || currentEnv === 'local') ? consoleFormate.dev : consoleFormate.prod;

// Log options for console
const consoleLogOptions = {
  level: loggerOptions.consoleLogLevel || 'info',
  handleExceptions: false,
  format: combine(TS, currentEnv === 'dev' ? colorize() : uncolorize(), selectedFormat),
};

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_URL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.NOW_REGION ||
  (process.cwd() && (process.cwd().includes('/var/task') || process.cwd().includes('/tmp'))) ||
  (__dirname && __dirname.includes('/var/task'))
);

const activeTransports = [
  new transports.Console(consoleLogOptions),
];

// File logging is strictly disabled in serverless / Vercel read-only environments
if (!isServerless && process.env.NODE_ENV !== 'production' && loggerOptions.fileLogLevel && loggerOptions.fileLogLevel !== 'false') {
  try {
    const fileLogOptions = {
      level: loggerOptions.fileLogLevel,
      filename: 'logs/combine.log',
      maxSize: '1m',
      format: combine(TS, consoleFormate.prod),
    };
    activeTransports.push(new transports.File(fileLogOptions));
  } catch (err) {
    console.warn('[Logger] File transport skipped:', err.message);
  }
}

const logger = winston.createLogger({
  levels: config.customLevels ? config.customLevels.levels : undefined,
  defaultMeta: { service: loggerOptions.appName || 'dealflow360' },
  transports: activeTransports,
  exitOnError: false,
});

module.exports = logger;

