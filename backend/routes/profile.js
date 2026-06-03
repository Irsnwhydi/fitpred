const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateAvatar } = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);
router.put('/avatar', authMiddleware, updateAvatar);

module.exports = router;
