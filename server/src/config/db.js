const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// PostgreSQL Connection Pool Setup
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE || 'stockpilot_db',
  user: process.env.PGUSER || process.env.USER || 'bajiyadav',
  password: process.env.PGPASSWORD || undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

// Helper function to query the database
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // Optional query logger during development
  // console.log('Executed query', { text: text.slice(0, 60), duration, rows: res.rowCount });
  return res;
};

// Auto initialize tables from schema.sql
const initDB = async () => {
  try {
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ PostgreSQL Schema initialized successfully.');
  } catch (err) {
    console.error('❌ Error initializing PostgreSQL tables:', err.message);
  }
};

module.exports = {
  pool,
  query,
  initDB
};
