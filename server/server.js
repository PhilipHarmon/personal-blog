require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');
const followRoutes = require('./routes/follow');
const subscribeRoutes = require('./routes/subscribe');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: restrict to CLIENT_URL origins in production (comma-separated);
// allow all origins when unset (dev default).
const clientUrl = (process.env.CLIENT_URL || '').trim();
app.use(
  cors(
    clientUrl
      ? { origin: clientUrl.split(',').map((s) => s.trim()).filter(Boolean) }
      : undefined,
  ),
);
app.use(express.json());

// Health check (not part of the shared contract, harmless to keep).
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Shared API contract routes.
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// 404 for unknown API routes.
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Centralized error handler.
app.use((err, req, res, _next) => {
  console.error(err);
  // Mongoose duplicate-key errors surface as 500s unless a route handled them;
  // treat them as conflicts here as a safety net.
  if (err && err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate value' });
  }
  const status = err.status || 500;
  return res.status(status).json({ error: err.message || 'Internal server error' });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Blog API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

module.exports = app;
