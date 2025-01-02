const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./models');
const bcrypt = require('bcryptjs');

exports.initializingPassport = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                const user = await User.findOne({ where: { email } });
                if (!user) {
                    return done(null, false, { message: 'No user with that email' });
                }

                // Match password
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Password incorrect' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        })
    );

    passport.serializeUser((user, done) => {
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
};
