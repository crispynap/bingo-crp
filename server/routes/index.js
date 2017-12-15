const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'bingo CRP',
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
  res.render('pages/index/login.ejs', {
    title: 'bingo CRP',
  })
})

module.exports = router;