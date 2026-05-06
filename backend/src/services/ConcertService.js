const db = require('../db');

class ConcertService {
  async createConcert(data) {
    const { name, description, venue, artist, startTime, endTime, capacity, rows, seatsPerRow } = data;
    
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      const concertResult = await client.query(
        'INSERT INTO events (name, description, venue, artist, start_time, end_time, capacity, rows_count, seats_per_row) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [name, description, venue, artist, startTime, endTime, capacity, rows, seatsPerRow]
      );
      
      const concert = concertResult.rows[0];
      
      // Auto-generate seats
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let r = 0; r < rows; r++) {
        const rowLabel = alphabet[r] || `R${r}`;
        for (let s = 1; s <= seatsPerRow; s++) {
          const seatLabel = `${rowLabel}${s}`;
          await client.query(
            'INSERT INTO seats (event_id, row_label, seat_number, seat_label) VALUES ($1, $2, $3, $4)',
            [concert.id, rowLabel, s, seatLabel]
          );
        }
      }
      
      await client.query('COMMIT');
      return concert;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getAllConcerts() {
    const result = await db.query('SELECT * FROM events ORDER BY start_time ASC');
    return result.rows;
  }

  async getConcertById(id) {
    const result = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    return result.rows[0];
  }

  async deleteConcert(id) {
    await db.query('DELETE FROM events WHERE id = $1', [id]);
    return true;
  }

  async updateConcert(id, data) {
    const { name, description, venue, artist, startTime, endTime } = data;
    const result = await db.query(
      'UPDATE events SET name = $1, description = $2, venue = $3, artist = $4, start_time = $5, end_time = $6 WHERE id = $7 RETURNING *',
      [name, description, venue, artist, startTime, endTime, id]
    );
    return result.rows[0];
  }

  async getDashboardStats() {
    const totalEvents = await db.query('SELECT COUNT(*) FROM events');
    const totalTicketsSold = await db.query("SELECT COUNT(*) FROM tickets WHERE status = 'VALID' OR status = 'USED'");
    const recentTickets = await db.query(`
      SELECT t.*, e.name as event_name 
      FROM tickets t 
      JOIN seats s ON t.seat_id = s.id 
      JOIN events e ON s.event_id = e.id 
      ORDER BY t.purchase_time DESC 
      LIMIT 5
    `);
    
    return {
      totalEvents: parseInt(totalEvents.rows[0].count),
      totalTicketsSold: parseInt(totalTicketsSold.rows[0].count),
      recentTickets: recentTickets.rows
    };
  }

  async getSeats(concertId) {
    const result = await db.query(
      'SELECT s.*, t.status as ticket_status, t.user_name as owner_name FROM seats s LEFT JOIN tickets t ON s.id = t.seat_id WHERE s.event_id = $1 ORDER BY s.row_label, s.seat_number',
      [concertId]
    );
    return result.rows;
  }
}

module.exports = new ConcertService();
