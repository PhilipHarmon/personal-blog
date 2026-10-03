const express = require('express');
const Post = require('../models/Post');
const Subscriber = require('../models/Subscriber');
const Follow = require('../models/Follow');
const Comment = require('../models/Comment');
const Message = require('../models/Message');
const { authRequired, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats — admin only.
router.get('/stats', authRequired, requireAdmin, async (req, res, next) => {
  try {
    const [postCount, subscriberCount, followerCount, commentCount, messageCount] =
      await Promise.all([
        Post.countDocuments({}),
        Subscriber.countDocuments({}),
        Follow.countDocuments({}),
        Comment.countDocuments({}),
        Message.countDocuments({}),
      ]);

    return res.json({ postCount, subscriberCount, followerCount, commentCount, messageCount });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
