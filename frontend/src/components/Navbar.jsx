import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          FakeNewsDetect
        </Link>
        <Link to="/analyze" className="navbar-link">
          Analyze
        </Link>
        {user && (
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
        )}
        {user?.is_admin && (
          <Link to="/admin" className="navbar-link">
            Admin
          </Link>
        )}
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <span className="navbar-user">Hi, {user.name}</span>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
            <Link to="/signup" className="btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
