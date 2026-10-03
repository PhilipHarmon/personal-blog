const express = require('express');
const Message = require('../models/Message');
const { authRequired, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact — public; stores the message.
router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    await Message.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
    });

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

// GET /api/contact — admin only, newest first.
router.get('/', authRequired, requireAdmin, async (req, res, next) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    return res.json(messages);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
