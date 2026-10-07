import React from 'react';
import { Link } from 'react-router-dom';
import SubscribeForm from './SubscribeForm.jsx';
import SocialLinks from './SocialLinks.jsx';
import { donationUrl, moreFromPhilip } from '../siteConfig.js';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h3>Philip's Blog</h3>
          <p className="muted">Writing, reading, family life, and learning software in Raleigh, NC.</p>
          <SocialLinks />
          {donationUrl && (
            <a
              className="donate-btn"
              href={donationUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              ♥ Support this blog
            </a>
          )}
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
        <div className="footer-col">
          <h4>Also from Philip Harmon</h4>
          <nav className="footer-nav">
            {moreFromPhilip.map((item) => {
              const base = (item.url || '').replace(/\/+$/, '');
              const href = item.demo ? `${base}?demo=1` : base;
              return (
                <a
                  key={item.name}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={item.blurb}
                >
                  {item.demo ? `${item.name} (demo)` : item.name}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
      <p className="footer-copy">© {year} Philip Culpepper. All rights reserved.</p>
    </footer>
  );
}
