import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import FollowButton from "./FollowButton.jsx";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="site-title">
          Mindless Musings: A Quirky Blog
        </Link>
        <nav className="site-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/subscribe">Subscribe</Link>
          {isAdmin && (
            <Link to="/admin" className="nav-admin">
              Admin
            </Link>
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
    </header>
  );
}
