const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const TicketService = require('../src/services/TicketService');
const Concert = require('../src/models/Concert');
const Seat = require('../src/models/Seat');
const Ticket = require('../src/models/Ticket');
const User = require('../src/models/User');

jest.setTimeout(30000);

describe('TicketService', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  it('prevents double-sell of the same seat', async () => {
    const startTime = new Date(Date.now() + 60 * 60 * 1000);
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const concert = await Concert.create({
      name: 'Test Concert',
      description: 'Test',
      venue: 'Arena',
      artist: 'Test Artist',
      startTime,
      endTime,
      capacity: 1,
      rows: 1,
      seatsPerRow: 1,
      price: 50
    });

    const seat = await Seat.create({
      concertId: concert._id,
      rowLabel: 'A',
      seatNumber: 1,
      seatLabel: 'A1',
      status: 'AVAILABLE'
    });

    const user = await User.create({
      username: 'buyer',
      password: 'secret',
      role: 'USER'
    });

    const results = await Promise.allSettled([
      TicketService.buyTicket(concert._id.toString(), 'A1', user._id.toString(), user.username),
      TicketService.buyTicket(concert._id.toString(), 'A1', user._id.toString(), user.username)
    ]);

    const successes = results.filter((result) => result.status === 'fulfilled');
    const failures = results.filter((result) => result.status === 'rejected');

    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);

    const seatAfter = await Seat.findById(seat._id);
    expect(seatAfter.status).toBe('SOLD');

    const ticketsCount = await Ticket.countDocuments({ seatId: seat._id });
    expect(ticketsCount).toBe(1);
  });

  it('expires a ticket when validation happens after event end', async () => {
    const startTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const endTime = new Date(Date.now() - 60 * 60 * 1000);

    const concert = await Concert.create({
      name: 'Past Concert',
      description: 'Expired',
      venue: 'Arena',
      artist: 'Test Artist',
      startTime,
      endTime,
      capacity: 1,
      rows: 1,
      seatsPerRow: 1,
      price: 50
    });

    const seat = await Seat.create({
      concertId: concert._id,
      rowLabel: 'A',
      seatNumber: 1,
      seatLabel: 'A1',
      status: 'SOLD'
    });

    const user = await User.create({
      username: 'late-user',
      password: 'secret',
      role: 'USER'
    });

    const ticket = await Ticket.create({
      concertId: concert._id,
      seatId: seat._id,
      seatLabel: seat.seatLabel,
      userId: user._id,
      userName: user.username,
      status: 'VALID',
      price: concert.price,
      concertName: concert.name,
      artist: concert.artist,
      venue: concert.venue,
      concertStartTime: concert.startTime,
      concertEndTime: concert.endTime
    });

    await expect(TicketService.validateTicket(ticket._id.toString())).rejects.toThrow('Ticket expired');

    const updatedTicket = await Ticket.findById(ticket._id);
    expect(updatedTicket.status).toBe('EXPIRED');
  });
});
