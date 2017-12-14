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

module.exports = router;