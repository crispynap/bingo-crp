const express = require('express');
const router = express.Router();
const _ = require('partial-js');

const mongoose = require('mongoose');
const memberSchema = require('../models/members.js');
const doerSchema = require('../models/doers.js');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/testDB')
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.error(e));

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
      err => res.send(err).status(500);
    });
});

router.post('/members', (req, res) => {
  const memberInfos = req.body.memberInfos;

  addMembers(memberInfos)
    .then(() => res.send('ok'))
    .catch(err => res.send('error: ' + err).status(500));
});

router.delete('/members', (req, res) => {
  const codes = _.map(req.body.data, row => _.v(row, 'member_code'));

  removeMembers(codes)
    .then(res.send('삭제 완료').status(200))
    .catch(err => res.send('삭제 오류: ' + err).status(500));
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

function removeMembers(codes) {
  return new Promise((resolve, reject) => {
    _.each(codes, code => removeMember(code))
      .then(resolve)
      .catch(reject);
  });
}

function removeMember(code) {
  return new Promise((resolve, reject) => {
    memberSchema.findOne({ member_code: code })
      .then(member => { console.log(member.doer_id); return doerSchema.findByIdAndRemove(member.doer_id) })
      .then(() => memberSchema.findOneAndRemove({ member_code: code }))
      .then(resolve)
      .catch(reject);
  });
}




module.exports = router;