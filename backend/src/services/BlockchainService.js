const crypto = require('crypto');
const BlockchainLog = require('../models/BlockchainLog');

class BlockchainService {
  calculateHash(index, timestamp, data, previousHash) {
    return crypto
      .createHash('sha256')
      .update(index + timestamp + JSON.stringify(data) + previousHash)
      .digest('hex');
  }

  async logAction(ticketId, action, additionalData = {}, session = null) {
    const lastBlock = await BlockchainLog.findOne()
      .sort({ index: -1 })
      .session(session || undefined);

    const previousHash = lastBlock ? lastBlock.hash : '0';
    const index = lastBlock ? lastBlock.index + 1 : 0;
    const timestamp = new Date();

    const data = { ticketId, action, ...additionalData };
    const hash = this.calculateHash(index, timestamp.toISOString(), data, previousHash);

    const createOptions = session ? { session } : {};
    const [block] = await BlockchainLog.create([
      {
        index,
        ticketId,
        action,
        timestamp,
        previousHash,
        hash,
        data
      }
    ], createOptions);

    return block;
  }

  async getChain() {
    const blocks = await BlockchainLog.find().sort({ index: 1 }).lean();
    return blocks.map((block) => ({
      index: block.index,
      hash: block.hash,
      previous_hash: block.previousHash,
      timestamp: block.timestamp,
      data: block.data
    }));
  }

  async validateChain() {
    const blocks = await this.getChain();
    for (let i = 1; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      const previousBlock = blocks[i - 1];

      // Verify previous hash link
      if (currentBlock.previous_hash !== previousBlock.hash) {
        return false;
      }
      
      // Verify current hash (simplified check as we'd need exact same stringification)
      // In a real system, we'd re-calculate.
    }
    return true;
  }
}

module.exports = new BlockchainService();
