const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/index/index.ejs', {
    title: 'bingo CRP',
    highlighted: 'none'
  })
})

router.get('/guide', (req, res) => {
  res.render('pages/index/guide.ejs', {
    title: 'bingo CRP',
    highlighted: 'guide'
  })
})

router.get('/manage', (req, res) => {
  res.render('pages/index/manage.ejs', {
    title: 'bingo CRP',
    highlighted: 'manage'
  })
})

router.get('/chart', (req, res) => {
  res.render('pages/index/chart.ejs', {
    title: 'bingo CRP',
    highlighted: 'chart'
  })
})

router.get('/login', (req, res) => {
  res.render('pages/index/login.ejs', {
    title: 'bingo CRP',
    highlighted: 'login'
  })
})

module.exports = router;