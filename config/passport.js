/**
 * Created by Emmanuel on 4/3/2016.
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    User
        .find({ where: {email: email} })
        .then(function (foundUser) {
            if(!foundUser){
                return done(null, false, req.flash('loginMessage', 'Authentication failed. User not found.'));
            }
            var password_match = foundUser.comparePassword(req.body.password);
            if (!password_match) {
                return done(null, false, req.flash('loginMessage', 'Authentication failed. Wrong password.'));
            }
            return done(null, foundUser);
        }).catch(function (err) {
            return done(err);
        });
}));

exports.isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login');
};
