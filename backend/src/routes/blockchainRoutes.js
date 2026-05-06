const express = require('express');
const BlockchainController = require('../controllers/BlockchainController');

const router = express.Router();

/**
 * Blockchain Routes
 */

// GET /blockchain - Get entire blockchain
router.get('/', (req, res) => {
  BlockchainController.getBlockchain(req, res);
});

// GET /blockchain/validate - Validate blockchain integrity
router.get('/validate', (req, res) => {
  BlockchainController.validateBlockchain(req, res);
});

// GET /blockchain/stats - Get blockchain statistics
router.get('/stats', (req, res) => {
  BlockchainController.getBlockchainStats(req, res);
});

module.exports = router;
