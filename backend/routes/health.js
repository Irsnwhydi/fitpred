const express = require('express');
const router = express.Router();
const { submitHealthData, getHistory, getPrediction, getDashboardStats } = require('../controllers/healthController');
const { authMiddleware } = require('../middleware/auth');

router.post('/predict', authMiddleware, submitHealthData);
router.get('/history', authMiddleware, getHistory);
router.get('/history/:id', authMiddleware, getPrediction);
router.get('/dashboard-stats', authMiddleware, getDashboardStats);

module.exports = router;
