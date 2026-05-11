const mongoose = require('mongoose');

const blockchainLogSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
      index: true
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null
    },
    action: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    previousHash: {
      type: String,
      default: '0'
    },
    hash: {
      type: String,
      required: true,
      index: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('BlockchainLog', blockchainLogSchema);
