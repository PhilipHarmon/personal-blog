const express = require('express');
const Subscriber = require('../models/Subscriber');
const { authRequired, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/subscribe — public. Dedupe: already-subscribed returns {subscribed:true} too.
router.post('/', async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    const normalized = email.toLowerCase().trim();
    await Subscriber.updateOne(
      { email: normalized },
      { $setOnInsert: { email: normalized } },
      { upsert: true },
    );

    return res.json({ subscribed: true });
  } catch (err) {
    return next(err);
  }
});

// GET /api/subscribers — admin only, newest first.
router.get('/', authRequired, requireAdmin, async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });
    return res.json(subscribers);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
