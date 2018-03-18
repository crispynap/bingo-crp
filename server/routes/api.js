const express = require('express');
const router = express.Router();
const _ = require('partial-js');
const mysqlDbc = require('../config/db/db_con');

router.get('/members', (req, res) => {
  const query = "SELECT * FROM `조합원`;";
  queryAndSend(query, res)

  // addDoer('조합원', '모모');
});

router.get('/members/:ids', (req, res) => {
  const ids = req.params.ids.split('&');
  const idsQuery = _.reduce(ids, (memo, id) => {
    if (memo !== '') memo += ',';
    return memo + "'" + id + "'";
  }, '');

  const query = "SELECT * FROM `조합원` WHERE member_code in (" + idsQuery + ')';
  queryAndSend(query, res)
});

router.post('/members', (req, res) => {
  const membersInfos = req.body.membersInfos;
  _.each(membersInfos, membersInfo => addMember(membersInfo))
});

router.put('/members/:member_id', (req, res) => {
  res.end();
});

router.delete('/members/:member_id', (req, res) => {
  res.end();
});


function queryAndSend(query, res) {
  const db = new mysqlDbc();
  db.query(query)
    .then(rows => {
      res.send(rows);
      return db.close();
    }, err => {
      console.log(err)
    })
}

function addMember(memberInfo) {
  // const query = `INSERT INTO 주체 (doer_category, doer_name) VALUES ('${category}', '${name}')`;
  // memberInfo
  addDoer('조합원', memberInfo.name);
}

function addDoer(category, name) {
  const setQuery = `INSERT INTO 주체 (doer_category, doer_name) VALUES ('${category}', '${name}');`;
  const getQuery = `SELECT doer_code FROM 주체 WHERE doer_name='${name}';`;
  // database.query(setQuery)
  //   .then(rows => {
  //     database.close();
  //   })
  //   .then(rows => {
  //     console.log(rows)
  //   })
  //   .catch(err => {
  //     console.log(err)
  //   })
  // queryDB(setQuery).then(
  //   () => queryDB(getQuery)
  // )
  // queryDB(query);
  // queryDB(query);
}



// const membersStructure = req.body.membersStructure;
// const structureQuery = _.reduce(membersStructure, (memo, fieldName) => {
//   if (memo !== '(') memo += ', ';
//   return memo + fieldName;
// }, '(') + ')';
// const membersData = req.body.membersData;
// const dataQuery = _.reduce(membersData, (memo, row) => {
//   if (memo !== '') memo += ', ';
//   return memo + _.reduce(row, (memo, field) => {
//     if (memo !== '(') memo += ', ';
//     return memo + "'" + field + "'";
//   }, '(') + ')';
// }, '');

// const membersQuery = "INSERT INTO `조합원` " + structureQuery + " VALUES " + dataQuery + ";"
// queryDB(membersQuery);


module.exports = router;