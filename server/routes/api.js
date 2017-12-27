const express = require('express');
const router = express.Router();
const Member = require('../models/member');
// var fs = require("fs");
// var testDB = fs.readFileSync("./test.json");
var testDB = require('../test/test.json')

router.get('/members', (req, res) => {
  // Member.find(function (err, members) {
  //   if (err) return res.status(500).send({ error: 'database failure' });
  //   res.json(members);
  // })
  res.json(testDB)
});

router.post('/members', (req, res) => {
  const member = new Member();
  const data = req.body;
  member.SN = data.SN;
  member.nick_name = data.nick_name;

  member.save(function (err) {
    if (err) {
      console.error(err);
      res.json({ result: 0 });
      return;
    }

    res.json({ result: 1 });
  });
});

router.put('/members/:member_id', (req, res) => {
  res.end();
});

router.delete('/members/:member_id', (req, res) => {
  res.end();
});

module.exports = router;