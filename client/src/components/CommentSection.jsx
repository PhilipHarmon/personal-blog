import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../auth.jsx';
import { formatDate } from './PostCard.jsx';

export default function CommentSection({ postId }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/posts/${postId}/comments`);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load comments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [postId]);

  async function submit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setPosting(true);
    setError('');
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text: trimmed });
      setComments((prev) => [...prev, data]);
      setText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post your comment.');
    } finally {
      setPosting(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this comment?')) return;
    setDeleting(id);
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Could not delete the comment.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="comments">
      <h2>Comments ({comments.length})</h2>

      {loading && <p className="muted">Loading comments…</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && comments.length === 0 && <p className="muted">No comments yet — be the first.</p>}

      <ul className="comment-list">
        {comments.map((c) => {
          const canDelete =
            user && (isAdmin || c.user?.id === user.id || c.userId === user.id);
          return (
            <li key={c.id} className="comment">
              <div className="comment-head">
                <strong>{c.user?.name || 'Reader'}</strong>
                <span className="muted"> · {formatDate(c.createdAt)}</span>
              </div>
              <p className="comment-text">{c.text}</p>
              {canDelete && (
                <button
                  className="btn btn-danger-outline btn-sm"
                  onClick={() => remove(c.id)}
                  disabled={deleting === c.id}
                >
                  {deleting === c.id ? 'Deleting…' : 'Delete'}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {user ? (
        <form className="comment-form" onSubmit={submit}>
          <label htmlFor="comment-text">Join the conversation</label>
          <textarea
            id="comment-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Commenting as ${user.name}…`}
            disabled={posting}
          />
          <button className="btn btn-primary" type="submit" disabled={posting || !text.trim()}>
            {posting ? 'Posting…' : 'Post comment'}
          </button>
        </form>
      ) : (
        <p className="comment-login-prompt">
          <Link to="/login">Log in</Link> to leave a comment.
        </p>
      )}
    </section>
  );
}
