import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../auth.jsx';

export default function LikeButton({ postId, initialLiked = false, initialCount = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!user) {
      navigate('/login', { state: { notice: 'Log in to like posts.' } });
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      setLiked(data.liked);
      setCount(data.likeCount);
    } catch {
      // leave state as-is on failure
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={`like-btn${liked ? ' liked' : ''}`}
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike this post' : 'Like this post'}
    >
      <span className="like-heart">{liked ? '♥' : '♡'}</span>
      <span className="like-count">{count}</span>
    </button>
  );
}
