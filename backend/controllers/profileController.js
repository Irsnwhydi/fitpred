const pool = require('../config/database');

const getProfile = async (req, res) => {
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

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profil tidak ditemukan.' });
    }

    const stats = await pool.query(
      `SELECT
        COUNT(DISTINCT hi.id) as total_checks,
        MAX(hi.recorded_at) as last_check,
        null as avg_bmi,
        COUNT(DISTINCT pr.id) as total_predictions
       FROM health_inputs hi
       LEFT JOIN prediction_results pr ON pr.user_id = hi.user_id
       WHERE hi.user_id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: { ...result.rows[0], stats: stats.rows[0] }
    });
  } catch (error) {
    console.error('GetProfile error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      full_name, date_of_birth, gender, phone, address, city, country,
      bio, height_cm, weight_kg, blood_type, activity_level,
      dietary_preference, health_goals
    } = req.body;

    const result = await pool.query(
      `UPDATE user_profiles SET
        full_name = COALESCE($1, full_name),
        date_of_birth = COALESCE($2, date_of_birth),
        gender = COALESCE($3, gender),
        phone = COALESCE($4, phone),
        address = COALESCE($5, address),
        city = COALESCE($6, city),
        country = COALESCE($7, country),
        bio = COALESCE($8, bio),
        height_cm = COALESCE($9, height_cm),
        weight_kg = COALESCE($10, weight_kg),
        blood_type = COALESCE($11, blood_type),
        activity_level = COALESCE($12, activity_level),
        dietary_preference = COALESCE($13, dietary_preference),
        health_goals = COALESCE($14, health_goals),
        updated_at = NOW()
       WHERE user_id = $15
       RETURNING *`,
      [
        full_name || null, date_of_birth || null, gender || null,
        phone || null, address || null, city || null, country || null,
        bio || null, height_cm || null, weight_kg || null,
        blood_type || null, activity_level || null,
        dietary_preference || null, health_goals || null,
        req.user.id
      ]
    );

    res.json({ success: true, message: 'Profil berhasil diperbarui.', data: result.rows[0] });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { avatar_url } = req.body;
    await pool.query(
      'UPDATE user_profiles SET avatar_url = $1, updated_at = NOW() WHERE user_id = $2',
      [avatar_url || null, req.user.id]
    );
    res.json({ success: true, message: 'Foto profil berhasil diperbarui.', data: { avatar_url } });
  } catch (error) {
    console.error('UpdateAvatar error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getProfile, updateProfile, updateAvatar };
