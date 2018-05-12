const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'bingo CRP',
    nick: req.session.nick
  })
})

router.get('/manage', (req, res) => {
  res.render('pages/manage', {
    title: 'bingo CRP',
  })
})

router.get('/manage/member', (req, res) => {
  res.render('pages/manage/member', {
    title: 'bingo CRP',
  })
})

router.get('/manage/sheet', (req, res) => {
  res.render('pages/manage/sheet', {
    title: 'bingo CRP',
  })
})

router.get('/manage/action', (req, res) => {
  res.render('pages/manage/action', {
    title: 'bingo CRP',
  })
})

router.get('/guide', (req, res) => {
  res.render('pages/guide', {
    title: 'bingo CRP',
  })
})

router.get('/chart', (req, res) => {
  res.render('pages/chart', {
    title: 'bingo CRP',
  })
})

router.get('/login', (req, res) => {
  console.log(req.flash())
  res.render('pages/index/login.ejs', {
    title: 'bingo CRP',
    messages: req.flash("error")
  })
})

router.post('/login', passport.authenticate('login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

router.get('/logout', (req, res) => {
  delete req.session.nick;
  res.redirect('/');
});

router.get('/signup', (req, res) => {
  res.render('pages/index/signup.ejs', {
    title: 'bingo CRP',
  })
});

router.post('/signup', passport.authenticate('signup', {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash: true
}));

module.exports = router;