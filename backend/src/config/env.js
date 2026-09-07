const Joi = require('joi');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../../.env'),
  override: true,
});

const env = {
  env: process.env.NODE_ENV || 'dev',
  port: process.env.SERVER_PORT || process.env.PORT || 3023,
  serviceName: process.env.SERVICE_NAME || 'dealflow360',
  jwtSecret: process.env.JWT_SECRET || 'dealflow360_super_secret_jwt_key_2026',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD || 'postgres',
  dbDatabase: process.env.DB_NAME || 'dealflow360',
  dbSsl: process.env.DB_SSL === 'true' || Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')),

  // Log levels
  consoleLogLevel: process.env.CONSOLE_LOG_LEVEL || 'info',
  fileLogLevel: process.env.FILE_LOG_LEVEL || 'false',

  // Whatsapp
  whatsappService: process.env.WHATSAPP_SERVICE === 'true' || process.env.WHATSAPP_SERVICE === true,

  // Twilio
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioWhatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
  twilioWhatsappJoinMessage: process.env.TWILIO_WHATSAPP_JOIN_MESSAGE || '',
  twilioWhatsappSandboxNumber: process.env.TWILIO_WHATSAPP_SANDBOX_NUMBER || '',

  // Chrome
  chromeExecutablePath: process.env.CHROME_EXECUTABLE_PATH || '',

  // Email
  emailId: process.env.EMAIL_ID || 'admin@dealflow360.com',
  emailPassword: process.env.EMAIL_PASSWORD || 'password',
  emailSmtpHost: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
  emailSmtpPort: process.env.EMAIL_SMTP_PORT ? parseInt(process.env.EMAIL_SMTP_PORT, 10) : 587,

  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Razorpay
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
};

// Define validation for all the env vars
const envSchema = Joi.object({
  env: Joi.string().required().valid('local', 'dev', 'stage', 'prod', 'production'),
  port: Joi.number().optional().allow('', null).min(0).max(65535),
  serviceName: Joi.string().optional().allow(''),
  jwtSecret: Joi.string().optional().allow(''),

  // Database
  databaseUrl: Joi.string().optional().allow(''),
  dbHost: Joi.string().optional().allow(''),
  dbPort: Joi.number().optional().allow('', null).min(1).max(65535),
  dbUser: Joi.string().optional().allow(''),
  dbPassword: Joi.string().optional().allow(''),
  dbDatabase: Joi.string().optional().allow(''),
  dbSsl: Joi.boolean().optional(),

  // Log levels
  consoleLogLevel: Joi.string().optional().allow('').valid('false', 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'),
  fileLogLevel: Joi.string().optional().allow('').valid('false', 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'),

  // Whatsapp
  whatsappService: Joi.boolean().optional(),

  // Twilio
  twilioAccountSid: Joi.string().optional().allow(''),
  twilioAuthToken: Joi.string().optional().allow(''),
  twilioWhatsappNumber: Joi.string().optional().allow(''),
  twilioWhatsappJoinMessage: Joi.string().optional().allow(''),
  twilioWhatsappSandboxNumber: Joi.string().optional().allow(''),

  // Chrome
  chromeExecutablePath: Joi.string().max(500).allow('').optional(),

  // Email
  emailId: Joi.string().email().optional().allow(''),
  emailPassword: Joi.string().optional().allow(''),
  emailSmtpHost: Joi.string().optional().allow(''),
  emailSmtpPort: Joi.number().min(1).max(65535).optional().allow(''),

  // Frontend URL
  frontendUrl: Joi.string().optional().allow(''),

  // Razorpay
  razorpayKeyId: Joi.string().optional().allow(''),
  razorpayKeySecret: Joi.string().optional().allow(''),
});

// Validate env vars
const { error, value } = envSchema.validate(env);

// Log warning if invalid instead of throwing process crash
if (error) {
  console.warn(`[ENV Validation Warning] ${error.message}`);
}

module.exports = value || env;
