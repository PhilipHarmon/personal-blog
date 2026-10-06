const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  // Set when Philip replies from the admin dashboard.
  repliedAt: { type: Date, default: null },
  replyText: { type: String, default: '' },
});

module.exports = mongoose.model('Message', messageSchema);
