const mongoose = require('mongoose');
const Concert = require('../models/Concert');
const Seat = require('../models/Seat');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

const TRANSACTION_NOT_SUPPORTED_REGEX = /Transaction numbers are only allowed|replica set|mongos|transaction.*not supported/i;

const runWithTransaction = async (work) => {
  const session = await mongoose.startSession();

  try {
    let result;

    try {
      await session.withTransaction(async () => {
        result = await work(session);
      });
      return result;
    } catch (err) {
      if (err && TRANSACTION_NOT_SUPPORTED_REGEX.test(err.message || '')) {
        return await work(null);
      }
      throw err;
    }
  } finally {
    session.endSession();
  }
};

const mapConcert = (concert) => ({
  id: concert._id.toString(),
  name: concert.name,
  description: concert.description,
  venue: concert.venue,
  artist: concert.artist,
  start_time: concert.startTime,
  end_time: concert.endTime,
  capacity: concert.capacity,
  rows: concert.rows,
  seatsPerRow: concert.seatsPerRow,
  price: concert.price
});

class ConcertService {
  async createConcert(data) {
    const { name, description, venue, artist, startTime, endTime, capacity, rows, seatsPerRow, price } = data;
    const totalSeats = capacity || rows * seatsPerRow;
    const createdConcert = await runWithTransaction(async (session) => {
      const createOptions = session ? { session } : {};
      const concertDocs = await Concert.create([
        {
          name,
          description: description || '',
          venue,
          artist,
          startTime,
          endTime,
          capacity: totalSeats,
          rows,
          seatsPerRow,
          price: price ?? 50
        }
      ], createOptions);

      const concert = concertDocs[0];
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const seats = [];

      for (let r = 0; r < rows; r++) {
        const rowLabel = alphabet[r] || `R${r + 1}`;
        for (let s = 1; s <= seatsPerRow; s++) {
          const seatLabel = `${rowLabel}${s}`;
          seats.push({
            concertId: concert._id,
            rowLabel,
            seatNumber: s,
            seatLabel,
            status: 'AVAILABLE'
          });
        }
      }

      if (seats.length) {
        await Seat.insertMany(seats, createOptions);
      }

      return concert;
    });

    return mapConcert(createdConcert);
  }

  async getAllConcerts() {
    const concerts = await Concert.find().sort({ startTime: 1 }).lean();
    return concerts.map((concert) => mapConcert(concert));
  }

  async getConcertById(id) {
    const concert = await Concert.findById(id).lean();
    return concert ? mapConcert(concert) : null;
  }

  async deleteConcert(id) {
    await runWithTransaction(async (session) => {
      const deleteOptions = session ? { session } : {};

      const concertQuery = Concert.findByIdAndDelete(id);
      if (session) {
        concertQuery.session(session);
      }
      await concertQuery;

      await Seat.deleteMany({ concertId: id }, deleteOptions);
      await Ticket.deleteMany({ concertId: id }, deleteOptions);
    });

    return true;
  }

  async updateConcert(id, data) {
    const { name, description, venue, artist, startTime, endTime, price } = data;
    const update = {
      name,
      description,
      venue,
      artist,
      startTime,
      endTime
    };

    if (price !== undefined) {
      update.price = price;
    }

    const concert = await Concert.findByIdAndUpdate(id, update, { new: true }).lean();

    return concert ? mapConcert(concert) : null;
  }

  async getDashboardStats() {
    const totalEvents = await Concert.countDocuments();
    const totalTicketsSold = await Ticket.countDocuments({
      status: { $in: ['VALID', 'USED'] }
    });
    const totalUsers = await User.countDocuments({ role: 'USER' });

    const revenueAgg = await Ticket.aggregate([
      { $match: { status: { $in: ['VALID', 'USED'] } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const statusStats = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } }
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const salesOverTime = await Ticket.aggregate([
      { $match: { purchaseTime: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$purchaseTime'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', count: 1 } }
    ]);

    const recentTicketsRaw = await Ticket.find()
      .sort({ purchaseTime: -1 })
      .limit(10)
      .lean();

    const recentTickets = recentTicketsRaw.map((ticket) => ({
      id: ticket._id.toString(),
      status: ticket.status,
      purchase_time: ticket.purchaseTime,
      event_name: ticket.concertName,
      user_name: ticket.userName,
      owner_name: ticket.userName,
      seat_label: ticket.seatLabel
    }));

    return {
      totalEvents,
      totalTicketsSold,
      totalUsers,
      totalRevenue: revenueAgg[0]?.total || 0,
      statusStats,
      salesOverTime,
      recentTickets
    };
  }

  async getSeats(concertId) {
    const seats = await Seat.find({ concertId })
      .sort({ rowLabel: 1, seatNumber: 1 })
      .lean();

    return seats.map((seat) => ({
      id: seat._id.toString(),
      row_label: seat.rowLabel,
      seat_number: seat.seatNumber,
      seat_label: seat.seatLabel,
      status: seat.status,
      ticket_status: seat.status === 'SOLD' ? 'SOLD' : null,
      owner_name: seat.ownerName || null
    }));
  }
}

module.exports = new ConcertService();
