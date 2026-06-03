const pool = require('../config/database');
const { predict: callAIAPI } = require('../config/modelLoader');

const toFloat = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
};

const toInt = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseInt(v);
  return isNaN(n) ? null : n;
};

const toBit = (v) => (v === true || v === 'true' || v === 1 || v === '1') ? 1 : 0;
const toBool = (v) => (v === true || v === 'true' || v === 1 || v === '1');

const FIELD_LABELS = {
  Age: 'Usia', Height_cm: 'Tinggi Badan', Weight_kg: 'Berat Badan',
  Blood_Pressure_Systolic: 'Tekanan Darah Sistolik',
  Blood_Pressure_Diastolic: 'Tekanan Darah Diastolik',
  Cholesterol_Level: 'Kadar Kolesterol', Blood_Sugar_Level: 'Gula Darah',
  Daily_Steps: 'Langkah per Hari', Exercise_Frequency: 'Frekuensi Olahraga',
  Sleep_Hours: 'Jam Tidur', Caloric_Intake: 'Asupan Kalori',
  Protein_Intake: 'Asupan Protein', Carbohydrate_Intake: 'Asupan Karbohidrat',
  Fat_Intake: 'Asupan Lemak',
};

const submitHealthData = async (req, res) => {
  try {
    const d = req.body;

    if (!d.age || !d.height_cm || !d.weight_kg) {
      return res.status(400).json({
        success: false,
        message: 'Usia, tinggi badan, dan berat badan wajib diisi.',
      });
    }

    // Exact field names from PDF schema
    const aiPayload = {
      Age:                                    toInt(d.age),
      Height_cm:                              toFloat(d.height_cm),
      Weight_kg:                              toFloat(d.weight_kg),
      Blood_Pressure_Systolic:                toFloat(d.blood_pressure_systolic),
      Blood_Pressure_Diastolic:               toFloat(d.blood_pressure_diastolic),
      Cholesterol_Level:                      toFloat(d.cholesterol_level),
      Blood_Sugar_Level:                      toFloat(d.blood_sugar_level),
      Daily_Steps:                            toInt(d.daily_steps),
      Exercise_Frequency:                     toInt(d.exercise_frequency),
      Sleep_Hours:                            toFloat(d.sleep_hours),
      Caloric_Intake:                         toFloat(d.caloric_intake),
      Protein_Intake:                         toFloat(d.protein_intake),
      Carbohydrate_Intake:                    toFloat(d.carbohydrate_intake),
      Fat_Intake:                             toFloat(d.fat_intake),
      Gender_Male:                            toBit(d.gender_male),
      Gender_Other:                           toBit(d.gender_other),
      'Chronic_Disease_Heart Disease':        toBit(d.chronic_disease_heart),
      Chronic_Disease_Hypertension:           toBit(d.chronic_disease_hypertension),
      'Chronic_Disease_No Chronic Disease':   toBit(d.chronic_disease_none),
      Chronic_Disease_Obesity:               toBit(d.chronic_disease_obesity),
      Genetic_Risk_Factor_Yes:               toBit(d.genetic_risk_factor_yes),
      'Allergies_Lactose Intolerance':        toBit(d.allergies_lactose),
      'Allergies_No Allergies':               toBit(d.allergies_none),
      'Allergies_Nut Allergy':                toBit(d.allergies_nut),
      Alcohol_Consumption_Yes:               toBit(d.alcohol_consumption_yes),
      Smoking_Habit_Yes:                     toBit(d.smoking_habit_yes),
      Dietary_Habits_Regular:                toBit(d.dietary_habits_regular),
      Dietary_Habits_Vegan:                  toBit(d.dietary_habits_vegan),
      Dietary_Habits_Vegetarian:             toBit(d.dietary_habits_vegetarian),
      Preferred_Cuisine_Indian:              toBit(d.preferred_cuisine_indian),
      Preferred_Cuisine_Mediterranean:       toBit(d.preferred_cuisine_mediterranean),
      Preferred_Cuisine_Western:             toBit(d.preferred_cuisine_western),
      Food_Aversions_Salty:                  toBit(d.food_aversions_salty),
      Food_Aversions_Spicy:                  toBit(d.food_aversions_spicy),
      Food_Aversions_Sweet:                  toBit(d.food_aversions_sweet),
    };

    // Validate required numeric fields are not null
    const nullFields = Object.entries(aiPayload)
      .filter(([, v]) => v === null)
      .map(([k]) => FIELD_LABELS[k] || k);

    if (nullFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field berikut wajib diisi: ${nullFields.join(', ')}`,
      });
    }

    console.log(' Sending to AI API:', JSON.stringify(aiPayload, null, 2));

    let prediction;
    try {
      prediction = await callAIAPI(aiPayload);
    } catch (aiErr) {
      const detail = aiErr.response?.data?.detail;
      if (detail && Array.isArray(detail)) {
        const messages = detail.map(e => {
          const fieldRaw = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : String(e.loc);
          const fieldLabel = FIELD_LABELS[fieldRaw] || fieldRaw;
          return `${fieldLabel}: ${e.msg} (nilai: ${e.input})`;
        }).join('\n');
        return res.status(422).json({
          success: false,
          message: `Data tidak valid:\n${messages}`,
          detail,
        });
      }
      return res.status(503).json({
        success: false,
        message: 'Layanan AI tidak dapat dihubungi. Coba beberapa saat lagi.',
        error: aiErr.message,
      });
    }

    const client = await pool.connect();
    let savedInput, savedPrediction;
    try {
      await client.query('BEGIN');

      const inputResult = await client.query(
        `INSERT INTO health_inputs (
          user_id, age, height_cm, weight_kg,
          blood_pressure_systolic, blood_pressure_diastolic,
          cholesterol_level, blood_sugar_level, daily_steps,
          exercise_frequency, sleep_hours, caloric_intake,
          protein_intake, carbohydrate_intake, fat_intake,
          gender_male, gender_other,
          chronic_disease_heart, chronic_disease_hypertension,
          chronic_disease_none, chronic_disease_obesity,
          genetic_risk_factor_yes, allergies_lactose, allergies_none,
          allergies_nut, alcohol_consumption_yes, smoking_habit_yes,
          dietary_habits_regular, dietary_habits_vegan, dietary_habits_vegetarian,
          preferred_cuisine_indian, preferred_cuisine_mediterranean, preferred_cuisine_western,
          food_aversions_salty, food_aversions_spicy, food_aversions_sweet
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
          $16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,
          $28,$29,$30,$31,$32,$33,$34,$35,$36
        ) RETURNING *`,
        [
          req.user.id,
          aiPayload.Age, aiPayload.Height_cm, aiPayload.Weight_kg,
          aiPayload.Blood_Pressure_Systolic, aiPayload.Blood_Pressure_Diastolic,
          aiPayload.Cholesterol_Level, aiPayload.Blood_Sugar_Level,
          aiPayload.Daily_Steps, aiPayload.Exercise_Frequency, aiPayload.Sleep_Hours,
          aiPayload.Caloric_Intake, aiPayload.Protein_Intake,
          aiPayload.Carbohydrate_Intake, aiPayload.Fat_Intake,
          toBool(d.gender_male), toBool(d.gender_other),
          toBool(d.chronic_disease_heart), toBool(d.chronic_disease_hypertension),
          toBool(d.chronic_disease_none), toBool(d.chronic_disease_obesity),
          toBool(d.genetic_risk_factor_yes),
          toBool(d.allergies_lactose), toBool(d.allergies_none), toBool(d.allergies_nut),
          toBool(d.alcohol_consumption_yes), toBool(d.smoking_habit_yes),
          toBool(d.dietary_habits_regular), toBool(d.dietary_habits_vegan),
          toBool(d.dietary_habits_vegetarian), toBool(d.preferred_cuisine_indian),
          toBool(d.preferred_cuisine_mediterranean), toBool(d.preferred_cuisine_western),
          toBool(d.food_aversions_salty), toBool(d.food_aversions_spicy),
          toBool(d.food_aversions_sweet),
        ]
      );
      savedInput = inputResult.rows[0];

      const predResult = await client.query(
        `INSERT INTO prediction_results (
          user_id, health_input_id, predicted_class, recommended_meal_plan,
          confidence_score
        ) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [
          req.user.id, savedInput.id,
          prediction.predicted_class,
          prediction.recommended_meal_plan,
          prediction.confidence_score,
        ]
      );
      savedPrediction = predResult.rows[0];
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.status(201).json({
      success: true,
      message: 'Prediksi berhasil!',
      data: {
        input: { ...savedInput },
        prediction: savedPrediction,
        summary: {
          recommended_meal_plan: prediction.recommended_meal_plan,
          confidence_score:      prediction.confidence_score,
          raw_scores:            prediction.raw_scores,
        },
      },
    });
  } catch (error) {
    console.error('SubmitHealthData error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', detail: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT hi.*, pr.predicted_class, pr.recommended_meal_plan,
              pr.confidence_score, pr.predicted_at
       FROM health_inputs hi
       LEFT JOIN prediction_results pr ON pr.health_input_id = hi.id
       WHERE hi.user_id = $1
       ORDER BY hi.recorded_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM health_inputs WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page, limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error('GetHistory error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const getPrediction = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT hi.*, pr.predicted_class, pr.recommended_meal_plan,
              pr.confidence_score, pr.predicted_at
       FROM health_inputs hi
       LEFT JOIN prediction_results pr ON pr.health_input_id = hi.id
       WHERE hi.id = $1 AND hi.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('GetPrediction error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const statsResult = await pool.query(
      `SELECT COUNT(*) as total_checks, MAX(recorded_at) as last_check
       FROM health_inputs WHERE user_id = $1`,
      [req.user.id]
    );

    const recentResult = await pool.query(
      `SELECT hi.age, hi.weight_kg, hi.height_cm, hi.daily_steps, hi.sleep_hours,
              hi.exercise_frequency, hi.caloric_intake, hi.protein_intake,
              hi.carbohydrate_intake, hi.fat_intake, hi.recorded_at,
              pr.recommended_meal_plan, pr.confidence_score
       FROM health_inputs hi
       LEFT JOIN prediction_results pr ON pr.health_input_id = hi.id
       WHERE hi.user_id = $1
       ORDER BY hi.recorded_at DESC LIMIT 7`,
      [req.user.id]
    );

    const mealPlanCount = await pool.query(
      `SELECT recommended_meal_plan, COUNT(*) as count
       FROM prediction_results WHERE user_id = $1
       GROUP BY recommended_meal_plan ORDER BY count DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        stats:                 statsResult.rows[0],
        recent:                recentResult.rows,
        meal_plan_distribution: mealPlanCount.rows,
      },
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { submitHealthData, getHistory, getPrediction, getDashboardStats };
