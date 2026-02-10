const express = require('express');
const router = express.Router();
const passport = require('passport');
const { login, getMe, googleAuthSuccess } = require('../controllers/authController');
const { protect } = require('../security/authMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            // Redirect to frontend login with error message
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=unregistered`);
        }
        req.user = user;
        next();
    })(req, res, next);
}, googleAuthSuccess);


module.exports = router;

