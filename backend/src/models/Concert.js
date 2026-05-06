const mongoose = require('mongoose');

const concertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    rows: {
      type: Number,
      default: 10,
    },
    seatsPerRow: {
      type: Number,
      default: 10,
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

// Ensure endTime > startTime
concertSchema.pre('save', function (next) {
  if (this.endTime <= this.startTime) {
    throw new Error('End time must be after start time');
  }
  next();
});

module.exports = mongoose.model('Concert', concertSchema);
