const db = require('../db');

class ConcertService {
  async createConcert(data) {
    const { name, description, venue, artist, startTime, endTime, capacity, rows, seatsPerRow, price } = data;
    
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      const concertResult = await client.query(
        'INSERT INTO events (name, description, venue, artist, start_time, end_time, capacity, rows_count, seats_per_row, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [name, description, venue, artist, startTime, endTime, capacity, rows, seatsPerRow, price || 50.00]
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
    const { name, description, venue, artist, startTime, endTime, price } = data;
    const result = await db.query(
      'UPDATE events SET name = $1, description = $2, venue = $3, artist = $4, start_time = $5, end_time = $6, price = $7 WHERE id = $8 RETURNING *',
      [name, description, venue, artist, startTime, endTime, price || 50.00, id]
    );
    return result.rows[0];
  }

  async getDashboardStats() {
    const totalEvents = await db.query('SELECT COUNT(*) FROM events');
    const totalTicketsSold = await db.query("SELECT COUNT(*) FROM tickets WHERE status = 'VALID' OR status = 'USED'");
    const totalUsers = await db.query("SELECT COUNT(*) FROM users WHERE role = 'USER'");
    
    // Calculate total revenue
    const revenueResult = await db.query(`
      SELECT SUM(e.price) as total_revenue
      FROM tickets t
      JOIN seats s ON t.seat_id = s.id
      JOIN events e ON s.event_id = e.id
      WHERE t.status IN ('VALID', 'USED')
    `);

    // Ticket status distribution
    const statusStats = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM tickets 
      GROUP BY status
    `);

    // Sales over the last 7 days
    const salesOverTime = await db.query(`
      SELECT DATE(purchase_time) as date, COUNT(*) as count
      FROM tickets
      WHERE purchase_time > CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(purchase_time)
      ORDER BY DATE(purchase_time) ASC
    `);

    const recentTickets = await db.query(`
      SELECT t.*, e.name as event_name, u.username as owner_name, s.seat_label
      FROM tickets t 
      JOIN seats s ON t.seat_id = s.id 
      JOIN events e ON s.event_id = e.id 
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.purchase_time DESC 
      LIMIT 10
    `);
    
    return {
      totalEvents: parseInt(totalEvents.rows[0].count),
      totalTicketsSold: parseInt(totalTicketsSold.rows[0].count),
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue || 0),
      statusStats: statusStats.rows,
      salesOverTime: salesOverTime.rows,
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
