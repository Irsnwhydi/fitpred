const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, changeUsername } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/change-password', authMiddleware, changePassword);
router.put('/change-username', authMiddleware, changeUsername);

module.exports = router;
