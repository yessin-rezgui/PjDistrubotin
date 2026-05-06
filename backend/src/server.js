require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const CronService = require('./services/CronService');

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
  console.log('User connected:', socket.id);

  socket.on('joinConcert', (concertId) => {
    socket.join(`concert-${concertId}`);
    console.log(`Socket ${socket.id} joined concert-${concertId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Initialize Cron Jobs
CronService.init();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
