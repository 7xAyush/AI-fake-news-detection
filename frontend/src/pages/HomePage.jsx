import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

export function HomePage() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/news/trending`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load news");
        }
        setNews(data.items || []);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <h1>Fake News Detection System</h1>
        <p>
          Analyze news text, URLs, or documents to estimate whether content is
          likely FAKE or REAL, with a confidence score and highlighted words.
        </p>
        <div className="hero-actions">
          <Link to="/analyze" className="btn-primary">
            Start Analyzing
          </Link>
          <Link to="/signup" className="btn-secondary">
            Create an account
          </Link>
        </div>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h3>Trending news (for context)</h3>
        {error && <div className="alert alert-error">{error}</div>}
        {!error && news.length === 0 && (
          <p className="muted">Loading trending headlines...</p>
        )}
        <ul className="news-list">
          {news.slice(0, 5).map((item) => (
            <li key={item.url} className="news-item">
              <a href={item.url} target="_blank" rel="noreferrer">
                {item.title}
              </a>
              {item.source && (
                <span className="muted small"> · {item.source}</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
