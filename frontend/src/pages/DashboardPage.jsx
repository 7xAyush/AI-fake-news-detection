import React, { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";

const API_BASE = "http://127.0.0.1:5000";

export function DashboardPage() {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalyses = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/analyses?limit=30`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load analyses");
      }
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAnalyses();
    }
  }, [token]);

  const deleteItem = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/analyses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) {
        setItems((prev) => prev.filter((it) => it.id !== id));
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete item");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleBookmark = async (id, current) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/analyses/${id}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookmarked: !current }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update bookmark");
      }
      setItems((prev) =>
        prev.map((it) => (it.id === id ? data.item : it))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const sendFeedback = async (id, isCorrect) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/analyses/${id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_correct: isCorrect }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }
      setItems((prev) =>
        prev.map((it) => (it.id === id ? data.item : it))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page dashboard-page">
      <h2>User Dashboard</h2>
      {!user && (
        <p className="muted">
          You are not logged in. Login to see your analysis history and
          feedback.
        </p>
      )}
      {user && (
        <>
          <p className="muted">
            Recent analyses for <strong>{user.email}</strong>
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          {loading && <p className="muted">Loading...</p>}
          {!loading && items.length === 0 && (
            <p className="muted">No analyses yet. Try analyzing some news.</p>
          )}
          <div className="analysis-list">
            {items.map((item) => (
              <div key={item.id} className="card analysis-card">
                <div className="analysis-header">
                  <span className={`prediction-badge ${item.prediction}`}>
                    {item.prediction}
                  </span>
                  <span className="muted small">
                    {(item.confidence * 100).toFixed(1)}% confidence
                  </span>
                  {item.bookmarked && (
                    <span className="tag" style={{ marginLeft: "0.5rem" }}>
                      ★ Bookmarked
                    </span>
                  )}
                </div>
                <p className="muted small">
                  Type: <strong>{item.input_type}</strong>
                  {item.url && (
                    <>
                      {" "}
                      · URL:{" "}
                      <a href={item.url} target="_blank" rel="noreferrer">
                        {item.url}
                      </a>
                    </>
                  )}
                  {item.filename && <> · File: {item.filename}</>}
                </p>
                <p className="snippet">
                  {item.original_text_snippet || "(No text snippet stored)"}{" "}
                </p>
                <div className="analysis-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => toggleBookmark(item.id, item.bookmarked)}
                  >
                    {item.bookmarked ? "Unbookmark" : "Bookmark"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => sendFeedback(item.id, true)}
                  >
                    Mark Correct
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => sendFeedback(item.id, false)}
                  >
                    Mark Incorrect
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
                {item.user_feedback !== null && (
                  <p className="muted small">
                    Your feedback:{" "}
                    <strong>
                      {item.user_feedback ? "Correct" : "Incorrect"}
                    </strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
