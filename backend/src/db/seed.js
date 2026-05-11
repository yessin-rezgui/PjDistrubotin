const bcrypt = require('bcryptjs');
const Concert = require('../models/Concert');
const Seat = require('../models/Seat');
const User = require('../models/User');

const seedAdminUser = async () => {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = await User.findOne({ username: adminUsername });
  if (existingAdmin) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  await User.create({
    username: adminUsername,
    password: hashedPassword,
    role: 'ADMIN'
  });
};

const generateSeats = (concertId, rows, seatsPerRow) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const seats = [];

  for (let r = 0; r < rows; r++) {
    const rowLabel = alphabet[r] || `R${r + 1}`;
    for (let s = 1; s <= seatsPerRow; s++) {
      const seatLabel = `${rowLabel}${s}`;
      seats.push({
        concertId,
        rowLabel,
        seatNumber: s,
        seatLabel,
        status: 'AVAILABLE'
      });
    }
  }

  return seats;
};

const seedConcerts = async () => {
  const existingConcerts = await Concert.countDocuments();
  if (existingConcerts > 0) {
    return;
  }

  const seedConcertList = [
    {
      name: 'Global Beats Festival - Day 1',
      artist: 'Daft Punk & Phoenix',
      venue: 'Olympic Stadium',
      startTime: new Date('2026-07-15T18:00:00.000Z'),
      endTime: new Date('2026-07-15T23:59:00.000Z'),
      rows: 10,
      seatsPerRow: 10,
      capacity: 100,
      price: 50
    },
    {
      name: 'Stellar Jazz Night',
      artist: 'Kamasi Washington',
      venue: 'Royal Opera House',
      startTime: new Date('2026-07-16T20:00:00.000Z'),
      endTime: new Date('2026-07-16T23:00:00.000Z'),
      rows: 5,
      seatsPerRow: 10,
      capacity: 50,
      price: 50
    },
    {
      name: 'Techno Sunrise',
      artist: 'Charlotte de Witte',
      venue: 'The Underground Warehouse',
      startTime: new Date('2026-07-17T22:00:00.000Z'),
      endTime: new Date('2026-07-18T06:00:00.000Z'),
      rows: 10,
      seatsPerRow: 10,
      capacity: 100,
      price: 50
    }
  ];

  for (const concertData of seedConcertList) {
    const concert = await Concert.create(concertData);
    const seats = generateSeats(concert._id, concert.rows, concert.seatsPerRow);
    await Seat.insertMany(seats);
  }
};

const seedDatabase = async () => {
  try {
    await seedAdminUser();
    await seedConcerts();
  } catch (error) {
    console.error('Database seed error:', error);
  }
};

module.exports = seedDatabase;
