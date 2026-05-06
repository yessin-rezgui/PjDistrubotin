const mongoose = require('mongoose');

const TICKET_STATES = {
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
  USED: 'USED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

const ticketSchema = new mongoose.Schema(
  {
    concertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concert',
      required: true,
      index: true,
    },
    seatRow: {
      type: String,
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    seatLabel: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    ownerName: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      enum: Object.values(TICKET_STATES),
      default: TICKET_STATES.AVAILABLE,
      index: true,
    },
    purchasedAt: {
      type: Date,
      default: null,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    transactionId: {
      type: String,
      default: null,
    },
    blockchainHash: {
      type: String,
      default: null,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for concert + seat
ticketSchema.index({ concertId: 1, seatRow: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
module.exports.TICKET_STATES = TICKET_STATES;
