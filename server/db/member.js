const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
  SN: {
    type: Schema.Types.ObjectId,
    required: true
  },
  nick_name: {
    type: String,
    required: true
  },
  nick_choseong: {
    type: String,
    // required: true
  },
  community: String,
  group: String,
  join_date: { type: Date, default: Date.now },
  real_name: String,
  phone_1: String,
  phone_2: String,
  email: String,
  birthday: String,
  blog: String,
  address: String,
  note: String,
  current: String
});

module.exports = mongoose.model('member', memberSchema);