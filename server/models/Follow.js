const mongoose = require('mongoose');

// A reader following the blog author. One document per user (toggle model).
const followSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
});

module.exports = mongoose.model('Follow', followSchema);
