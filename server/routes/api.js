const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Member = require('../models/member');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test', {
  useMongoClient: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connected to mongod server");
});

router.get('/members', (req, res) => {
  res.send('aaa')

  Member.find(function (err, members) {
    if (err) return res.status(500).send({ error: 'database failure' });
    res.json(members);
  })
});

router.post('/members', (req, res) => {
  const member = new Member();
  const data = req.body;
  console.log(req.body);
  // member.SN = data.SN;
  // member.nick_name = data.nick_name;

  // member.save(function (err) {
  //   if (err) {
  //     console.error(err);
  //     res.json({ result: 0 });
  //     return;
  //   }

  res.json({ result: 1 });
  // });
});

router.put('/members/:member_id', (req, res) => {
  res.end();
});

router.delete('/members/:member_id', (req, res) => {
  res.end();
});

module.exports = router;