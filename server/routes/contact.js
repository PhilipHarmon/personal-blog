const express = require('express');
const Message = require('../models/Message');
const { authRequired, requireAdmin } = require('../middleware/auth');
const { sendContactNotification, sendMessageReply } = require('../mailer');

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

    // Notify Philip by email. Fire-and-forget: a mail failure must never
    // lose the message or fail the request.
    sendContactNotification({
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

// POST /api/contact/:id/reply — admin only; emails Philip's reply to the sender.
router.post('/:id/reply', authRequired, requireAdmin, async (req, res, next) => {
  try {
    const { reply } = req.body || {};
    if (!reply || !reply.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }
    const msg = await Message.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ error: 'Message not found' });
    }
    const result = await sendMessageReply({
      to: msg.email,
      name: msg.name,
      replyText: reply.trim(),
    });
    if (!result.sent) {
      return res.status(502).json({ error: result.reason || 'Could not send the reply email.' });
    }
    msg.repliedAt = new Date();
    msg.replyText = reply.trim();
    await msg.save();
    return res.json({ ok: true, repliedAt: msg.repliedAt });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
