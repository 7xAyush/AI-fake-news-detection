from pathlib import Path
from typing import Dict, List

import joblib
import numpy as np
import sys

# Import model artifact locations from the ml_model package.
BACKEND_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BACKEND_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from ml_model import MODEL_PATH, VECTORIZER_PATH  # type: ignore  # noqa: E402


class FakeNewsModelService:
    """
    Wrapper around the trained scikit-learn model and vectorizer.

    Loads artifacts once at startup and exposes a simple predict() interface
    that also returns basic "explainable" information: important words and
    a human-readable explanation string.
    """

    def __init__(self) -> None:
        self.reload()

    def reload(self) -> None:
        """
        Reload model and vectorizer from disk. Used after retraining.
        """
        self.vectorizer = joblib.load(VECTORIZER_PATH)
        self.model = joblib.load(MODEL_PATH)
        self.labels = list(self.model.classes_)

    def predict(self, text: str, top_k: int = 8) -> Dict:
        """
        Predict label and confidence for the given text and compute
        simple feature-attribution-style "important words".
        """
        cleaned = (text or "").strip()
        if not cleaned:
            raise ValueError("Input text is empty.")

        X_vec = self.vectorizer.transform([cleaned])
        proba = self.model.predict_proba(X_vec)[0]
        label_idx = int(np.argmax(proba))
        label = self.labels[label_idx]
        confidence = float(proba[label_idx])

        # Feature contributions: coefficient * tfidf value for each token
        feature_names = np.array(self.vectorizer.get_feature_names_out())

        # Handle binary vs multi-class shapes safely.
        # For binary LogisticRegression, coef_.shape == (1, n_features)
        # even though there are 2 classes; in that case we always use row 0.
        if self.model.coef_.ndim == 1:
            coefs = self.model.coef_
        elif self.model.coef_.shape[0] == 1:
            coefs = self.model.coef_[0]
        else:
            coefs = self.model.coef_[label_idx]

        doc = X_vec.tocoo()
        contributions: List[tuple[str, float]] = []
        for i, v in zip(doc.col, doc.data):
            contributions.append((feature_names[i], float(v * coefs[i])))

        # Sort by contribution descending; take the top positive ones
        contributions.sort(key=lambda x: x[1], reverse=True)
        suspicious_words = [w for w, score in contributions if score > 0][:top_k]

        if suspicious_words:
            explanation = (
                f"Top tokens pushing prediction towards {label}: "
                + ", ".join(suspicious_words)
            )
        else:
            explanation = (
                f"No strong token-level signals found for this sample; "
                f"prediction {label} is based on subtle patterns."
            )

        return {
            "label": label,
            "confidence": confidence,
            "suspicious_words": suspicious_words,
            "explanation": explanation,
        }


# Create a singleton service instance used by the Flask app.
model_service = FakeNewsModelService()
