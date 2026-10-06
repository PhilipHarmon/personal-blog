const express = require('express');
const Subscriber = require('../models/Subscriber');
const { authRequired, requireAdmin } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../mailer');
const { ensureUnsubscribeToken, siteUrl } = require('../notifySubscribers');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/subscribe — public. Dedupe: already-subscribed returns {subscribed:true} too.
// A welcome email goes out only for brand-new subscriptions.
router.post('/', async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    const normalized = email.toLowerCase().trim();
    const result = await Subscriber.updateOne(
      { email: normalized },
      { $setOnInsert: { email: normalized } },
      { upsert: true },
    );

    if (result.upsertedCount > 0) {
      const sub = await Subscriber.findOne({ email: normalized });
      const token = await ensureUnsubscribeToken(sub);
      // Fire and forget — a failed welcome email must not fail the signup.
      sendWelcomeEmail({
        email: normalized,
        unsubscribeUrl: `${siteUrl()}/unsubscribe?token=${token}`,
      }).catch((err) => console.error('Welcome email failed:', err.message));
    }

    return res.json({ subscribed: true });
  } catch (err) {
    return next(err);
  }
});

// GET /api/subscribe/unsubscribe/:token — public one-click unsubscribe.
router.get('/unsubscribe/:token', async (req, res, next) => {
  try {
    const sub = await Subscriber.findOneAndDelete({ unsubscribeToken: req.params.token });
    if (!sub) {
      return res.status(404).json({ error: 'This unsubscribe link is invalid or already used.' });
    }
    return res.json({ unsubscribed: true, email: sub.email });
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
