from pathlib import Path

# Base directory for ML artifacts
BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"

# Paths where the trained model and vectorizer will be stored.
VECTORIZER_PATH = ARTIFACTS_DIR / "tfidf_vectorizer.joblib"
MODEL_PATH = ARTIFACTS_DIR / "fake_news_model.joblib"

