const mongoose = require('mongoose');

const concertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    artist: {
      type: String,
      required: true,
      trim: true
    },
    venue: {
      type: String,
      required: true,
      trim: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    rows: {
      type: Number,
      required: true,
      min: 1
    },
    seatsPerRow: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      default: 50,
      min: 0
    }
  },
  {
    timestamps: true
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
