const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async (req, res) => {
  try {
    console.log(' Register attempt:', req.body);
    const { username, password, full_name, gender, date_of_birth } = req.body;

    if (!username || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Nama lengkap, username, dan password wajib diisi.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
    }

    if (username.length < 3) {
      return res.status(400).json({ success: false, message: 'Username minimal 3 karakter.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Username sudah digunakan, coba yang lain.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
        [username.toLowerCase(), hashedPassword]
      );
      const newUser = userResult.rows[0];

      await client.query(
        'INSERT INTO user_profiles (user_id, full_name, gender, date_of_birth) VALUES ($1, $2, $3, $4)',
        [newUser.id, full_name, gender || null, date_of_birth || null]
      );

      await client.query('COMMIT');

      const token = jwt.sign(
        { userId: newUser.id, username: newUser.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil!',
        data: {
          token,
          user: { ...newUser, full_name }
        }
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(' Register error:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', detail: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
    }

    const result = await pool.query(
      `SELECT u.id, u.username, u.password, u.is_active, u.created_at,
              p.full_name, p.avatar_url, p.gender, p.city, p.date_of_birth
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.username = $1`,
      [username.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Akun telah dinonaktifkan.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login berhasil!',
      data: { token, user: userWithoutPassword }
    });
  } catch (error) {
    console.error(' Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.created_at,
              p.full_name, p.date_of_birth, p.gender, p.phone, p.address,
              p.city, p.country, p.avatar_url, p.bio, p.height_cm, p.weight_kg,
              p.blood_type, p.activity_level, p.dietary_preference, p.health_goals,
              p.updated_at as profile_updated_at
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const isMatch = await bcrypt.compare(current_password, result.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password saat ini salah.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashed, req.user.id]);

    res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};


const changeUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || username.length < 3) {
      return res.status(400).json({ success: false, message: 'Username minimal 3 karakter.' });
    }
    if (/\s/.test(username)) {
      return res.status(400).json({ success: false, message: 'Username tidak boleh mengandung spasi.' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username.toLowerCase(), req.user.id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Username sudah digunakan.' });
    }
    await pool.query('UPDATE users SET username = $1, updated_at = NOW() WHERE id = $2', [username.toLowerCase(), req.user.id]);
    res.json({ success: true, message: 'Username berhasil diubah.' });
  } catch (error) {
    console.error('ChangeUsername error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { register, login, getMe, changePassword, changeUsername };
