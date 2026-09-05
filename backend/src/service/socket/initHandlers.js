module.exports = (io, socket) => {
  socket.on('ping', (data) => {
    socket.emit('pong', { message: 'pong (DealFlow360)' });
  });
};
