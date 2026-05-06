const BlockchainService = require('../services/BlockchainService');

/**
 * Blockchain Controller
 */
class BlockchainController {
  /**
   * GET /blockchain - Get entire blockchain
   */
  static getBlockchain(req, res) {
    try {
      const blockchain = BlockchainService.getBlockchain();
      res.json({
        success: true,
        data: blockchain,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * GET /blockchain/validate - Validate blockchain integrity
   */
  static validateBlockchain(req, res) {
    try {
      const validation = BlockchainService.validateBlockchain();
      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * GET /blockchain/stats - Get blockchain statistics
   */
  static getBlockchainStats(req, res) {
    try {
      const stats = BlockchainService.getBlockchainStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
}

module.exports = BlockchainController;
