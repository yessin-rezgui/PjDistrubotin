const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const AuthController = require('../controllers/AuthController');
const concertRoutes = require('./concertRoutes');
const ticketRoutes = require('./ticketRoutes');
const BlockchainService = require('../services/BlockchainService');

// Auth Routes
router.post('/auth/register', (req, res) => AuthController.register(req, res));
router.post('/auth/login', (req, res) => AuthController.login(req, res));
router.get('/auth/me', auth(), (req, res) => AuthController.me(req, res));

// Concert Routes (Delegated to concertRoutes.js)
router.use('/concerts', concertRoutes);

// Ticket Routes (Delegated to ticketRoutes.js)
// Note: We need to pass io to ticketRoutes if it's a factory function
router.use('/tickets', (req, res, next) => {
  const io = req.app.get('io');
  const tr = typeof ticketRoutes === 'function' ? ticketRoutes(io) : ticketRoutes;
  tr(req, res, next);
});

// Blockchain Routes
router.get('/blockchain', async (req, res) => {
  const chain = await BlockchainService.getChain();
  res.json({ success: true, data: chain });
});
router.get('/blockchain/validate', async (req, res) => {
  const isValid = await BlockchainService.validateChain();
  res.json({ success: true, valid: isValid });
});

module.exports = router;
