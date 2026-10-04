import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api.js';
import { formatDate } from '../components/PostCard.jsx';
import MarkdownToolbar from '../components/MarkdownToolbar.jsx';

const EMPTY_FORM = {
  title: '',
  content: '',
  excerpt: '',
  tags: '',
  coverImage: '',
  published: false,
};

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('posts');

  // Editor state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const contentRef = useRef(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, postsRes, subsRes, msgsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/posts/all'),
        api.get('/subscribe'),
        api.get('/contact'),
      ]);
      setStats(statsRes.data);
      setPosts(Array.isArray(postsRes.data) ? postsRes.data : postsRes.data?.posts || []);
      setSubscribers(Array.isArray(subsRes.data) ? subsRes.data : subsRes.data?.subscribers || []);
      setMessages(Array.isArray(msgsRes.data) ? msgsRes.data : msgsRes.data?.messages || []);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Could not load the admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function loadComments(postId) {
    if (commentsByPost[postId]) {
      // toggle off
      setCommentsByPost((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      return;
    }
    try {
      const { data } = await api.get(`/posts/${postId}/comments`);
      setCommentsByPost((prev) => ({ ...prev, [postId]: data }));
    } catch {
      setError('Could not load comments for that post.');
    }
  }

  async function deleteComment(postId, commentId) {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
      }));
    } catch {
      setError('Could not delete the comment.');
    }
  }

  function startNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setTab('editor');
  }

  function startEdit(post) {
    setEditingId(post.id);
    setForm({
      title: post.title || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      tags: (post.tags || []).join(', '),
      coverImage: post.coverImage || '',
      published: !!post.published,
    });
    setFormError('');
    setTab('editor');
  }

  async function savePost(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const payload = {
      title: form.title.trim(),
      content: form.content,
      excerpt: form.excerpt.trim(),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      coverImage: form.coverImage.trim(),
      published: !!form.published,
    };
    try {
      if (editingId) {
        await api.put(`/posts/${editingId}`, payload);
      } else {
        await api.post('/posts', payload);
      }
      setEditingId(null);
      setForm(EMPTY_FORM);
      setTab('posts');
      await loadDashboard();
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Could not save the post.');
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(id) {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError('Could not delete the post.');
    }
  }

  function setField(name) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [name]: value }));
    };
  }

  if (loading) {
    return (
      <div className="narrow">
        <p className="muted">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="admin">
      <h1>Admin dashboard</h1>
      {error && <p className="alert alert-error">{error}</p>}

      {stats && (
        <div className="stat-grid">
          <StatCard label="Posts" value={stats.postCount} />
          <StatCard label="Subscribers" value={stats.subscriberCount} />
          <StatCard label="Followers" value={stats.followerCount} />
          <StatCard label="Comments" value={stats.commentCount} />
          <StatCard label="Messages" value={stats.messageCount} />
        </div>
      )}

      <nav className="admin-tabs">
        {['posts', 'editor', 'comments', 'subscribers', 'messages'].map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'editor' ? (editingId ? 'Edit post' : 'New post') : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      {tab === 'posts' && (
        <section>
          <div className="admin-row">
            <h2>All posts</h2>
            <button className="btn btn-primary" onClick={startNew}>
              + New post
            </button>
          </div>
          <ul className="admin-post-list">
            {posts.map((p) => (
              <li key={p.id} className="admin-post-item">
                <div>
                  <strong>{p.title}</strong>
                  <span className={`pill${p.published ? ' pill-live' : ''}`}>
                    {p.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="muted"> · {formatDate(p.publishedAt || p.createdAt)}</span>
                </div>
                <div className="admin-post-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-danger-outline btn-sm"
                    onClick={() => deletePost(p.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {posts.length === 0 && <p className="muted">No posts yet — write the first one.</p>}
        </section>
      )}

      {tab === 'editor' && (
        <section>
          <h2>{editingId ? 'Edit post' : 'New post'}</h2>
          <form className="form" onSubmit={savePost}>
            <div className="field">
              <label htmlFor="ed-title">Title</label>
              <input
                id="ed-title"
                type="text"
                required
                value={form.title}
                onChange={setField('title')}
              />
            </div>
            <div className="field">
              <label htmlFor="ed-excerpt">Excerpt</label>
              <textarea
                id="ed-excerpt"
                rows={2}
                value={form.excerpt}
                onChange={setField('excerpt')}
                placeholder="A short teaser shown on the feed…"
              />
            </div>
            <div className="field">
              <label htmlFor="ed-content">Content (markdown)</label>
              <MarkdownToolbar
                textareaRef={contentRef}
                value={form.content}
                onChange={(content) => setForm((f) => ({ ...f, content }))}
              />
              <textarea
                id="ed-content"
                ref={contentRef}
                rows={14}
                required
                value={form.content}
                onChange={setField('content')}
                placeholder="Write your post in markdown…"
              />
            </div>
            <div className="field">
              <label htmlFor="ed-tags">Tags (comma-separated)</label>
              <input
                id="ed-tags"
                type="text"
                value={form.tags}
                onChange={setField('tags')}
                placeholder="writing, fatherhood, raleigh"
              />
            </div>
            <div className="field">
              <label htmlFor="ed-cover">Cover image URL</label>
              <input
                id="ed-cover"
                type="url"
                value={form.coverImage}
                onChange={setField('coverImage')}
                placeholder="https://…"
              />
            </div>
            <div className="field field-checkbox">
              <input
                id="ed-published"
                type="checkbox"
                checked={form.published}
                onChange={setField('published')}
              />
              <label htmlFor="ed-published">Published</label>
            </div>
            {formError && <p className="alert alert-error">{formError}</p>}
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create post'}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                  setTab('posts');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {tab === 'comments' && (
        <section>
          <h2>Comment moderation</h2>
          <p className="muted">Expand a post to see its comments, and delete anything that needs to go.</p>
          <ul className="admin-post-list">
            {posts.map((p) => (
              <li key={p.id} className="admin-post-item admin-comment-post">
                <div className="admin-row">
                  <strong>{p.title}</strong>
                  <button className="btn btn-ghost btn-sm" onClick={() => loadComments(p.id)}>
                    {commentsByPost[p.id] ? 'Hide comments' : 'Show comments'}
                  </button>
                </div>
                {commentsByPost[p.id] && (
                  <ul className="comment-list">
                    {commentsByPost[p.id].length === 0 && (
                      <li className="muted">No comments.</li>
                    )}
                    {commentsByPost[p.id].map((c) => (
                      <li key={c.id} className="comment">
                        <div className="comment-head">
                          <strong>{c.user?.name || 'Reader'}</strong>
                          <span className="muted"> · {formatDate(c.createdAt)}</span>
                        </div>
                        <p className="comment-text">{c.text}</p>
                        <button
                          className="btn btn-danger-outline btn-sm"
                          onClick={() => deleteComment(p.id, c.id)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'subscribers' && (
        <section>
          <h2>Subscribers ({subscribers.length})</h2>
          {subscribers.length === 0 ? (
            <p className="muted">No subscribers yet.</p>
          ) : (
            <ul className="simple-list">
              {subscribers.map((s, i) => (
                <li key={s.id || i}>
                  {s.email}
                  {s.createdAt && <span className="muted"> · {formatDate(s.createdAt)}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'messages' && (
        <section>
          <h2>Contact messages ({messages.length})</h2>
          {messages.length === 0 ? (
            <p className="muted">No messages yet.</p>
          ) : (
            <ul className="message-list">
              {messages.map((m, i) => (
                <li key={m.id || i} className="message">
                  <div className="comment-head">
                    <strong>{m.name}</strong>
                    <span className="muted"> · {m.email}</span>
                    {m.createdAt && <span className="muted"> · {formatDate(m.createdAt)}</span>}
                  </div>
                  <p>{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value ?? 0}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
