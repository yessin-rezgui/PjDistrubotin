const express = require('express');
const auth = require('../middleware/auth');
const TicketController = require('../controllers/TicketController');

/**
 * Ticket Routes
 */
const createTicketRoutes = (io) => {
  const router = express.Router();

  // Middleware to attach io to req
  router.use((req, res, next) => {
    req.io = io;
    next();
  });

  // POST /tickets/buy - Buy a ticket (Auth required)
  router.post('/buy', auth(), (req, res) => TicketController.buyTicket(req, res));

  // POST /tickets/validate - Validate ticket at entrance (Admin/Scanner required)
  router.post('/validate', (req, res) => TicketController.validateTicket(req, res));

  // POST /tickets/cancel/:ticketId - Cancel a ticket
  router.post('/cancel/:ticketId', auth(), (req, res) => TicketController.cancelTicket(req, res));

  // PUT /tickets/change-name/:ticketId - Change ticket owner name
  router.put('/change-name/:ticketId', auth(), (req, res) => TicketController.changeName(req, res));

  // GET /tickets/my-tickets - Get current user's tickets
  router.get('/my-tickets', auth(), (req, res) => TicketController.getMyTickets(req, res));

  return router;
};

module.exports = createTicketRoutes;
