import React, { useState } from 'react';
import api from '../api.js';

const ZERO = { x: 0, facebook: 0, link: 0, other: 0 };

export default function ShareButtons({ postId, title, slug }) {
  const [shareCounts, setShareCounts] = useState(ZERO);
  const [copied, setCopied] = useState(false);

  const postUrl = `${window.location.origin}/post/${slug}`;

  async function record(platform) {
    try {
      const { data } = await api.post(`/posts/${postId}/share`, { platform });
      if (data.shareCounts) setShareCounts({ ...ZERO, ...data.shareCounts });
    } catch {
      // share recording is best-effort; never block the share itself
    }
  }

  async function shareX() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'noopener,width=600,height=460');
    await record('x');
  }

  async function shareFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'noopener,width=600,height=460');
    await record('facebook');
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(postUrl);
    } catch {
      // clipboard API unavailable; fall back to a prompt-less selection-free approach
      const ta = document.createElement('textarea');
      ta.value = postUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    await record('link');
  }

  async function webShare() {
    try {
      await navigator.share({ title, url: postUrl });
      await record('other');
    } catch {
      // user cancelled or share failed — no record
    }
  }

  const total = Object.values(shareCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="share-block">
      <span className="share-label">Share this post</span>
      <div className="share-buttons">
        <button className="btn btn-ghost share-btn" onClick={shareX}>
          𝕏 Post
        </button>
        <button className="btn btn-ghost share-btn" onClick={shareFacebook}>
          Facebook
        </button>
        <button className="btn btn-ghost share-btn" onClick={copyLink}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        {navigator.share && (
          <button className="btn btn-ghost share-btn" onClick={webShare}>
            Share…
          </button>
        )}
      </div>
      {total > 0 && <span className="share-counts">{total} shares</span>}
    </div>
  );
}
