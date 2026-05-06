/**
 * Socket.io Configuration - Real-time updates
 * CRITICAL: Broadcasts seat updates to all connected clients
 */

const configureSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join concert room when client connects
    socket.on('joinConcert', (concertId) => {
      socket.join(`concert-${concertId}`);
      console.log(`Client ${socket.id} joined concert room: concert-${concertId}`);
    });

    // Leave concert room
    socket.on('leaveConcert', (concertId) => {
      socket.leave(`concert-${concertId}`);
      console.log(`Client ${socket.id} left concert room: concert-${concertId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

/**
 * Emit seat update to all clients in concert room
 * CRITICAL: Called when seat is purchased
 */
const broadcastSeatUpdate = (io, concertId, seatData) => {
  io.to(`concert-${concertId}`).emit('seatUpdated', {
    concertId,
    seat: seatData,
    timestamp: new Date(),
  });
};

/**
 * Broadcast ticket state change to all clients
 */
const broadcastTicketStateChange = (io, concertId, ticketData) => {
  io.to(`concert-${concertId}`).emit('ticketStateChanged', {
    concertId,
    ticket: {
      seatLabel: ticketData.seatLabel,
      state: ticketData.state,
      ownerName: ticketData.ownerName,
    },
    timestamp: new Date(),
  });
};

module.exports = {
  configureSocket,
  broadcastSeatUpdate,
  broadcastTicketStateChange,
};
