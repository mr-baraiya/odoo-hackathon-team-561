require('module-alias/register');

const http = require('http');
const vars = require('@/config/var');
const app = require('@/app');
const Logger = require('@/service/logger');
const Socket = require('@/service/socket');

const { port, env } = vars;

const server = http.createServer(app);

const io = Socket.listen(server);

Logger.info(`DealFlow360 Server ENV : ${env}`);

server.listen(port, '0.0.0.0', () => {
  Logger.info(`DealFlow360 Server PORT : ${port}`);
});

module.exports = app;
