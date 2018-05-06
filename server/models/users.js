const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  usernameField: Stirng,
  passwordField: String
});

module.exports = mongoose.model('user', userSchema);