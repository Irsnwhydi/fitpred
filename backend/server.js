require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.startsWith('http://0.0.0.0') ||
      (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
    ) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  console.log(` ${req.method} ${req.path}`);
  next();
});

try { app.use('/api/auth', require('./routes/auth')); console.log(' /api/auth'); }
catch (e) { console.error(' /api/auth:', e.message); }

try { app.use('/api/profile', require('./routes/profile')); console.log(' /api/profile'); }
catch (e) { console.error(' /api/profile:', e.message); }

try { app.use('/api/health', require('./routes/health')); console.log(' /api/health'); }
catch (e) { console.error(' /api/health:', e.message); }

app.get('/api/health-check', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, message: 'FitPred API is running', database: 'connected' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
});

app.get('/api/ai-status', async (req, res) => {
  const { checkHealth } = require('./config/modelLoader');
  const status = await checkHealth();
  res.json({ success: true, ai_service: status });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} tidak ditemukan.` });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
});

app.listen(PORT, () => {
  console.log(`\n FitPred Backend running on port ${PORT}\n`);
});

module.exports = app;
