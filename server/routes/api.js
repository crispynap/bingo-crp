const express = require('express');
const router = express.Router();
const _ = require('partial-js');

router.get('/members', (req, res) => {
  const query = "SELECT * FROM `조합원`;";
  sqlQuery(query, (err, result) => res.send(result));
});

router.get('/members/:ids', (req, res) => {
  const ids = req.params.ids.split('&');
  const idsQuery = _.reduce(ids, (memo, id) => {
    if (memo !== '') memo += ',';
    return memo + "'" + id + "'";
  }, '');

  const query = "SELECT * FROM `조합원` WHERE member_code in (" + idsQuery + ')';

  sqlQuery(query, (err, result) => res.send(result));
});

function sqlQuery(query, callback = () => { }) {
  const mysql_dbc = require('../config/db/db_con')();
  const connection = mysql_dbc.init();

  connection.query(query, callback);
}


router.post('/members', (req, res) => {
  const membersStructure = req.body.membersStructure;
  const structureQuery = _.reduce(membersStructure, (memo, fieldName) => {
    if (memo !== '(') memo += ', ';
    return memo + fieldName;
  }, '(') + ')';
  const membersData = req.body.membersData;
  const dataQuery = _.reduce(membersData, (memo, row) => {
    if (memo !== '') memo += ', ';
    return memo + _.reduce(row, (memo, field) => {
      if (memo !== '(') memo += ', ';
      return memo + "'" + field + "'";
    }, '(') + ')';
  }, '');

  const membersQuery = "INSERT INTO `조합원` " + structureQuery + " VALUES " + dataQuery + ";"
  console.log(membersQuery)
  // sqlQuery(membersQuery, console.log);
});

router.put('/members/:member_id', (req, res) => {
  res.end();
});

router.delete('/members/:member_id', (req, res) => {
  res.end();
});

module.exports = router;