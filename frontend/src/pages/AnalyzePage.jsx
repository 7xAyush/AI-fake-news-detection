import React, { useState } from "react";
import { useAuth } from "../state/AuthContext.jsx";

const API_BASE = "http://localhost:5000";


const SAMPLE_TEXT =
  "Government announces a new education policy to improve rural schools across the country.";

export function AnalyzePage() {
  const { token } = useAuth();
  const [mode, setMode] = useState("text"); // "text" | "url" | "file"
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);

  const handleSample = () => {
    setText(SAMPLE_TEXT);
    setMode("text");
  };

  const resetAll = () => {
    setText("");
    setUrl("");
    setFile(null);
    setResult(null);
    setAnalysisId(null);
    setError("");
  };

  const sendRequest = async () => {
    setError("");
    setResult(null);
    setAnalysisId(null);
    setLoading(true);

    try {
      let res;
      if (mode === "text") {
        res = await fetch(`${API_BASE}/api/predict/text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ text }),
        });
      } else if (mode === "url") {
        res = await fetch(`${API_BASE}/api/predict/url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ url }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", file);
        res = await fetch(`${API_BASE}/api/predict/file`, {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Prediction failed");
      }
      setResult(data);
      setAnalysisId(data.analysis_id || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async (isCorrect) => {
    if (!analysisId) {
      setError("No analysis to give feedback on.");
      return;
    }
    if (!token) {
      setError("Login required to submit feedback.");
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/api/analyses/${analysisId}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_correct: isCorrect }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not submit feedback");
      }
      // Optionally update local state with returned item.
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "text" && !text.trim()) {
      setError("Please enter some text.");
      return;
    }
    if (mode === "url" && !url.trim()) {
      setError("Please enter a URL.");
      return;
    }
    if (mode === "file" && !file) {
      setError("Please select a file.");
      return;
    }
    sendRequest();
  };

  const renderInput = () => {
    if (mode === "text") {
      return (
        <label>
          News text
          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type the news article text here..."
          />
        </label>
      );
    }
    if (mode === "url") {
      return (
        <label>
          Article URL
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/news-article"
          />
        </label>
      );
    }
    return (
      <label>
        Upload file (.txt or .pdf)
        <input
          type="file"
          accept=".txt,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>
    );
  };

  const renderHighlightedText = () => {
    if (!result || !result.suspicious_words || !text) return null;
    const words = text.split(/\s+/);
    const suspicious = new Set(
      result.suspicious_words.map((w) => w.toLowerCase())
    );

    return (
      <p className="highlighted-text">
        {words.map((w, idx) => {
          const clean = w.toLowerCase().replace(/[^a-z]/gi, "");
          const isSuspicious = suspicious.has(clean);
          return (
            <span
              key={`${w}-${idx}`}
              className={isSuspicious ? "highlight token-suspicious" : ""}
            >
              {w}{" "}
            </span>
          );
        })}
      </p>
    );
  };

  return (
    <div className="page analyze-page">
      <h2>Analyze News</h2>
      <form onSubmit={handleSubmit} className="card form-card">
        <div className="pill-switch">
          <button
            type="button"
            className={mode === "text" ? "pill active" : "pill"}
            onClick={() => setMode("text")}
          >
            Text
          </button>
          <button
            type="button"
            className={mode === "url" ? "pill active" : "pill"}
            onClick={() => setMode("url")}
          >
            URL
          </button>
          <button
            type="button"
            className={mode === "file" ? "pill active" : "pill"}
            onClick={() => setMode("file")}
          >
            File
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {renderInput()}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="btn-secondary"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSample}
            className="btn-link"
            disabled={loading}
          >
            Use sample text
          </button>
        </div>
      </form>

      {result && (
        <section className="card result-card">
          <h3>Result</h3>
          <p className={`prediction-badge ${result.prediction}`}>
            Prediction: <strong>{result.prediction}</strong>
          </p>
          <p>
            Confidence:{" "}
            <strong>{(result.confidence * 100).toFixed(1)}%</strong>
          </p>
          {result.language && result.language.code && (
            <p>
              Detected language:{" "}
              <strong>
                {result.language.code}{" "}
                {result.language.confidence != null &&
                  `(${(result.language.confidence * 100).toFixed(0)}% sure)`}
              </strong>
            </p>
          )}
          {result.source && result.source.domain && (
            <p>
              Source credibility for <code>{result.source.domain}</code>:{" "}
              <strong>{result.source.label}</strong>{" "}
              <span className="muted">
                ({(result.source.credibility_score * 100).toFixed(0)}% score)
              </span>
            </p>
          )}
          {result.suspicious_words && result.suspicious_words.length > 0 && (
            <p>
              Suspicious words:{" "}
              <span className="tag-list">
                {result.suspicious_words.map((w) => (
                  <span key={w} className="tag">
                    {w}
                  </span>
                ))}
              </span>
            </p>
          )}
          {result.explanation && (
            <p className="muted">Explanation: {result.explanation}</p>
          )}
          {result.summary && (
            <div className="result-text-block">
              <h4>Summary</h4>
              <p className="muted">{result.summary}</p>
            </div>
          )}

          {mode === "text" && (
            <div className="result-text-block">
              <h4>Input text with highlights</h4>
              {renderHighlightedText()}
            </div>
          )}

          {analysisId && (
            <div className="form-actions" style={{ marginTop: "0.75rem" }}>
              <span className="muted">Was this prediction correct?</span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => sendFeedback(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => sendFeedback(false)}
              >
                No
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
