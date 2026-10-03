import React, { useState } from 'react';
import api from '../api.js';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | busy | done | error
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setStatus('busy');
    setError('');
    try {
      await api.post('/contact', { name: name.trim(), email: email.trim(), message: message.trim() });
      setStatus('done');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Could not send your message. Please try again.');
    }
  }

  return (
    <div className="narrow">
      <h1>Get in touch</h1>
      <p className="muted">
        Questions, story ideas, or just want to say hello? Drop me a line — I read everything.
      </p>

      {status === 'done' ? (
        <p className="alert alert-success">
          Thanks for reaching out! Your message is on its way and I'll get back to you soon.
        </p>
      ) : (
        <form className="form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={status === 'busy'}
            />
          </div>
          <div className="field">
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={status === 'busy'}
            />
          </div>
          <div className="field">
            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind?"
              disabled={status === 'busy'}
            />
          </div>
          {status === 'error' && <p className="alert alert-error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={status === 'busy'}>
            {status === 'busy' ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}
    </div>
  );
}
