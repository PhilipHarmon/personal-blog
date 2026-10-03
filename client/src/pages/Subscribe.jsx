import React from 'react';
import SubscribeForm from '../components/SubscribeForm.jsx';

export default function Subscribe() {
  return (
    <div className="narrow">
      <h1>Subscribe</h1>
      <p className="muted">
        Get new posts delivered straight to your inbox. No spam, no selling your address —
        just writing when there's something worth reading.
      </p>
      <div className="subscribe-panel">
        <SubscribeForm />
      </div>
    </div>
  );
}
