const TicketService = require('../services/TicketService');

class TicketController {
  async buyTicket(req, res) {
    try {
      const { concertId, seatLabel } = req.body;
      const userId = req.user.id;
      const userName = req.user.username;

      const result = await TicketService.buyTicket(concertId, seatLabel, userId, userName);

      // Broadcast update via Socket.io
      if (req.io) {
        req.io.to(`concert-${concertId}`).emit('seatUpdated', { concertId, seatLabel, status: 'SOLD' });
      }

      res.status(201).json({ success: true, data: result, message: 'Ticket purchased successfully' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async validateTicket(req, res) {
    try {
      const { ticketId } = req.body;
      const result = await TicketService.validateTicket(ticketId);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getMyTickets(req, res) {
    try {
      const userId = req.user.id;
      const tickets = await TicketService.getUserTickets(userId);
      res.json({ success: true, data: tickets });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async cancelTicket(req, res) {
    try {
      const { ticketId } = req.params;
      const userId = req.user.id;
      const result = await TicketService.cancelTicket(ticketId, userId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async changeName(req, res) {
    try {
      const { ticketId } = req.params;
      const { newName } = req.body;
      const userId = req.user.id;
      const result = await TicketService.changeTicketName(ticketId, userId, newName);
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new TicketController();
