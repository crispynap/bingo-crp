const express = require('express');
const router = express.Router();
const _ = require('partial-js');

router.get('/members', (req, res) => {
  const query = "SELECT * FROM `조합원`;";
  queryAndSend(query, res);
});

router.get('/members/:ids', (req, res) => {
  const ids = req.params.ids.split('&');
  const idsQuery = _.reduce(ids, (memo, id) => {
    if (memo !== '') memo += ',';
    return memo + "'" + id + "'";
  }, '');

  const query = "SELECT * FROM `조합원` WHERE member_code in (" + idsQuery + ')';

  queryAndSend(query, res);
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