import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const from = location.state?.from || '/';
  const notice = location.state?.notice;

  async function submit(e) {
    e.preventDefault();
    setStatus('busy');
    setError('');
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Check your email and password.');
    }
  }

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="narrow auth-page">
      <h1>Log in</h1>
      {notice && <p className="alert alert-info">{notice}</p>}
      <form className="form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'busy'}
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={status === 'busy'}
          />
        </div>
        {status === 'error' && <p className="alert alert-error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={status === 'busy'}>
          {status === 'busy' ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="muted">
        No account yet? <Link to="/register">Register here</Link>.
      </p>
    </div>
  );
}
