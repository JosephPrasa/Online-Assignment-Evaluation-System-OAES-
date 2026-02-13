const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../schemas/User');

const { findUserByEmail } = require('../helpers/userHelper');
const StudentProfile = require('../schemas/student/StudentProfile');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await findUserByEmail(profile.emails[0].value);

        if (user) {
            return done(null, user);
        }

        // If not found, create a new StudentProfile
        try {
            const newUser = await StudentProfile.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                // Assign a dummy password hash as they login via Google.
                // In a real app, you might flag this user as "google-auth-only" or handle empty passwords.
                // For now, we'll hash a random string.
                passwordHash: '$2a$10$DUMMYHASHFORGOOGLEUSER' + Date.now(),
                // departmentId is optional now, so we can skip it.
            });

            // Return the new user with role 'student' attached (helper logic typically handles this, but here we return doc)
            // The callback handler in authRoutes checks req.user later.
            // But wait, passport needs the user object.
            // We should return the user document.
            // We can attach .role = 'student' to the object we pass to done, 
            // but Mongoose documents are specific.
            // Let's just return the newUser. 
            // Our userHelper.findUserById adds the 'role' property manually.
            // For the immediate callback, we might need it? 
            // In authRoutes: googleAuthSuccess uses req.user._id and req.user.role.
            // So we need to ensure req.user has role.

            const userWithRole = { ...newUser.toObject(), role: 'student' };
            return done(null, userWithRole);

        } catch (err) {
            console.error("Error creating Google user:", err);
            return done(err, null);
        }

    } catch (error) {
        done(error, null);
    }
}));


