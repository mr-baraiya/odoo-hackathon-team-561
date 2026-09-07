const winston = require('winston');
const config = require('./config');
const { loggerOptions } = require('../../config/var');

const { format, transports } = winston;
const { combine, timestamp, printf, colorize, uncolorize } = format;

// Add custom levels and colors
winston.addColors(config.customLevels.colors);

// Time Stamp formate for logs
const TS = timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });

// Log formate for console (different for dev and prod)
const consoleFormate = {
  dev: printf((info) => `[${info.timestamp}] ${info.level} : ${info.message} ${info.stack ? `\n ${info.stack}` : ''}`),
  prod: printf((info) => `[${info.timestamp}]  {"level": "${info.level}", "service":"${info.service}", "message":"${info.message.trim()}", "stack": "${info.stack ? info.stack : ''}"}`),
};

// Log options for console
const consoleLogOptions = {
  level: loggerOptions.consoleLogLevel,
  handleExceptions: true,
  format: combine(TS, loggerOptions.env === 'dev' ? colorize() : uncolorize(), consoleFormate[loggerOptions.env]),
};

// Log options for file
const fileLogOptions = {
  level: loggerOptions.fileLogLevel,
  filename: 'logs/combine.log',
  maxSize: '1m',
  format: combine(TS, consoleFormate.prod),
};

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const activeTransports = [
  new transports.Console(consoleLogOptions),
];

if (!isServerless && loggerOptions.fileLogLevel && loggerOptions.fileLogLevel !== 'false') {
  try {
    activeTransports.push(new transports.File(fileLogOptions));
  } catch (err) {
    console.warn('[Logger] File transport skipped:', err.message);
  }
}

const logger = winston.createLogger({
  levels: config.customLevels.levels,
  defaultMeta: { service: loggerOptions.appName },
  transports: activeTransports,
});

module.exports = logger;
