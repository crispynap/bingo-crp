const express = require('express');
const router = express.Router();
const _ = require('partial-js');
const mysqlDbc = require('../config/db/db_con');

router.get('/members', (req, res) => {
  const query = "SELECT * FROM `members_view`;";
  queryAndSend(query, res)
});

router.get('/members/:ids', (req, res) => {
  const ids = req.params.ids.split('&');
  const idsQuery = _.reduce(ids, (memo, id) => {
    if (memo !== '') memo += ',';
    return memo + "'" + id + "'";
  }, '');

  const query = "SELECT * FROM `members_view` WHERE member_code in (" + idsQuery + ')';
  queryAndSend(query, res)
});

router.post('/members', (req, res) => {
  const memberInfos = req.body.memberInfos;

  addMembers(memberInfos)
    .then(() => res.end('ok'))
    .catch(() => res.end('error'));
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
      db.close();
    }, err => {
      console.log(err)
    })
}

function addMembers(memberInfos = {}) {
  return new Promise((resolve, reject) => {
    _.each(memberInfos, memberInfo => addMember(memberInfo))
      .then(
        () => resolve()
      );
  });
}

function addMember(memberInfo = {}) {
  console.log(memberInfo)

  return new Promise((resolve, reject) => {
    const addDoerQuery = `INSERT INTO 주체 (doer_category, doer_name) VALUES ('조합원', '${memberInfo.doer_name}');`;
    const getDoerCodeQuery = `SELECT doer_code FROM 주체 WHERE doer_name='${memberInfo.doer_name}';`;
    const db = new mysqlDbc();

    _.go('',
      () => db.query(addDoerQuery),
      result => db.query(getDoerCodeQuery),
      rows => {
        const doerCode = rows[0].doer_code;
        let fieldNames = 'doer_code';
        let fieldValues = `'${doerCode}'`;
        _.each(_.pairs(_.omit(memberInfo, 'doer_name')), field => {
          fieldNames += ', ' + field[0];
          if (field[1].indexOf('date') === '') field[1] = undefined;
          fieldValues += `, '${field[1]}'`
        })
        const addMemberQuery = `INSERT INTO 조합원 (${fieldNames}) VALUES (${fieldValues});`;
        return db.query(addMemberQuery);
      },
      rows => db.close(),
      rows => resolve()
    )
  })
}


module.exports = router;