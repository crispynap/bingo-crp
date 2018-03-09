const express = require('express');
const router = express.Router();

router.get('/members', (req, res) => {
  if (JSON.stringify(req.query) === '{}') {

    const query = "SELECT * FROM `조합원`;";
    queryAndSend(query, res);

  } else {

    const query = "SELECT * FROM `조합원` WHERE member_code = ";
    // const ids = JSON.parse(req.query);
    console.log(req.query);
    queryAndSend(query, res);
  }

});

function queryAndSend(query, res) {
  const mysql_dbc = require('../config/db/db_con')();
  const connection = mysql_dbc.init();
  connection.query(query, function (err, result) {
    res.send(result);
  });
}

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