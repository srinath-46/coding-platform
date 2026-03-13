const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Configs
require('./backend/config/db');
const initSocketServer = require('./realtime/socketServer');

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.static('frontend'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Initialize Real-time server
initSocketServer(server);

// Routes
app.use('/api/auth', require('./backend/routes/authRoutes'));
app.use('/api/tournaments', require('./backend/routes/tournamentRoutes'));
app.use('/api/rooms', require('./backend/routes/roomRoutes'));
app.use('/api/submissions', require('./backend/routes/submissionRoutes'));
app.use('/api/leaderboard', require('./backend/routes/leaderboardRoutes'));
app.use('/api/admin', require('./backend/routes/adminRoutes'));
app.use('/api/problems', require('./backend/routes/problemRoutes'));
app.use('/api/rewards', require('./backend/routes/rewardRoutes'));


const createOrder = require('./payments/createOrder');
const verifyPayment = require('./payments/verifyPayment');
const { authMiddleware } = require('./backend/middleware/authMiddleware');

app.post('/api/payments/create-order', authMiddleware, createOrder);
app.post('/api/payments/verify', authMiddleware, verifyPayment);

// Error Handling
app.use(require('./backend/middleware/errorMiddleware'));

// Fallback for SPA
const path = require('path');
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔥 Mode: ${process.env.NODE_ENV}`);
});
