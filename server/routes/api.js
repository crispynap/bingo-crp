const express = require('express');
const router = express.Router();
// var fs = require("fs");
// var testDB = fs.readFileSync("./test.json");
var testDB = require('../test/test.json')

router.get('/members', (req, res) => {
  const query = "SELECT `COLUMN_COMMENT` FROM information_schema.COLUMNS WHERE `TABLE_NAME` = '조합원';";
  const mysql_dbc = require('../config/db/db_con')();
  const connection = mysql_dbc.init();
  connection.query(query, function (err, result) {
    res.json(result);
  });

  // res.json(testDB)
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