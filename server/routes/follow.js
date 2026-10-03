const express = require('express');
const Follow = require('../models/Follow');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /api/follow — toggles the current reader following the blog author.
router.post('/', authRequired, async (req, res, next) => {
  try {
    const existing = await Follow.findOne({ user: req.user.id });
    let following;
    if (existing) {
      await existing.deleteOne();
      following = false;
    } else {
      await Follow.create({ user: req.user.id });
      following = true;
    }

    const followerCount = await Follow.countDocuments({});
    return res.json({ following, followerCount });
  } catch (err) {
    return next(err);
  }
});

// GET /api/follow/count — public.
router.get('/count', async (req, res, next) => {
  try {
    const followerCount = await Follow.countDocuments({});
    return res.json({ followerCount });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
