const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  // nick: { type: String, unique: true },
  password: { type: String, required: true },
  // email: String,
  // userCategory: String,
});

userSchema.methods.generateHash = password =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

userSchema.methods.validPassword = (password, user) =>
  bcrypt.compareSync(password, user.password);

module.exports = mongoose.model('user', userSchema);