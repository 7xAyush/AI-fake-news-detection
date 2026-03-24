"""
STEP 2: Train and save the Fake News detection model.

You can run this script directly:

    python ml_model/train_model.py

It will:
  - load data (from one or more CSVs, or a small built‑in sample),
  - train a TF‑IDF + Logistic Regression classifier,
  - evaluate accuracy on a hold‑out set,
  - save the trained model and vectorizer into ml_model/artifacts/.
"""

from pathlib import Path
import sys
from typing import List

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

# Make sure we can import model_config when running this file directly.
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
  sys.path.append(str(CURRENT_DIR))

from model_config import ARTIFACTS_DIR, MODEL_PATH, VECTORIZER_PATH


def load_dataset() -> pd.DataFrame:
  """
  Load training data for the fake-news model.

  Priority:
  1. If one or more CSV files exist in ml_model/data/*.csv, load ALL of them,
     concatenate and deduplicate. Each CSV must have columns:
         - text  - article content
         - label - \"FAKE\" or \"REAL\"
  2. Otherwise, fall back to a small built‑in demo dataset so the project
     remains runnable without any external files.
  """
  base_dir = Path(__file__).resolve().parent
  data_dir = base_dir / "data"

  frames: List[pd.DataFrame] = []
  if data_dir.exists():
    csv_files = sorted(data_dir.glob("*.csv"))
    for path in csv_files:
      try:
        df = pd.read_csv(path)
      except Exception as exc:
        print(f"[WARN] Failed to read {path}: {exc}")
        continue

      if not {"text", "label"}.issubset(df.columns):
        print(
          f"[WARN] Skipping {path.name}: missing 'text'/'label' columns.",
        )
        continue

      print(f"[INFO] Loaded {len(df)} rows from {path.name}")
      frames.append(df[["text", "label"]])

  if frames:
    df_all = pd.concat(frames, ignore_index=True)
    df_all = df_all.dropna(subset=["text", "label"])
    df_all = df_all.drop_duplicates(subset=["text", "label"])
    print(
      "[INFO] Combined dataset size after dedupe:"
      f" {len(df_all)} rows from {len(frames)} file(s) in {data_dir}."
    )
    return df_all

  # Fallback: small synthetic dataset
  print("[WARN] No CSV datasets found in ml_model/data/*.csv.")
  print("[WARN] Using a small built-in demo dataset instead.")

  samples = [
    # REAL news‑like examples
    (
      "Government announces new education policy to improve rural schools.",
      "REAL",
    ),
    ("Scientists discover new exoplanet that could support life.", "REAL"),
    ("Central bank cuts interest rates to boost the economy.", "REAL"),
    (
      "Local authorities launch campaign to increase road safety awareness.",
      "REAL",
    ),
    # FAKE news‑like examples
    ("Celebrity found alive on the moon after secret mission.", "FAKE"),
    ("Drinking water at 3am grants you invisibility powers.", "FAKE"),
    ("Scientists confirm the earth is actually a flat triangle.", "FAKE"),
    ("Government to pay every citizen 1 million dollars tomorrow.", "FAKE"),
  ]
  df = pd.DataFrame(samples, columns=["text", "label"])
  return df


def train_and_save_model() -> None:
  """Train the model and persist artifacts to disk."""
  df = load_dataset()

  # Clean up data
  df["text"] = df["text"].astype(str).fillna("")
  df["label"] = df["label"].astype(str).str.upper()

  X_train, X_test, y_train, y_test = train_test_split(
    df["text"],
    df["label"],
    test_size=0.2,
    random_state=42,
    stratify=df["label"],
  )

  # Convert text to numerical features using TF‑IDF.
  vectorizer = TfidfVectorizer(
    stop_words="english",
    ngram_range=(1, 2),
    max_features=20000,
  )

  X_train_vec = vectorizer.fit_transform(X_train)
  X_test_vec = vectorizer.transform(X_test)

  # Simple, strong baseline classifier for text.
  model = LogisticRegression(max_iter=2000)
  model.fit(X_train_vec, y_train)

  # Evaluate on test data.
  y_pred = model.predict(X_test_vec)
  acc = accuracy_score(y_test, y_pred)
  print(f"[METRICS] Test accuracy: {acc:.3f}")
  print("[METRICS] Classification report:")
  print(classification_report(y_test, y_pred))

  # Ensure artifacts directory exists.
  ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

  # Save model and vectorizer to disk so the backend can load them.
  joblib.dump(vectorizer, VECTORIZER_PATH)
  joblib.dump(model, MODEL_PATH)
  print(f"[INFO] Saved vectorizer to: {VECTORIZER_PATH}")
  print(f"[INFO] Saved model to: {MODEL_PATH}")


if __name__ == "__main__":
  train_and_save_model()

