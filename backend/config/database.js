const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fitpred_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

pool.on('connect', () => console.log('PostgreSQL connected — fitpred_db'));
pool.on('error', (err) => { console.error('DB error:', err); process.exit(-1); });

module.exports = pool;
