"""
ML model package for the Fake News Detection system.

This package will expose helpers for training and inference.
For now, it mainly contains the training script and configuration.
"""

from .model_config import ARTIFACTS_DIR, MODEL_PATH, VECTORIZER_PATH

__all__ = ["ARTIFACTS_DIR", "MODEL_PATH", "VECTORIZER_PATH"]

