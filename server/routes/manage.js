const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/manage', {
    title: 'bingo CRP',
  })
})

router.get('/member', (req, res) => {
  res.render('pages/manage/member', {
    title: 'bingo CRP',
  })
})

router.get('/sheet', (req, res) => {
  res.render('pages/manage/sheet', {
    title: 'bingo CRP',
  })
})

router.get('/action', (req, res) => {
  res.render('pages/manage/action', {
    title: 'bingo CRP',
  })
})

module.exports = router;