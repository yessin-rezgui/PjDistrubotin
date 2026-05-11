const db = require('../src/db');

async function migrate() {
  try {
    console.log('Running migration: Add price to events');
    await db.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 50.00;');
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
