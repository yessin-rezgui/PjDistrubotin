const Block = require('./Block');

class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.difficulty = 0; // For PoW (can be extended)

    // Initialize with genesis block
    this.createGenesisBlock();
  }

  /**
   * Create the first block in the blockchain
   */
  createGenesisBlock() {
    const genesisBlock = new Block(0, Date.now(), {
      type: 'GENESIS',
      message: 'Genesis Block - Concert Ticketing System',
    });
    this.chain.push(genesisBlock);
  }

  /**
   * Get the latest block in chain
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add a new block to the blockchain
   * CRITICAL: This logs all ticket transactions
   * @param {Object} data - Transaction data (ticket action)
   */
  addBlock(data) {
    const latestBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      data,
      latestBlock.hash
    );

    // Validate block before adding
    if (!this.isValidNewBlock(newBlock, latestBlock)) {
      throw new Error('Invalid block');
    }

    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Validate if a new block is valid
   */
  isValidNewBlock(newBlock, previousBlock) {
    // Check index
    if (newBlock.index !== previousBlock.index + 1) {
      return false;
    }

    // Check previous hash
    if (newBlock.previousHash !== previousBlock.hash) {
      return false;
    }

    // Check block's own hash
    if (newBlock.hash !== newBlock.calculateHash()) {
      return false;
    }

    return true;
  }

  /**
   * Validate entire blockchain integrity
   * CRITICAL: Ensures no tampering has occurred
   */
  validateChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block's hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.error(`Block ${i} has invalid hash`);
        return false;
      }

      // Verify chain continuity
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`Block ${i} has invalid previous hash`);
        return false;
      }
    }

    return true;
  }

  /**
   * Get all blocks in the chain
   */
  getChain() {
    return this.chain;
  }

  /**
   * Get block count
   */
  getLength() {
    return this.chain.length;
  }

  /**
   * Get block by index
   */
  getBlock(index) {
    return this.chain[index];
  }

  /**
   * Get all blocks as JSON
   */
  toJSON() {
    return this.chain.map((block) => block.toJSON());
  }
}

module.exports = Blockchain;
