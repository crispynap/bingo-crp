const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
  member_code: { type: Number, required: true, unique: true },
  doer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'doer' },
  rname: String,
  total_fund: Number,
  total_util: Number,
  join_date: Date,
  leave_date: Date,
  note: String,
  current: String,
  tel1: String,
  tel2: String,
  email: String,
  finance_account: String,
  celeb_date: Date,
  webpage: String,
  facebook: String,
  kakaotalk: String,
  addr: String,
  region: String,
  join_way: String,
});

module.exports = mongoose.model('member', memberSchema);