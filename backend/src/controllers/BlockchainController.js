const BlockchainService = require('../services/BlockchainService');

/**
 * Blockchain Controller
 */
class BlockchainController {
  /**
   * GET /blockchain - Get entire blockchain
   */
  static async getBlockchain(req, res) {
    try {
      const blockchain = await BlockchainService.getChain();
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
  static async validateBlockchain(req, res) {
    try {
      const validation = await BlockchainService.validateChain();
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
  static async getBlockchainStats(req, res) {
    try {
      const chain = await BlockchainService.getChain();
      const stats = {
        blocks: chain.length,
        lastHash: chain.length ? chain[chain.length - 1].hash : null
      };
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
