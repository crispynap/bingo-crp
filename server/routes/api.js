const express = require('express');
const router = express.Router();
const _ = require('partial-js');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/testDB');
const db = mongoose.connection;
db.on('error', () => console.log('MongoDB Connection Failed!'));
const memberSchema = require('../models/members.js');
const doerSchema = require('../models/doers.js');

router.get('/members', (req, res) => {
  memberSchema
    .find({}, { _id: false, __v: false })
    .populate('doer_id', 'name')
    .exec((err, members) => {
      const orderedMembers = _.map(members, memberRow => {
        row = memberRow._doc;
        row.name = row.doer_id.name;
        row = _.omit(row, 'doer_id')
        return row;
      });

      console.log(orderedMembers)
      res.send(orderedMembers);
    });
  // res.send('');

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

router.delete('/members', (req, res) => {
  const removingCodes = _.map(req.body.data, row => _.v(row, 'member_code'));

  _.each(removingCodes, memberCode => {
    memberSchema.findOneAndRemove({ member_code: memberCode }, (err) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send('삭제 완료');
    })
  })
});


function queryAndSend(query, res) {
  // const db = new mysqlDbc();
  // db.query(query)
  //   .then(rows => {
  //     res.send(rows);
  //     db.close();
  //   }, err => {
  //     console.log(err)
  //   })
}

function addMembers(memberInfos = {}) {
  return new Promise((resolve, reject) => {
    _.each(memberInfos, memberInfo => addMember(memberInfo))
      .then(
        () => resolve()
      );
  });


  // 10. Student 레퍼런스 전체 데이터 가져오기
  // Student.find(function (error, students) {
  //   console.log('--- Read all ---');
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log(students);
  //   }
  // })

  // // 11. 특정 아이디값 가져오기
  // Student.findOne({ _id: '585b777f7e2315063457e4ac' }, function (error, student) {
  //   console.log('--- Read one ---');
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log(student);
  //   }
  // });

  // 12. 특정아이디 수정하기
  // Student.findById({ _id: '585b777f7e2315063457e4ac' }, function (error, student) {
  //   console.log('--- Update(PUT) ---');
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     student.name = '--modified--';
  //     student.save(function (error, modified_student) {
  //       if (error) {
  //         console.log(error);
  //       } else {
  //         console.log(modified_student);
  //       }
  //     });
  //   }
  // });

  // 13. 삭제
  // Student.remove({ _id: '585b7c4371110029b0f584a2' }, function (error, output) {
  //   console.log('--- Delete ---');
  //   if (error) {
  //     console.log(error);
  //   }

  //   /* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
  //       어떤 과정을 반복적으로 수행 하여도 결과가 동일하다. 삭제한 데이터를 다시 삭제하더라도, 존재하지 않는 데이터를 제거요청 하더라도 오류가 아니기 때문에
  //       이부분에 대한 처리는 필요없다. 그냥 삭제 된것으로 처리
  //       */
  //   console.log('--- deleted ---');
  // });

}

function addMember(memberInfo = {}) {
  return new Promise((resolve, reject) => {


    const newDoer = new doerSchema({ name: memberInfo.name, category: '조합원' });
    newDoer.save((error, data) => {
      if (error) {
        console.log('db error: ', error);
        return;
      }

      doerSchema.findOne({ name: memberInfo.name }, function (error, savedDoer) {
        if (error) {
          console.log('db error: ', error);
          return;
        }

        const newMember = new memberSchema({ doer_id: savedDoer._id, member_code: memberInfo.member_code });
        newMember.save((error, data) => {
          if (error) {
            console.log('db error: ', error);
            return;
          }

          resolve();
        });

      });


    });

  });
}


module.exports = router;