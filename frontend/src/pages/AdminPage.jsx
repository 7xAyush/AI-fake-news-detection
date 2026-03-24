import React, { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";

const API_BASE = "http://127.0.0.1:5000";

export function AdminPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const isAdmin = user?.is_admin;

  const commonHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const loadAll = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [usersRes, statsRes, metricsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`, { headers: commonHeaders }),
        fetch(`${API_BASE}/api/admin/stats`, { headers: commonHeaders }),
        fetch(`${API_BASE}/api/admin/model/metrics`, { headers: commonHeaders }),
      ]);

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();
      const metricsData = await metricsRes.json();

      if (!usersRes.ok) throw new Error(usersData.error || "Failed to load users");
      if (!statsRes.ok) throw new Error(statsData.error || "Failed to load stats");
      if (!metricsRes.ok)
        throw new Error(metricsData.error || "Failed to load model metrics");

      setUsers(usersData.items || []);
      setStats(statsData);
      setMetrics(metricsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && isAdmin) {
      loadAll();
    }
  }, [token, isAdmin]);

  const retrainModel = async () => {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/model/retrain`, {
        method: "POST",
        headers: commonHeaders,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Retraining failed");
      }
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const uploadDataset = async (file) => {
    if (!token || !file) return;
    setBusy(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/admin/model/dataset`, {
        method: "POST",
        headers: commonHeaders,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Dataset upload failed");
      }
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="page">
        <h2>Admin</h2>
        <p className="muted">You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className="page admin-page">
      <h2>Admin Dashboard</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="muted">Loading admin data...</p>}

      {stats && (
        <section className="card" style={{ marginTop: "1rem" }}>
          <h3>System stats</h3>
          <p className="muted small">
            Users: <strong>{stats.total_users}</strong> · Analyses:{" "}
            <strong>{stats.total_analyses}</strong>
          </p>
          <p className="muted small">
            Fake: <strong>{stats.fake_count}</strong> · Real:{" "}
            <strong>{stats.real_count}</strong>
          </p>
          <p className="muted small">
            Feedback - Correct: <strong>{stats.feedback_correct}</strong> ·
            Incorrect: <strong>{stats.feedback_incorrect}</strong>
          </p>
        </section>
      )}

      {metrics && (
        <section className="card" style={{ marginTop: "1rem" }}>
          <h3>Model metrics</h3>
          <p className="muted small">
            Accuracy:{" "}
            <strong>{(metrics.accuracy * 100).toFixed(1)}%</strong> on{" "}
            <strong>{metrics.samples}</strong> samples (
            {metrics.using_custom_dataset
              ? "custom dataset"
              : "built-in sample"}
            )
          </p>
          <p className="muted small">
            Last evaluated at: {metrics.evaluated_at}
          </p>
          <div className="form-actions" style={{ marginTop: "0.5rem" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={retrainModel}
              disabled={busy}
            >
              {busy ? "Retraining..." : "Retrain model"}
            </button>
            <label className="btn-secondary" style={{ cursor: "pointer" }}>
              Upload dataset (CSV)
              <input
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadDataset(file);
                }}
              />
            </label>
          </div>
        </section>
      )}

      {users.length > 0 && (
        <section className="card" style={{ marginTop: "1rem" }}>
          <h3>Users</h3>
          <table className="user-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Admin</th>
                <th>Created at</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{u.is_admin ? "Yes" : "No"}</td>
                  <td>{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

