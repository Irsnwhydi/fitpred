/**
 * FitPred Diagnostic Tool
 * Jalankan: node diagnose.js
 * Untuk cek apakah semua dependencies dan database sudah siap
 */

require('dotenv').config();
const path = require('path');

console.log('\n FitPred Backend Diagnostic\n' + '='.repeat(40));

// 1. Cek Node version
console.log(`\n1. Node.js Version: ${process.version}`);
const major = parseInt(process.version.slice(1));
if (major < 16) console.log('     Rekomendasi Node.js >= 16');
else console.log('    Node.js version OK');

// 2. Cek .env
console.log('\n2. Environment Variables:');
const required = ['DB_HOST','DB_PORT','DB_NAME','DB_USER','DB_PASSWORD','JWT_SECRET'];
required.forEach(key => {
  if (process.env[key]) console.log(`    ${key} = ${key.includes('PASSWORD') || key.includes('SECRET') ? '***' : process.env[key]}`);
  else console.log(`    ${key} TIDAK ADA di .env!`);
});

// 3. Cek dependencies
console.log('\n3. Dependencies:');
const deps = ['express','pg','bcryptjs','jsonwebtoken','cors','dotenv','axios'];
deps.forEach(dep => {
  try {
    require(dep);
    console.log(`    ${dep}`);
  } catch (e) {
    console.log(`    ${dep} — jalankan: npm install`);
  }
});

// 4. Cek routes
console.log('\n4. Routes:');
const routes = ['./routes/auth','./routes/profile','./routes/health'];
routes.forEach(r => {
  try {
    require(path.resolve(__dirname, r));
    console.log(`    ${r}`);
  } catch (e) {
    console.log(`    ${r} — Error: ${e.message}`);
  }
});

// 5. Cek database
console.log('\n5. Database Connection:');
(async () => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'fitpred_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      connectionTimeoutMillis: 5000,
    });
    await pool.query('SELECT 1');
    console.log('    Database terhubung!');
    
    // Cek tabel
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableNames = tables.rows.map(r => r.table_name);
    ['users','user_profiles','health_inputs','prediction_results'].forEach(t => {
      if (tableNames.includes(t)) console.log(`    Tabel "${t}" ada`);
      else console.log(`    Tabel "${t}" TIDAK ADA — jalankan schema.sql!`);
    });
    await pool.end();
  } catch (e) {
    console.log(`    Database error: ${e.message}`);
    console.log(`    Pastikan PostgreSQL jalan & password di .env benar`);
  }

  console.log('\n' + '='.repeat(40));
  console.log(' Diagnostic selesai. Jalankan: npm run dev\n');
})();
