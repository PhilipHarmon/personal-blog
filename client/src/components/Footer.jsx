import React from 'react';
import { Link } from 'react-router-dom';
import SubscribeForm from './SubscribeForm.jsx';
import SocialLinks from './SocialLinks.jsx';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h3>Philip's Blog</h3>
          <p className="muted">Writing, reading, family life, and learning software in Raleigh, NC.</p>
          <SocialLinks />
        </div>
        <div className="footer-col">
          <h4>Explore</h4>
          <nav className="footer-nav">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/subscribe">Subscribe</Link>
          </nav>
        </div>
        <div className="footer-col">
          <h4>Get new posts by email</h4>
          <SubscribeForm inline />
        </div>
      </div>
      <p className="footer-copy">© {year} Philip Culpepper. All rights reserved.</p>
    </footer>
  );
}
