const { Pool } = require('pg');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Auto-initialize database
const initDb = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../../db/init.sql'), 'utf8');
    await pool.query(sql);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

initDb();

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  // Helper for transactions
  getTransaction: async () => {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);
    
    const begin = () => query('BEGIN');
    const commit = () => query('COMMIT');
    const rollback = () => query('ROLLBACK');
    
    return { query, release, begin, commit, rollback };
  }
};
