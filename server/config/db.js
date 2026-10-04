const mongoose = require("mongoose");

// Global plugin: every model serializes with a clean `id` field instead of
// Mongo's `_id` (the client uses `id` everywhere). Must be registered before
// any model file is loaded — db.js is required first by server.js and seed.js.
// Applies to both toJSON (res.json) and toObject (spread into responses).
mongoose.plugin((schema) => {
  const transform = (doc, ret) => {
    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }
    delete ret.__v;
    return ret;
  };
  schema.set("toJSON", { transform });
  schema.set("toObject", { transform });
});
