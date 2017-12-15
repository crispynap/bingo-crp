const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'bingo CRP',
    highlighted: 'none'
  })
})

router.get('/guide', (req, res) => {
  res.render('pages/guide', {
    title: 'bingo CRP',
    highlighted: 'guide'
  })
})

router.get('/chart', (req, res) => {
  res.render('pages/chart', {
    title: 'bingo CRP',
    highlighted: 'chart'
  })
})

router.get('/manage', (req, res) => {
  res.render('pages/manage', {
    title: 'bingo CRP',
    highlighted: 'manage'
  })
})

router.get('/login', (req, res) => {
  res.render('pages/index/login.ejs', {
    title: 'bingo CRP',
    highlighted: 'login'
  })
})

module.exports = router;