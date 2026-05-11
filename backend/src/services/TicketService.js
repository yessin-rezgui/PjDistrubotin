const mongoose = require('mongoose');
const QRCode = require('qrcode');
const BlockchainService = require('./BlockchainService');
const Concert = require('../models/Concert');
const Seat = require('../models/Seat');
const Ticket = require('../models/Ticket');

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

class TicketService {
  async buyTicket(concertId, seatLabel, userId, userName) {
    const result = await runWithTransaction(async (session) => {
      const concertQuery = Concert.findById(concertId);
      const concert = session ? await concertQuery.session(session) : await concertQuery;
      if (!concert) {
        throw new Error('Concert not found');
      }
      if (concert.startTime < new Date()) {
        throw new Error('Ticket purchase not allowed after event start time');
      }

      const seatQuery = Seat.findOne({ concertId, seatLabel });
      const seat = session ? await seatQuery.session(session) : await seatQuery;
      if (!seat) {
        throw new Error('Seat not found');
      }
      if (seat.status !== 'AVAILABLE') {
        throw new Error('Seat already sold or reserved');
      }

      const lockedSeat = await Seat.findOneAndUpdate(
        { _id: seat._id, status: 'AVAILABLE' },
        { status: 'SOLD' },
        { new: true, session: session || undefined }
      );

      if (!lockedSeat) {
        throw new Error('Seat already sold or reserved');
      }

      const createOptions = session ? { session } : {};
      const ticketDocs = await Ticket.create([
        {
          concertId,
          seatId: lockedSeat._id,
          seatLabel: lockedSeat.seatLabel,
          userId,
          userName,
          status: 'VALID',
          price: concert.price,
          concertName: concert.name,
          artist: concert.artist,
          venue: concert.venue,
          concertStartTime: concert.startTime,
          concertEndTime: concert.endTime
        }
      ], createOptions);

      const ticket = ticketDocs[0];
      const ticketId = ticket._id.toString();

      const qrCode = await QRCode.toDataURL(JSON.stringify({ ticketId }));
      ticket.qrCode = qrCode;

      const block = await BlockchainService.logAction(ticketId, 'SOLD', {
        concertId,
        seatLabel,
        userName
      }, session);

      ticket.blockchainHash = block.hash;

      lockedSeat.ticketId = ticket._id;
      lockedSeat.ownerName = userName;

      if (session) {
        await lockedSeat.save({ session });
        await ticket.save({ session });
      } else {
        await lockedSeat.save();
        await ticket.save();
      }

      return { ticketId, qrCode, blockchainHash: block.hash };
    });

    return result;
  }

  async validateTicket(ticketId) {
    const result = await runWithTransaction(async (session) => {
      const ticketQuery = Ticket.findById(ticketId);
      const ticket = session ? await ticketQuery.session(session) : await ticketQuery;
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      if (ticket.status === 'USED') throw new Error('Ticket already used');
      if (ticket.status === 'CANCELLED') throw new Error('Ticket cancelled');
      if (ticket.concertEndTime && ticket.concertEndTime < new Date()) {
        ticket.status = 'EXPIRED';
        ticket.expiresAt = new Date();
        if (session) {
          await ticket.save({ session });
        } else {
          await ticket.save();
        }
        await BlockchainService.logAction(ticket._id.toString(), 'EXPIRED', {
          reason: 'EVENT_ENDED'
        }, session);
        return { expired: true };
      }

      ticket.status = 'USED';
      ticket.usedAt = new Date();
      if (session) {
        await ticket.save({ session });
      } else {
        await ticket.save();
      }

      await BlockchainService.logAction(ticket._id.toString(), 'USED', {}, session);
      return { expired: false };
    });

    if (result?.expired) {
      throw new Error('Ticket expired');
    }

    return { success: true, message: 'Ticket validated successfully' };
  }

  async expireTickets() {
    const now = new Date();
    const expiredTickets = await runWithTransaction(async (session) => {
      const findQuery = Ticket.find({
        status: 'VALID',
        concertEndTime: { $lt: now }
      });

      const tickets = session ? await findQuery.session(session) : await findQuery;
      if (!tickets.length) {
        return [];
      }

      const ids = tickets.map((ticket) => ticket._id);
      const updateOptions = session ? { session } : {};

      await Ticket.updateMany(
        { _id: { $in: ids } },
        { $set: { status: 'EXPIRED', expiresAt: now } },
        updateOptions
      );

      for (const ticket of tickets) {
        await BlockchainService.logAction(ticket._id.toString(), 'EXPIRED', {
          concertId: ticket.concertId?.toString(),
          seatLabel: ticket.seatLabel
        }, session);
      }

      return tickets.map((ticket) => ({
        ticketId: ticket._id.toString(),
        userId: ticket.userId?.toString(),
        concertId: ticket.concertId?.toString(),
        seatLabel: ticket.seatLabel,
        status: 'EXPIRED'
      }));
    });

    return expiredTickets;
  }

  async cancelTicket(ticketId, userId) {
    const payload = await runWithTransaction(async (session) => {
      const ticketQuery = Ticket.findOne({ _id: ticketId, userId });
      const ticket = session ? await ticketQuery.session(session) : await ticketQuery;
      if (!ticket) {
        throw new Error('Ticket not found or unauthorized');
      }

      if (ticket.status !== 'VALID') {
        throw new Error('Only valid tickets can be cancelled');
      }

      ticket.status = 'CANCELLED';
      ticket.cancelledAt = new Date();
      if (session) {
        await ticket.save({ session });
      } else {
        await ticket.save();
      }

      const updateOptions = session ? { session } : {};
      await Seat.updateOne(
        { _id: ticket.seatId },
        { status: 'AVAILABLE', ownerName: null, ticketId: null },
        updateOptions
      );

      await BlockchainService.logAction(ticket._id.toString(), 'CANCELLED', {}, session);

      return {
        ticketId: ticket._id.toString(),
        concertId: ticket.concertId?.toString(),
        seatLabel: ticket.seatLabel,
        userId: ticket.userId?.toString()
      };
    });

    return {
      success: true,
      message: 'Ticket cancelled successfully',
      ...payload
    };
  }

  async changeTicketName(ticketId, userId, newName) {
    await runWithTransaction(async (session) => {
      const ticketQuery = Ticket.findOne({ _id: ticketId, userId });
      const ticket = session ? await ticketQuery.session(session) : await ticketQuery;
      if (!ticket) throw new Error('Ticket not found or unauthorized');
      if (ticket.status !== 'VALID') throw new Error('Only valid tickets can be updated');

      ticket.userName = newName;
      if (session) {
        await ticket.save({ session });
      } else {
        await ticket.save();
      }

      const updateOptions = session ? { session } : {};
      await Seat.updateOne(
        { _id: ticket.seatId },
        { ownerName: newName },
        updateOptions
      );

      await BlockchainService.logAction(ticket._id.toString(), 'NAME_CHANGE', { newName }, session);
    });

    return { success: true, message: 'Ticket name updated successfully' };
  }

  async getUserTickets(userId) {
    const tickets = await Ticket.find({ userId })
      .sort({ purchaseTime: -1 })
      .lean();

    return tickets.map((ticket) => ({
      id: ticket._id.toString(),
      status: ticket.status,
      qrCode: ticket.qrCode,
      hash: ticket.blockchainHash,
      ownerName: ticket.userName,
      seatLabel: ticket.seatLabel,
      concertName: ticket.concertName,
      artist: ticket.artist,
      venue: ticket.venue,
      startTime: ticket.concertStartTime,
      purchase_time: ticket.purchaseTime
    }));
  }
}

module.exports = new TicketService();
