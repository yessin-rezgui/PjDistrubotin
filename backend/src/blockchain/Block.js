const crypto = require('crypto');

class Block {
  constructor(index, timestamp, data, previousHash = '0') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  /**
   * Calculate SHA256 hash for this block
   * CRITICAL: Used for blockchain integrity verification
   */
  calculateHash() {
    const blockString = JSON.stringify({
      index: this.index,
      timestamp: this.timestamp,
      data: this.data,
      previousHash: this.previousHash,
    });

    return crypto
      .createHash('sha256')
      .update(blockString)
      .digest('hex');
  }

  /**
   * Serialize block for blockchain storage
   */
  toJSON() {
    return {
      index: this.index,
      timestamp: this.timestamp,
      data: this.data,
      previousHash: this.previousHash,
      hash: this.hash,
    };
  }

  /**
   * Verify block hash integrity
   */
  isValid() {
    return this.hash === this.calculateHash();
  }
}

module.exports = Block;
