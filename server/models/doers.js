const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doerSchema = new Schema({
  name: { type: String, required: true, unique: true },
  category: String,
});

module.exports = mongoose.model('doer', doerSchema);