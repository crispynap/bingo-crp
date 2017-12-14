const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/index.ejs', {
    title: 'bingo CRP',
  })
})

router.get('/guide', (req, res) => {
  res.render('pages/guide.ejs', {
    title: 'bingo CRP',
  })
})

module.exports = router;