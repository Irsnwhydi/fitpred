const axios = require('axios');

const AI_API_URL = process.env.AI_API_URL || 'https://model-api-production-9ded.up.railway.app';
const AI_API_KEY = process.env.AI_API_KEY || '';

// Class labels confirmed by AI Engineer team
// Class 0 = High-Protein Diet
// Class 1 = Low-Carb Diet
// Class 2 = Low-Fat Diet
const MEAL_PLAN_LABELS = {
  0: 'High-Protein Diet',
  1: 'Low-Carb Diet',
  2: 'Low-Fat Diet',
};

const buildHeaders = () => {
  const h = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  if (AI_API_KEY) h['Authorization'] = `Bearer ${AI_API_KEY}`;
  return h;
};

const predict = async (payload) => {
  const response = await axios.post(`${AI_API_URL}/predict`, payload, {
    headers: buildHeaders(),
    timeout: 15000,
  });

  const r = response.data;
  console.log(' Raw AI API response:', JSON.stringify(r, null, 2));

  if (!r.recommendation || r.confidence === undefined || !Array.isArray(r.raw_scores)) {
    throw new Error(`Format response AI tidak dikenali: ${JSON.stringify(r)}`);
  }

  const rawScores  = r.raw_scores;
  const maxVal     = Math.max(...rawScores);
  const predIdx    = rawScores.indexOf(maxVal);
  const totalScore = rawScores.reduce((a, b) => a + b, 0);

  const confidenceScore = parseFloat((r.confidence * 100).toFixed(2));

  const result = {
    predicted_class:       predIdx,
    recommended_meal_plan: r.recommendation,
    confidence_score:      confidenceScore,
    raw_scores:            rawScores,
  };

  console.log(' Parsed prediction:', result);
  return result;
};

const checkHealth = async () => {
  try {
    const res = await axios.get(`${AI_API_URL}/`, {
      headers: buildHeaders(),
      timeout: 5000,
    });
    return { status: 'ok', ...res.data };
  } catch (err) {
    const code = err.response?.status;
    if (code === 403) return { status: 'ok', note: 'Railway allowlist active' };
    if (code === 404) return { status: 'ok', note: 'No root endpoint' };
    return { status: 'offline', error: err.message };
  }
};

module.exports = { predict, checkHealth, MEAL_PLAN_LABELS };
