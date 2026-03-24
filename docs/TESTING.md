# Testing & Manual Verification Guide

This file describes how to manually test the Fake News Detection System end-to-end.

## 1. Prerequisites

- Python dependencies installed:
  - `python -m pip install -r requirements.txt`
- Node dependencies installed:
  - `cd frontend`
  - `npm install`
- MongoDB running locally (default URI: `mongodb://localhost:27017`)

## 2. Start services

From the project root:

```bash
python ml_model/train_model.py     # if you retrained or changed data
python backend/app.py             # backend on http://127.0.0.1:5000
```

In another terminal:

```bash
cd frontend
npm run dev                       # frontend on http://localhost:4173
```

## 3. Core flows

1. **Auth**
   - Sign up a new user.
   - Verify automatic login + JWT persistence (refresh page).
   - For the first user, verify admin access by opening `/admin`.

2. **Text analysis**
   - Go to `/analyze`, choose **Text**.
   - Paste example text and click **Analyze**.
   - Confirm:
     - Prediction (FAKE/REAL)
     - Confidence %
     - Suspicious words & explanation
     - Detected language and summary
   - If logged in, confirm `analysis_id` is returned (visible in network tab) and entry appears in dashboard.

3. **URL & file analysis**
   - URL mode: try a news URL; verify extracted content is summarized and source credibility is shown.
   - File mode: upload `.txt` or `.pdf`; confirm result & summary are returned.

4. **Dashboard/history**
   - Open `/dashboard` while logged in.
   - Confirm recent analyses list appears with:
     - Snippet, prediction, confidence
     - Bookmark/unbookmark, mark correct/incorrect, delete.
   - Verify actions update the UI without page reload.

5. **Feedback system**
   - From Analyze page or Dashboard, mark a result as correct/incorrect.
   - Confirm the feedback label shows in Dashboard.

6. **Admin panel**
   - As the first (admin) user, open `/admin`.
   - Confirm:
     - System stats (user count, analyses, fake/real ratio, feedback counters).
     - Model metrics (accuracy, sample count).
     - Users table.
   - Optional:
     - Upload a CSV dataset with `text,label` columns.
     - Click **Retrain model** and verify training output in backend logs.

7. **Trending news**
   - On the home page (`/`), verify a list of trending or sample news headlines is rendered.

## 4. Basic error handling checks

- Try hitting prediction endpoints with missing fields (e.g., no `text`, no `url`, no file) and check that a JSON error with `400` status is returned.
- Call auth endpoints with invalid credentials and confirm `401`/`400` responses.
- With MongoDB stopped, verify prediction still works (history saving failures are ignored).

