import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setStatus('busy');
    setError('');
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.');
    }
  }

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="narrow auth-page">
      <h1>Create your account</h1>
      <p className="muted">
        Register as a reader to like posts, join discussions, and follow Philip.
      </p>
      <form className="form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="register-name">Name</label>
          <input
            id="register-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={status === 'busy'}
          />
        </div>
        <div className="field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={status === 'busy'}
          />
        </div>
        <div className="field">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            disabled={status === 'busy'}
          />
        </div>
        {status === 'error' && <p className="alert alert-error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={status === 'busy'}>
          {status === 'busy' ? 'Creating account…' : 'Register'}
        </button>
      </form>
      <p className="muted">
        Already have an account? <Link to="/login">Log in</Link>.
      </p>
    </div>
  );
}
