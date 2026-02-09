const express = require('express');
const router = express.Router();
const passport = require('passport');
const { adminLogin, getMe, googleAuthSuccess } = require('../controllers/authController');
const { protect } = require('../security/authMiddleware');

router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleAuthSuccess);


module.exports = router;

