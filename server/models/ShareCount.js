const mongoose = require('mongoose');

const shareCountSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, unique: true },
  x: { type: Number, default: 0 },
  facebook: { type: Number, default: 0 },
  link: { type: Number, default: 0 },
  other: { type: Number, default: 0 },
  threads: { type: Number, default: 0 },
  tumblr: { type: Number, default: 0 },
});

module.exports = mongoose.model('ShareCount', shareCountSchema);
