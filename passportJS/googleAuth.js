const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require("../models");
const passport = require('passport');


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, done) {

        try {

            const existingUser = await User.findOne({ where: { email: profile.emails[0].value } });
            if (existingUser) {
                return done(null, existingUser);
            }
            const newUser = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
            });

            done(null, newUser);
        } catch (error) {
            done(error, null);
        }
    }
));


passport.serializeUser((user, done) => {
    // console.log("seriliaze", user);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

