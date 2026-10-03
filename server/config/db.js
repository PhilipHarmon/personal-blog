const mongoose = require('mongoose');

// Global plugin: every model serializes with a clean `id` field instead of
// Mongo's `_id` (the client uses `id` everywhere).
mongoose.plugin((schema) => {
  schema.set('toJSON', {
    transform: (doc, ret) => {
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
      delete ret.__v;
      return ret;
    },
  });
});


// Connect to MongoDB using MONGO_URI from the environment.
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB connected');
}

module.exports = connectDB;
