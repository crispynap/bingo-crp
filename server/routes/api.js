const express = require('express');
const router = express.Router();
const _ = require('partial-js');

const mongoose = require('mongoose');
const Members = require('../models/members.js');
const Doers = require('../models/doers.js');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/testDB')
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.error(e));

router.get('/members', (req, res) => {
  Members
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

  if (!_.isEmpty(memberInfos)) {
    addMembers(memberInfos)
      .then(() => res.send('ok'))
      .catch(err => res.send('error: ' + err).status(500));
  }
});

router.put('/members', (req, res) => {
  const memberInfos = req.body.memberInfos;

  if (!_.isEmpty(memberInfos)) {
    modifyMembers(memberInfos)
      .then(() => res.send('ok'))
      .catch(err => res.send('error: ' + err).status(500));
  }
});


router.delete('/members', (req, res) => {
  const codes = _.map(req.body.data, row => _.v(row, 'member_code'));

  if (!_.isEmpty(codes)) {
    removeMembers(codes)
      .then(res.send('삭제 완료').status(200))
      .catch(err => res.send('삭제 오류: ' + err).status(500));
  }
});


function addMembers(memberInfos) {
  return new Promise((resolve, reject) => {
    _.each(memberInfos, memberInfo => addMember(memberInfo))
      .then(resolve)
      .catch(reject);
  });
}

function addMember(memberInfo) {
  return new Promise((resolve, reject) => {
    const newDoer = new Doers({ name: memberInfo.name, category: '조합원' });
    newDoer.save()
      .then(() => Doers.findOne({ name: memberInfo.name }))
      .then(savedDoer => {
        let newMember = new Members({ doer_id: savedDoer._id, member_code: memberInfo.member_code });
        newMember = _.extend(newMember, _.omit(memberInfo, 'name'));
        newMember.save();
      })
      .then(resolve)
      .catch(reject);
  });
}


function modifyMembers(memberInfos) {
  return new Promise((resolve, reject) => {
    _.each(memberInfos, memberInfo => modifyMember(memberInfo))
      .then(resolve)
      .catch(reject);
  });
}

function modifyMember(memberInfo) {
  return new Promise((resolve, reject) => {

    Members.findOneAndUpdate({ member_code: memberInfo.member_code }, _.omit(memberInfo, 'name'))
      .then(member => Doers.findByIdAndUpdate(member.doer_id, { name: memberInfo.name }))
      .then(resolve)
      .catch(reject)

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
    Members.findOne({ member_code: code })
      .then(member => Doers.findByIdAndRemove(member.doer_id))
      .then(() => Members.findOneAndRemove({ member_code: code }))
      .then(resolve)
      .catch(reject);
  });
}




module.exports = router;