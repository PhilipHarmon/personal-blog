import React, { useEffect, useMemo, useState } from "react";
import api from "../api.js";
import PostCard from "../components/PostCard.jsx";

const PAGE_SIZE = 8;

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(p = page, q = search, tag = activeTag) {
    setLoading(true);
    setError("");
    try {
      const params = { page: p, limit: PAGE_SIZE };
      if (q.trim()) params.search = q.trim();
      if (tag) params.tag = tag;
      const { data } = await api.get("/posts", { params });
      setPosts(data.posts || []);
      setTotal(data.total ?? 0);
      setPage(data.page ?? 1);
      setPages(Math.max(data.pages ?? 1, 1));
    } catch {
      setError("Could not load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1, search, activeTag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    load(1, search, activeTag);
  }

  function pickTag(tag) {
    const next = tag === activeTag ? "" : tag;
    setActiveTag(next);
    load(1, search, next);
  }

  function goToPage(p) {
    if (p < 1 || p > pages || p === page) return;
    load(p, search, activeTag);
  }

  // Derive a tag cloud from the posts currently loaded.
  const tagCloud = useMemo(() => {
    const counts = {};
    for (const post of posts) {
      for (const t of post.tags || []) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [posts]);

  return (
    <div className="narrow">
      <section className="hero">
        <h1>Mindless Musings: A Quirky Blog</h1>
        <p className="hero-sub">
          Thoughts on writing, reading, fatherhood, music, nostalgia,
          bartending, and all points in between — from Raleigh, North Carolina.
        </p>
      </section>

      <form className="feed-controls" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search posts"
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
        {(search || activeTag) && (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              setSearch("");
              setActiveTag("");
              load(1, "", "");
            }}
          >
            Clear
          </button>
        )}
      </form>

      {tagCloud.length > 0 && (
        <div className="tag-cloud">
          {tagCloud.map(([tag, n]) => (
            <button
              key={tag}
              className={`tag tag-btn${tag === activeTag ? " active" : ""}`}
              onClick={() => pickTag(tag)}
            >
              {tag} <span className="tag-count">({n})</span>
            </button>
          ))}
        </div>
      )}

      {loading && <p className="muted">Loading posts…</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p className="muted">No posts found. Try a different search or tag.</p>
      )}

      <div className="post-grid">
        {posts.map((post) => (
          <PostCard key={post.id || post.slug} post={post} />
        ))}
      </div>

      {pages > 1 && (
        <nav className="pagination" aria-label="Post pages">
          <button
            className="btn btn-ghost"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            ← Prev
          </button>
          <span className="page-info">
            Page {page} of {pages} ({total} post{total === 1 ? "" : "s"})
          </span>
          <button
            className="btn btn-ghost"
            onClick={() => goToPage(page + 1)}
            disabled={page >= pages}
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}
