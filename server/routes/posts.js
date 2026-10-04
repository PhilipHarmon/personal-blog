const express = require("express");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const ShareCount = require("../models/ShareCount");
const { authRequired, requireAdmin } = require("../middleware/auth");
const { notifySubscribers } = require("../notifySubscribers");

const router = express.Router();

const SHARE_PLATFORMS = ["x", "facebook", "link", "other"];

// --- helpers ---------------------------------------------------------------

function slugify(title) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "post"
  );
}

// Returns a slug guaranteed unique in the posts collection.
async function uniqueSlug(base, excludeId) {
  let slug = base;
  let n = 2;
  const filter = () => ({
    slug,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  while (await Post.exists(filter())) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

// Attaches req.user when a valid Bearer token is present; otherwise leaves it unset.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme === "Bearer" && token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.id, role: payload.role };
    } catch (err) {
      // Ignore bad/expired tokens on public endpoints.
    }
  }
  return next();
}

function isValidId(id) {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

// --- GET /api/posts?tag=&search=&page=&limit= (public, published only) ------

router.get("/", async (req, res, next) => {
  try {
    const { tag, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit, 10) || 10),
    );

    const filter = { published: true };
    if (tag) filter.tags = tag;
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: re }, { content: re }, { excerpt: re }];
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate("author", "name")
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    return next(err);
  }
});

// --- GET /api/posts/all (admin: every post, incl. drafts) -------------------

router.get("/all", authRequired, requireAdmin, async (req, res, next) => {
  try {
    const posts = await Post.find({})
      .populate("author", "name")
      .sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    return next(err);
  }
});

// --- GET /api/posts/:slug (public) ------------------------------------------

router.get("/:slug", optionalAuth, async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate(
      "author",
      "name",
    );
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const isAdmin = req.user && req.user.role === "admin";
    if (!post.published && !isAdmin) {
      return res.status(404).json({ error: "Post not found" });
    }

    const [likeCount, commentCount, shareDoc] = await Promise.all([
      Like.countDocuments({ post: post._id }),
      Comment.countDocuments({ post: post._id }),
      ShareCount.findOne({ post: post._id }),
    ]);

    return res.json({
      ...post.toObject(),
      likeCount,
      commentCount,
      shareCounts: {
        x: shareDoc ? shareDoc.x : 0,
        facebook: shareDoc ? shareDoc.facebook : 0,
        link: shareDoc ? shareDoc.link : 0,
        other: shareDoc ? shareDoc.other : 0,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// --- POST /api/posts (admin) ------------------------------------------------

router.post("/", authRequired, requireAdmin, async (req, res, next) => {
  try {
    const { title, content, excerpt, tags, coverImage, published } =
      req.body || {};

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const slug = await uniqueSlug(slugify(title));
    const isPublished = published === true;

    const post = await Post.create({
      title: title.trim(),
      slug,
      content,
      excerpt: excerpt || "",
      tags: Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean)
        : [],
      coverImage: coverImage || "",
      author: req.user.id,
      published: isPublished,
      publishedAt: isPublished ? new Date() : undefined,
    });

    if (isPublished) {
      // Notify subscribers in the background; never blocks the response.
      notifySubscribers(post);
    }

    return res.status(201).json(post);
  } catch (err) {
    return next(err);
  }
});

// --- PUT /api/posts/:id (admin) ---------------------------------------------

router.put("/:id", authRequired, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: "Post not found" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const { title, content, excerpt, tags, coverImage, published } =
      req.body || {};
    const wasPublished = post.published;

    // Regenerate the slug only when the title changed.
    if (title !== undefined && title !== post.title) {
      if (!title) {
        return res.status(400).json({ error: "Title cannot be empty" });
      }
      post.title = title.trim();
      post.slug = await uniqueSlug(slugify(post.title), post._id);
    }
    if (content !== undefined) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (tags !== undefined) {
      post.tags = Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean)
        : [];
    }
    if (published !== undefined) {
      const nowPublished = published === true;
      if (nowPublished && !post.published && !post.publishedAt) {
        post.publishedAt = new Date();
      }
      post.published = nowPublished;
    }

    await post.save();
    if (published === true && !wasPublished) {
      // Draft just went live — notify subscribers in the background.
      notifySubscribers(post);
    }
    return res.json(post);
  } catch (err) {
    return next(err);
  }
});

// --- DELETE /api/posts/:id (admin) ------------------------------------------

router.delete("/:id", authRequired, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: "Post not found" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await Promise.all([
      Like.deleteMany({ post: post._id }),
      Comment.deleteMany({ post: post._id }),
      ShareCount.deleteOne({ post: post._id }),
    ]);
    await post.deleteOne();

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

// --- POST /api/posts/:id/like (toggle, auth) --------------------------------

router.post("/:id/like", authRequired, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: "Post not found" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const existing = await Like.findOne({ post: post._id, user: req.user.id });
    let liked;
    if (existing) {
      await existing.deleteOne();
      liked = false;
    } else {
      await Like.create({ post: post._id, user: req.user.id });
      liked = true;
    }

    const likeCount = await Like.countDocuments({ post: post._id });
    return res.json({ liked, likeCount });
  } catch (err) {
    return next(err);
  }
});

// --- GET /api/posts/:id/comments (public, oldest first) ----------------------

router.get("/:id/comments", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: "Post not found" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = await Comment.find({ post: post._id })
      .populate("user", "name")
      .sort({ createdAt: 1 });

    return res.json(
      comments.map((c) => ({
        id: c._id.toString(),
        user: { name: c.user ? c.user.name : "Unknown" },
        text: c.text,
        createdAt: c.createdAt,
      })),
    );
  } catch (err) {
    return next(err);
  }
});

// --- POST /api/posts/:id/comments (auth) ------------------------------------

router.post("/:id/comments", authRequired, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: "Post not found" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const { text } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const comment = await Comment.create({
      post: post._id,
      user: req.user.id,
      text: text.trim(),
    });

    return res.status(201).json(comment);
  } catch (err) {
    return next(err);
  }
});

// --- POST /api/posts/:id/share (public) -------------------------------------

router.post("/:id/share", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ error: "Post not found" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const { platform } = req.body || {};
    if (!SHARE_PLATFORMS.includes(platform)) {
      return res
        .status(400)
        .json({ error: "Platform must be one of: x, facebook, link, other" });
    }

    const shareDoc = await ShareCount.findOneAndUpdate(
      { post: post._id },
      { $inc: { [platform]: 1 } },
      { new: true, upsert: true },
    );

    return res.json({
      shareCounts: {
        x: shareDoc.x,
        facebook: shareDoc.facebook,
        link: shareDoc.link,
        other: shareDoc.other,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
