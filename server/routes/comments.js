const express = require('express');
const Comment = require('../models/Comment');
const { authRequired, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// DELETE /api/comments/:id — comment owner or admin only.
router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const isOwner = comment.user.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not allowed to delete this comment' });
    }

    await comment.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
