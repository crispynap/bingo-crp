const LocalStrategy = require('passport-local').Strategy
const User = require('../models/users');

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use('signup', new LocalStrategy({
    usernameField: 'userId',
    passwordField: 'password',
    passReqToCallback: true
  }, function (req, userId, password, done) {

    User.findOne({ 'userId': userId }, function (err, user) {
      if (err) return done(err);
      if (user) {
        return done(null, false, req.flash('signupMessage', '이메일이 존재합니다.'));
      } else {
        var newUser = new User();
        newUser.userId = userId;
        newUser.password = newUser.generateHash(password);
        newUser.save(function (err) {
          if (err) throw err;
          return done(null, newUser);
        });
      }
    });
  }));

  passport.use('login', new LocalStrategy({
    usernameField: 'userId',
    passwordField: 'password',
    passReqToCallback: true
  },
    function (req, userId, password, done) {
      User.findOne({ 'userId': userId }, function (err, user) {
        if (err) return done(err);
        if (!user)
          return done(null, false, req.flash('loginMessage', '사용자를 찾을 수 없습니다.'));
        if (!user.validPassword(password, user))
          return done(null, false, req.flash('loginMessage', '비밀번호가 다릅니다.'));
        return done(null, user);
      });
    }));
};