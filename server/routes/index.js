const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/index.ejs', {
    title: 'bingo CRP',
    highlighted: 'none'
  })
})

router.get('/guide', (req, res) => {
  res.render('pages/guide.ejs', {
    title: 'bingo CRP',
    highlighted: 'guide'
  })
})

router.get('/manage', (req, res) => {
  res.render('pages/manage.ejs', {
    title: 'bingo CRP',
    highlighted: 'manage'
  })
})

router.get('/chart', (req, res) => {
  res.render('pages/chart.ejs', {
    title: 'bingo CRP',
    highlighted: 'chart'
  })
})

router.get('/login', (req, res) => {
  res.render('pages/login.ejs', {
    title: 'bingo CRP',
    highlighted: 'login'
  })
})

module.exports = router;