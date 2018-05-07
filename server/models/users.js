const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userId: String,
  nick: String,
  password: String,
  email: String,
  userCategory: String,
});

module.exports = mongoose.model('user', userSchema);