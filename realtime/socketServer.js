const { Server } = require('socket.io');
const { verifyToken } = require('../backend/utils/jwtToken');
const websocketService = require('../backend/services/websocketService');

const initSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  websocketService.init(io);


  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error('Invalid token'));
    
    socket.user = decoded;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.user.username} (${socket.id})`);
    
    socket.join(`user_${socket.user.id}`);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`👤 ${socket.user.username} joined room: ${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`👤 ${socket.user.username} left room: ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.user.username}`);
    });
  });

  return io;
};

module.exports = initSocketServer;
