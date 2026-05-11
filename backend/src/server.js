require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const CronService = require('./services/CronService');
const connectDB = require('./middleware/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // In production, specify your frontend URL
    methods: ['GET', 'POST']
  }
});

// Make io accessible in app
app.set('io', io);

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('joinConcert', (concertId) => {
    socket.join(`concert-${concertId}`);
    logger.info(`Socket ${socket.id} joined concert-${concertId}`);
  });

  socket.on('disconnect', () => {
    logger.warn(`Socket disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  await connectDB();

  // Initialize Cron Jobs
  CronService.init(io);

  server.listen(PORT, () => {
    logger.banner({ port: PORT, env: process.env.NODE_ENV || 'development', db: 'MongoDB' });
    logger.success(`Server running on port ${PORT}`);
  });
};

startServer();
