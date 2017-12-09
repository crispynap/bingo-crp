const express = require('express');
const fs = require("fs");
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index.ejs', {
    title: 'bingo CRP',
    length: 5
  })
})

module.exports = router;