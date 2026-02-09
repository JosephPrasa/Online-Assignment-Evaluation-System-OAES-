const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../schemas/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user);
        }

        // If not, create a new user
        // Note: You can decide the default role here. Defaulting to 'student'
        user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'student' // Default role for Google Sign-In
        });

        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// We only need the strategy for JWT issuance, but Passport requires these to be defined if using session: false isn't enough
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
