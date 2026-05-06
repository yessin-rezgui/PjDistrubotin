const db = require('../db');
const QRCode = require('qrcode');
const BlockchainService = require('./BlockchainService');

class TicketService {
  async buyTicket(concertId, seatLabel, userId, userName) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Check if concert started
      const concertRes = await client.query('SELECT start_time FROM events WHERE id = $1', [concertId]);
      if (concertRes.rows.length === 0) throw new Error('Concert not found');
      if (new Date(concertRes.rows[0].start_time) < new Date()) {
        throw new Error('Ticket purchase not allowed after event start time');
      }

      // 2. Lock the seat for update (CRITICAL: Atomic booking)
      const seatRes = await client.query(
        'SELECT id, status FROM seats WHERE event_id = $1 AND seat_label = $2 FOR UPDATE',
        [concertId, seatLabel]
      );

      if (seatRes.rows.length === 0) throw new Error('Seat not found');
      const seat = seatRes.rows[0];

      if (seat.status !== 'AVAILABLE') {
        throw new Error('Seat already sold or reserved');
      }

      // 3. Create Ticket
      const ticketRes = await client.query(
        'INSERT INTO tickets (seat_id, user_id, user_name, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [seat.id, userId, userName, 'VALID']
      );
      const ticketId = ticketRes.rows[0].id;

      // 4. Update Seat Status
      await client.query('UPDATE seats SET status = $1 WHERE id = $2', ['SOLD', seat.id]);

      // 5. Generate QR Code (simplified: just ticketId)
      const qrCode = await QRCode.toDataURL(JSON.stringify({ ticketId }));
      await client.query('UPDATE tickets SET qr_code = $1 WHERE id = $2', [qrCode, ticketId]);

      // 6. Log to Blockchain
      const block = await BlockchainService.logAction(ticketId, 'SOLD', {
        concertId,
        seatLabel,
        userName
      }, client);
      await client.query('UPDATE tickets SET blockchain_hash = $1 WHERE id = $2', [block.hash, ticketId]);

      await client.query('COMMIT');
      
      return { ticketId, qrCode, blockchainHash: block.hash };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async validateTicket(ticketId) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Lock ticket for update
      const ticketRes = await client.query(
        'SELECT t.*, e.end_time FROM tickets t JOIN seats s ON t.seat_id = s.id JOIN events e ON s.event_id = e.id WHERE t.id = $1 FOR UPDATE',
        [ticketId]
      );

      if (ticketRes.rows.length === 0) throw new Error('Ticket not found');
      const ticket = ticketRes.rows[0];

      if (ticket.status === 'USED') throw new Error('Ticket already used');
      if (ticket.status === 'CANCELLED') throw new Error('Ticket cancelled');
      if (new Date(ticket.end_time) < new Date()) {
        await client.query('UPDATE tickets SET status = $1 WHERE id = $2', ['EXPIRED', ticketId]);
        throw new Error('Ticket expired');
      }

      // Mark as USED
      await client.query('UPDATE tickets SET status = $1 WHERE id = $2', ['USED', ticketId]);

      // Log to Blockchain
      await BlockchainService.logAction(ticketId, 'USED', {}, client);

      await client.query('COMMIT');
      return { success: true, message: 'Ticket validated successfully' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async expireTickets() {
    // Cron job logic
    const result = await db.query(`
      UPDATE tickets 
      SET status = 'EXPIRED' 
      FROM seats, events 
      WHERE tickets.seat_id = seats.id 
      AND seats.event_id = events.id 
      AND events.end_time < NOW() 
      AND tickets.status = 'VALID'
      RETURNING tickets.id
    `);
    return result.rowCount;
  }

  async cancelTicket(ticketId, userId) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const ticketRes = await client.query(
        'SELECT id, status, seat_id FROM tickets WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [ticketId, userId]
      );

      if (ticketRes.rows.length === 0) throw new Error('Ticket not found or unauthorized');
      const ticket = ticketRes.rows[0];

      if (ticket.status !== 'VALID') throw new Error('Only valid tickets can be cancelled');

      // Update status to CANCELLED
      await client.query('UPDATE tickets SET status = $1 WHERE id = $2', ['CANCELLED', ticketId]);
      
      // Make seat AVAILABLE again
      await client.query('UPDATE seats SET status = $1 WHERE id = $2', ['AVAILABLE', ticket.seat_id]);

      // Log to Blockchain
      await BlockchainService.logAction(ticketId, 'CANCELLED', {}, client);

      await client.query('COMMIT');
      return { success: true, message: 'Ticket cancelled successfully' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async changeTicketName(ticketId, userId, newName) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const ticketRes = await client.query(
        'SELECT id, status FROM tickets WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [ticketId, userId]
      );

      if (ticketRes.rows.length === 0) throw new Error('Ticket not found or unauthorized');
      if (ticketRes.rows[0].status !== 'VALID') throw new Error('Only valid tickets can be updated');

      await client.query('UPDATE tickets SET user_name = $1 WHERE id = $2', [newName, ticketId]);

      // Log to Blockchain
      await BlockchainService.logAction(ticketId, 'NAME_CHANGE', { newName }, client);

      await client.query('COMMIT');
      return { success: true, message: 'Ticket name updated successfully' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new TicketService();
