const env = require('./env');

module.exports = {
  env: env.env,
  port: env.port,
  jwtSecret: env.jwtSecret,

  database: {
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbDatabase,
  },

  loggerOptions: {
    env: env.env,
    consoleLogLevel: env.consoleLogLevel,
    fileLogLevel: env.fileLogLevel,
    appName: env.serviceName,
  },

  whatsapp: {
    service: env.whatsappService,
    accountSid: env.twilioAccountSid,
    authToken: env.twilioAuthToken,
    number: env.twilioWhatsappNumber,
    joinMessage: env.twilioWhatsappJoinMessage,
    sandboxNumber: env.twilioWhatsappSandboxNumber,
  },

  chrome: {
    executablePath: env.chromeExecutablePath,
  },

  email: {
    id: env.emailId,
    password: env.emailPassword,
    smtpHost: env.emailSmtpHost,
    smtpPort: env.emailSmtpPort,
  },

  frontendUrl: env.frontendUrl,

  razorpay: {
    keyId: env.razorpayKeyId,
    keySecret: env.razorpayKeySecret,
  },
};


