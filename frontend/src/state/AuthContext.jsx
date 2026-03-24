import React, { createContext, useContext, useEffect, useState } from "react";

// Simple auth context storing user + JWT in localStorage.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
      } catch {
        // ignore parse errors
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    window.localStorage.setItem(
      "auth",
      JSON.stringify({ user: userData, token: accessToken })
    );
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem("auth");
  };

  const value = { user, token, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

