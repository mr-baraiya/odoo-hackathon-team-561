const Joi = require('joi');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../../.env'),
  override: true,
});

const env = {
  env: process.env.NODE_ENV || 'dev',
  port: process.env.SERVER_PORT || 3023,
  serviceName: process.env.SERVICE_NAME || 'dealflow360',
  jwtSecret: process.env.JWT_SECRET || 'dealflow360_super_secret_jwt_key_2026',

  // Database
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT || 5432,
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD || 'postgres',
  dbDatabase: process.env.DB_NAME || 'dealflow360',

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
  env: Joi.string().required().valid('local', 'dev', 'stage', 'prod'),
  port: Joi.number().required().min(0).max(65535),
  serviceName: Joi.string().required().min(3).max(255),
  jwtSecret: Joi.string().required().min(3).max(1024),

  // Database
  dbHost: Joi.string().required().min(3).max(255),
  dbPort: Joi.number().required().min(1024).max(65535),
  dbUser: Joi.string().required().min(3).max(255),
  dbPassword: Joi.string().allow(''),
  dbDatabase: Joi.string().required().min(3).max(255),

  // Log levels
  consoleLogLevel: Joi.string().required().valid('false', 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'),
  fileLogLevel: Joi.string().required().valid('false', 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'),

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

// Throw an error if env vars are not valid
if (error) throw new Error(`ENV validation error: ${error.message}`);

module.exports = value;
