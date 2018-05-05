const express = require('express');
const router = express.Router();
const _ = require('partial-js');

const mongoose = require('mongoose');
const db = mongoose.connection;
const memberSchema = require('../models/members.js');
const doerSchema = require('../models/doers.js');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/testDB');
db.on('error', () => console.log('MongoDB Connection Failed!'));

router.get('/members', (req, res) => {
  memberSchema
    .find({}, { _id: false, __v: false })
    .populate('doer_id', 'name')
    .then(members => {
      const orderedMembers = _.map(members, memberRow => {
        row = memberRow._doc;
        row.name = row.doer_id.name;
        row = _.omit(row, 'doer_id')
        return row;
      });

      res.send(orderedMembers);
    })
    .catch(err => {
      console.error(err);
    });
});

router.post('/members', (req, res) => {
  const memberInfos = req.body.memberInfos;

  addMembers(memberInfos)
    .then(() => res.end('ok'))
    .catch(err => res.end('error: ' + err));
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


function addMembers(memberInfos = {}) {
  return new Promise((resolve, reject) => {
    _.each(memberInfos, memberInfo => addMember(memberInfo))
      .then(resolve)
      .catch(reject);
  });
}

function addMember(memberInfo = {}) {
  return new Promise((resolve, reject) => {
    const newDoer = new doerSchema({ name: memberInfo.name, category: '조합원' });
    newDoer.save()
      .then(() => doerSchema.findOne({ name: memberInfo.name }))
      .then(savedDoer => {
        const newMember = new memberSchema({ doer_id: savedDoer._id, member_code: memberInfo.member_code });
        newMember.save();
      })
      .then(resolve)
      .catch(reject);
  });
}


module.exports = router;