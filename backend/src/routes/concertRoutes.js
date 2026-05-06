const express = require('express');
const ConcertController = require('../controllers/ConcertController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Concert Routes
 */

// POST /concerts - Create new concert (Admin only)
router.post('/', auth('ADMIN'), (req, res) => {
  ConcertController.createConcert(req, res);
});

// GET /concerts/stats - Get dashboard stats (Admin only)
router.get('/stats', auth('ADMIN'), (req, res) => {
  ConcertController.getStats(req, res);
});

// GET /concerts - Get all concerts
router.get('/', (req, res) => {
  ConcertController.getAllConcerts(req, res);
});

// GET /concerts/:id - Get concert by ID
router.get('/:id', (req, res) => {
  ConcertController.getConcertById(req, res);
});

// GET /concerts/:id/seats - Get seats for a concert
router.get('/:id/seats', (req, res) => {
  ConcertController.getSeats(req, res);
});

// PUT /concerts/:id - Update concert (Admin only)
router.put('/:id', auth('ADMIN'), (req, res) => {
  ConcertController.updateConcert(req, res);
});

// DELETE /concerts/:id - Delete concert (Admin only)
router.delete('/:id', auth('ADMIN'), (req, res) => {
  ConcertController.deleteConcert(req, res);
});

module.exports = router;
