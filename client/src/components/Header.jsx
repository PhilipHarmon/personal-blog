import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import FollowButton from './FollowButton.jsx';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="site-title" onClick={closeMenu}>
          Mindless Musings:
          <br />A Quirky Blog
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
        </button>
        <div className={`header-menu${menuOpen ? ' open' : ''}`} onClick={closeMenu}>
          <nav className="site-nav" aria-label="Site">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/subscribe">Subscribe</NavLink>
            {isAdmin && (
              <NavLink to="/admin" className="nav-admin">
                Admin
              </NavLink>
            )}
          </nav>
          <div className="header-auth">
            <FollowButton compact />
            {user ? (
              <>
                <span className="header-user">Hi, {user.name}</span>
                <button className="btn btn-ghost" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
