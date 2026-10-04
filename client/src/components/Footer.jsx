import React from "react";
import { Link } from "react-router-dom";
import SubscribeForm from "./SubscribeForm.jsx";
import SocialLinks from "./SocialLinks.jsx";
import { donationUrl } from "../siteConfig.js";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h3>Mindless Musings: A Quirky Blog</h3>
          <p className="muted">
            Bringing you the most randomly insightful and humorously
            enlightening musings from Raleigh, NC.
          </p>
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
      </div>
      <p className="footer-copy">
        © {year} Philip Harmon. All rights reserved.
      </p>
    </footer>
  );
}
