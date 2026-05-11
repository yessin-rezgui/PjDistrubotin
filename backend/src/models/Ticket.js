const mongoose = require('mongoose');

const TICKET_STATUS = {
  VALID: 'VALID',
  USED: 'USED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

const ticketSchema = new mongoose.Schema(
  {
    concertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concert',
      required: true,
      index: true
    },
    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
      required: true,
      index: true
    },
    seatLabel: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userName: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.VALID,
      index: true
    },
    qrCode: {
      type: String,
      default: null
    },
    purchaseTime: {
      type: Date,
      default: Date.now
    },
    usedAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    },
    blockchainHash: {
      type: String,
      default: null,
      index: true
    },
    price: {
      type: Number,
      default: 0
    },
    concertName: {
      type: String,
      default: ''
    },
    artist: {
      type: String,
      default: ''
    },
    venue: {
      type: String,
      default: ''
    },
    concertStartTime: {
      type: Date,
      default: null
    },
    concertEndTime: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);
module.exports.TICKET_STATUS = TICKET_STATUS;
