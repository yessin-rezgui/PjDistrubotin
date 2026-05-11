const mongoose = require('mongoose');

const SEAT_STATUSES = {
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD'
};

const seatSchema = new mongoose.Schema(
  {
    concertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concert',
      required: true,
      index: true
    },
    rowLabel: {
      type: String,
      required: true
    },
    seatNumber: {
      type: Number,
      required: true
    },
    seatLabel: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(SEAT_STATUSES),
      default: SEAT_STATUSES.AVAILABLE
    },
    ownerName: {
      type: String,
      default: null
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null
    }
  },
  {
    timestamps: true
  }
);

seatSchema.index({ concertId: 1, seatLabel: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
module.exports.SEAT_STATUSES = SEAT_STATUSES;
