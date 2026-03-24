import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage, SignupPage } from "./pages/AuthPage.jsx";
import { AnalyzePage } from "./pages/AnalyzePage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { AdminPage } from "./pages/AdminPage.jsx";
import { useAuth } from "./state/AuthContext.jsx";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="page">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="page">Loading...</div>;
  }
  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
