import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../auth.jsx';

export default function FollowButton({ compact = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [followerCount, setFollowerCount] = useState(null);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const { data } = await api.get('/follow/count');
      setFollowerCount(data.followerCount ?? 0);
    } catch {
      setFollowerCount(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle() {
    if (!user) {
      navigate('/login', { state: { from: '/', notice: 'Log in to follow Philip.' } });
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/follow');
      setFollowing(data.following);
      setFollowerCount(data.followerCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update follow status.');
    } finally {
      setBusy(false);
    }
  }

  const label = following ? 'Following' : 'Follow';

  return (
    <div className={compact ? 'follow-inline' : 'follow-block'}>
      <button
        className={`btn ${following ? 'btn-ghost' : 'btn-primary'} follow-btn`}
        onClick={toggle}
        disabled={busy}
        aria-pressed={following}
      >
        {busy ? '…' : label}
      </button>
      <span className="follow-count" title="Followers">
        {followerCount === null ? '' : `${followerCount} follower${followerCount === 1 ? '' : 's'}`}
      </span>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
