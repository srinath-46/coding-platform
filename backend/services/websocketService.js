let io;

const websocketService = {
  init: (socketIoInstance) => {
    io = socketIoInstance;
  },

  sendToUser: (userId, event, data) => {
    if (io) {
      io.to(`user_${userId}`).emit(event, data);
    }
  },

  broadcastToRoom: (roomId, event, data) => {
    if (io) {
      io.to(roomId).emit(event, data);
    }
  },

  emitToAll: (event, data) => {
    if (io) {
      io.emit(event, data);
    }
  }
};

module.exports = websocketService;
