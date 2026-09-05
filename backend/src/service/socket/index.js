const { Server } = require('socket.io');
const Logger = require('@/service/logger');
const initHandlers = require('./initHandlers');
const ServerError = require('@/utils/serverError');
const Database = require('@/service/database');
const Token = require('@/utils/jwtToken');

let socketIo = null;

const Socket = {

  /**
   * Get the socket.io instance
   * @returns {Server} The socket.io instance
   */
  get io() { return socketIo; },

  listen: (server) => {

    const io = new Server(server, {
      transports: ['websocket'],
      cors: { origin: true, credentials: true },
    });

    socketIo = io;

    io.use(async (socket, next) => {

      try {

        const { token } = socket.handshake.auth;
        if (!token) throw new ServerError('UNAUTHORIZED', 'invalid token');

        const payload = Token.decode(token);
        if (!payload || payload.type !== 'auth') throw new ServerError('UNAUTHORIZED', 'invalid token');

        const sessionData = payload.data;

        const db = await Database.getConnection();
        try {
          const session = await db.queryOne(`
            SELECT * FROM sessions
            WHERE id = $1 and is_deleted = false and expires_at > NOW()
          `, [sessionData.session_id]);

          if (!session) throw new ServerError('UNAUTHORIZED', 'session expired');
          next();
        } finally {
          db.release();
        }
      } catch (error) {
        next(error);
      }
    });

    io.on('connection', (socket) => {
      Logger.info(`User connected: ${socket.id}`);
      initHandlers(io, socket);
    });

    io.on('disconnect', (socket) => {
      Logger.info(`User disconnected: ${socket.id}`);
    });

    // io.on('connection', (socket) => {
    //   Logger.info(`User connected: ${socket.id}`);

    //   initHandlers(io, socket);

    //   socket.on('disconnect', (reason) => {
    //     Logger.info(`User disconnected: ${socket.id}`);
    //   });
    // });

    return io;
  },
};

module.exports = Socket;
