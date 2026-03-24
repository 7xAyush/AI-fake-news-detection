from flask import Flask, jsonify, request, make_response
from flask_cors import CORS

# Support running this file directly (`python backend/app.py`)
import sys
from pathlib import Path
from datetime import datetime, timezone
import json

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.append(str(CURRENT_DIR))

from bson import ObjectId  # type: ignore
import joblib  # type: ignore
import pandas as pd  # type: ignore
from sklearn.metrics import accuracy_score  # type: ignore

from services.model_service import model_service  # type: ignore  # noqa: E402
from services.news_service import get_trending_news  # type: ignore  # noqa: E402
from utils.content_extraction import (  # type: ignore  # noqa: E402
    extract_text_from_file,
    extract_text_from_url,
)
from utils.lang_and_summary import (  # type: ignore  # noqa: E402
    detect_language,
    summarize_text,
)
from utils.source_verification import get_source_info  # type: ignore  # noqa: E402
from db.mongo import get_collection  # type: ignore  # noqa: E402
from db.schemas import build_analysis_document  # type: ignore  # noqa: E402
from db.users import (  # type: ignore  # noqa: E402
    create_user,
    get_user_by_email,
    get_user_by_id,
)
from auth.jwt_utils import create_access_token, decode_access_token  # type: ignore  # noqa: E402
from werkzeug.security import check_password_hash, generate_password_hash


def create_app() -> Flask:
    """
    Application factory for the Fake News Detection backend.
    More routes and configuration will be added step‑by‑step.
    """
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5 MB upload limit

    # Allow the React frontend (running on a different port) to call this API.
    CORS(app)

    # --------------- BASIC AUTH HELPERS ---------------

    def _serialize_user(user: dict) -> dict:
        return {
            "id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email"),
            "is_admin": bool(user.get("is_admin", False)),
        }

    def _get_current_user() -> dict | None:
        """
        Read JWT from Authorization: Bearer <token> header and return the user
        document, or None if missing/invalid.
        """
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None
        token = auth_header.split(" ", 1)[1].strip()
        payload = decode_access_token(token)
        if not payload:
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        return get_user_by_id(user_id)

    def _serialize_analysis(doc: dict) -> dict:
        return {
            "id": str(doc.get("_id")),
            "user_id": doc.get("user_id"),
            "input_type": doc.get("input_type"),
            "original_text_snippet": doc.get("original_text_snippet"),
            "url": doc.get("url"),
            "filename": doc.get("filename"),
            "prediction": doc.get("prediction"),
            "confidence": doc.get("confidence"),
            "suspicious_words": doc.get("suspicious_words") or [],
            "bookmarked": bool(doc.get("bookmarked", False)),
            "user_feedback": doc.get("user_feedback"),
            "created_at": doc.get("created_at").isoformat()
            if doc.get("created_at")
            else None,
        }

    def _require_admin():
        """
        Simple helper to enforce admin-only routes.
        Returns (user, error_response) where error_response is a Flask response
        or None when authorized.
        """
        user = _get_current_user()
        if not user or not user.get("is_admin", False):
            return None, (jsonify({"error": "Admin access required"}), 403)
        return user, None

    # --------------- HEALTH CHECK ---------------

    @app.route("/health", methods=["GET"])
    def health_check():
        """Simple health check endpoint."""
        return jsonify({"status": "ok", "service": "fake-news-backend"})

    @app.route("/api/news/trending", methods=["GET"])
    def trending_news():
        """
        Return a list of trending news headlines (basic integration).
        """
        items = get_trending_news()
        return jsonify({"items": items})

    # --------------- ADMIN ROUTES ---------------

    @app.route("/api/admin/users", methods=["GET"])
    def admin_users():
        """
        List all users (admin only).
        """
        user, error = _require_admin()
        if error:
            return error

        users_col = get_collection("users")
        docs = list(users_col.find().sort("created_at", -1))
        items = [
            {
                "id": str(u["_id"]),
                "name": u.get("name"),
                "email": u.get("email"),
                "is_admin": bool(u.get("is_admin", False)),
                "created_at": u.get("created_at").isoformat()
                if u.get("created_at")
                else None,
            }
            for u in docs
        ]
        return jsonify({"items": items})

    @app.route("/api/admin/stats", methods=["GET"])
    def admin_stats():
        """
        Return basic system stats and fake/real ratios (admin only).
        """
        user, error = _require_admin()
        if error:
            return error

        users_col = get_collection("users")
        analyses = get_collection("analyses")

        total_users = users_col.count_documents({})
        total_analyses = analyses.count_documents({})
        fake_count = analyses.count_documents({"prediction": "FAKE"})
        real_count = analyses.count_documents({"prediction": "REAL"})
        feedback_correct = analyses.count_documents({"user_feedback": True})
        feedback_incorrect = analyses.count_documents({"user_feedback": False})

        return jsonify(
            {
                "total_users": total_users,
                "total_analyses": total_analyses,
                "fake_count": fake_count,
                "real_count": real_count,
                "feedback_correct": feedback_correct,
                "feedback_incorrect": feedback_incorrect,
            }
        )

    @app.route("/api/admin/model/metrics", methods=["GET"])
    def admin_model_metrics():
        """
        Evaluate the current model on a small dataset.
        Uses ml_model/data/news.csv if available, otherwise falls back
        to the built-in sample similar to the training script.
        """
        user, error = _require_admin()
        if error:
            return error

        # Load evaluation dataset
        ml_dir = CURRENT_DIR.parent / "ml_model"
        data_path = ml_dir / "data" / "news.csv"
        if data_path.exists():
            df = pd.read_csv(data_path)
            if not {"text", "label"}.issubset(df.columns):
                return jsonify({"error": "Dataset must contain text and label columns."}), 400
            df = df[["text", "label"]]
            using_custom_dataset = True
        else:
            using_custom_dataset = False
            samples = [
                (
                    "Government announces new education policy to improve rural schools.",
                    "REAL",
                ),
                (
                    "Scientists discover new exoplanet that could support life.",
                    "REAL",
                ),
                ("Celebrity found alive on the moon after secret mission.", "FAKE"),
                (
                    "Government to pay every citizen 1 million dollars tomorrow.",
                    "FAKE",
                ),
            ]
            df = pd.DataFrame(samples, columns=["text", "label"])

        df["text"] = df["text"].astype(str).fillna("")
        df["label"] = df["label"].astype(str).str.upper()

        if len(df) == 0:
            return jsonify({"error": "No data available for evaluation."}), 400

        X_vec = model_service.vectorizer.transform(df["text"])
        y_true = df["label"]
        y_pred = model_service.model.predict(X_vec)
        acc = float(accuracy_score(y_true, y_pred))

        return jsonify(
            {
                "accuracy": acc,
                "samples": int(len(df)),
                "using_custom_dataset": using_custom_dataset,
                "evaluated_at": datetime.now(timezone.utc).isoformat(),
            }
        )

    @app.route("/api/admin/model/retrain", methods=["POST"])
    def admin_model_retrain():
        """
        Retrain the model using the training script and reload it in memory.
        """
        user, error = _require_admin()
        if error:
            return error

        try:
            # Import here to avoid circular imports on app startup.
            from ml_model.train_model import train_and_save_model  # type: ignore

            train_and_save_model()
            model_service.reload()
            return jsonify({"message": "Model retrained and reloaded."})
        except Exception as e:
            return jsonify({"error": f"Retraining failed: {e}"}), 500

    @app.route("/api/admin/model/dataset", methods=["POST"])
    def admin_model_dataset_upload():
        """
        Upload a CSV dataset (with text,label columns) to be used for training.
        The file is stored at ml_model/data/news.csv
        """
        user, error = _require_admin()
        if error:
            return error

        upload = request.files.get("file")
        if upload is None or not upload.filename:
            return jsonify({"error": "No file uploaded. Use form field 'file'."}), 400

        ml_dir = CURRENT_DIR.parent / "ml_model"
        data_dir = ml_dir / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        target_path = data_dir / "news.csv"

        upload.save(target_path)

        return jsonify({"message": "Dataset uploaded.", "path": str(target_path)})

    # --------------- AUTH ROUTES ---------------

    @app.route("/api/auth/signup", methods=["POST"])
    def signup():
        """
        Create a new user account.

        Request JSON:
            { "name": "...", "email": "...", "password": "..." }
        """
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not name or not email or not password:
            return jsonify({"error": "name, email and password are required."}), 400

        if get_user_by_email(email):
            return jsonify({"error": "User with this email already exists."}), 400

        password_hash = generate_password_hash(password)
        user = create_user(name=name, email=email, password_hash=password_hash)
        token = create_access_token(str(user["_id"]))

        return jsonify({"user": _serialize_user(user), "access_token": token}), 201

    @app.route("/api/auth/login", methods=["POST"])
    def login():
        """
        Log in an existing user and return a JWT access token.

        Request JSON:
            { "email": "...", "password": "..." }
        """
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email or not password:
            return jsonify({"error": "email and password are required."}), 400

        user = get_user_by_email(email)
        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid email or password."}), 401

        token = create_access_token(str(user["_id"]))
        return jsonify({"user": _serialize_user(user), "access_token": token})

    @app.route("/api/auth/me", methods=["GET"])
    def me():
        """
        Return the currently authenticated user's profile, based on JWT.
        """
        user = _get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
        return jsonify({"user": _serialize_user(user)})

    @app.route("/api/auth/logout", methods=["POST"])
    def logout():
        """
        For stateless JWT, logout is handled on the client by discarding the
        token. This endpoint exists mainly for frontend symmetry.
        """
        return jsonify({"message": "Logged out (client should discard token)."})

    @app.route("/api/user/profile", methods=["GET", "PUT"])
    def user_profile():
        """
        Get or update the current user's profile.
        - GET: return basic user info
        - PUT: update name (email remains immutable)
        """
        user = _get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        if request.method == "GET":
            return jsonify({"user": _serialize_user(user)})

        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Field 'name' is required."}), 400

        users_col = get_collection("users")
        users_col.update_one({"_id": user["_id"]}, {"$set": {"name": name}})
        user["name"] = name
        return jsonify({"user": _serialize_user(user)})

    @app.route("/api/predict/text", methods=["POST"])
    def predict_text():
        """
        Predict FAKE/REAL for raw text.

        Request JSON:
            { "text": "..." }
        """
        data = request.get_json(silent=True) or {}
        text = (data.get("text") or "").strip()
        if not text:
            return jsonify({"error": "Field 'text' is required."}), 400

        try:
            result = model_service.predict(text)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:  # pragma: no cover - defensive
            return jsonify({"error": f"Prediction failed: {e}"}), 500

        # Save analysis in MongoDB (best-effort; ignore DB errors in dev)
        analysis_id = None
        try:
            current_user = _get_current_user()
            user_id = str(current_user["_id"]) if current_user else None
            analyses = get_collection("analyses")
            doc = build_analysis_document(
                user_id=user_id,
                input_type="text",
                original_text_snippet=text[:500],
                url=None,
                filename=None,
                prediction=result["label"],
                confidence=result["confidence"],
                suspicious_words=result["suspicious_words"],
            )
            inserted = analyses.insert_one(doc)
            analysis_id = str(inserted.inserted_id)
        except Exception:
            pass

        language_info = detect_language(text)
        summary = summarize_text(text)

        return jsonify(
            {
                "input_type": "text",
                "analysis_id": analysis_id,
                "prediction": result["label"],
                "confidence": result["confidence"],
                "suspicious_words": result["suspicious_words"],
                "explanation": result["explanation"],
                "language": language_info,
                "summary": summary,
                "source": None,
            }
        )

    @app.route("/api/predict/url", methods=["POST"])
    def predict_url():
        """
        Predict FAKE/REAL for a news article fetched from a URL.

        Request JSON:
            { "url": "https://example.com/article" }
        """
        data = request.get_json(silent=True) or {}
        url = (data.get("url") or "").strip()
        if not url:
            return jsonify({"error": "Field 'url' is required."}), 400

        try:
            text = extract_text_from_url(url)
            result = model_service.predict(text)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:  # pragma: no cover - network/parsing errors
            return jsonify({"error": f"URL processing failed: {e}"}), 500

        # Save analysis in MongoDB
        analysis_id = None
        try:
            current_user = _get_current_user()
            user_id = str(current_user["_id"]) if current_user else None
            analyses = get_collection("analyses")
            doc = build_analysis_document(
                user_id=user_id,
                input_type="url",
                original_text_snippet=text[:500],
                url=url,
                filename=None,
                prediction=result["label"],
                confidence=result["confidence"],
                suspicious_words=result["suspicious_words"],
            )
            inserted = analyses.insert_one(doc)
            analysis_id = str(inserted.inserted_id)
        except Exception:
            pass

        language_info = detect_language(text)
        summary = summarize_text(text)
        source_info = get_source_info(url)

        return jsonify(
            {
                "input_type": "url",
                "url": url,
                "analysis_id": analysis_id,
                "prediction": result["label"],
                "confidence": result["confidence"],
                "suspicious_words": result["suspicious_words"],
                "explanation": result["explanation"],
                "language": language_info,
                "summary": summary,
                "source": source_info,
            }
        )

    @app.route("/api/predict/file", methods=["POST"])
    def predict_file():
        """
        Predict FAKE/REAL for an uploaded file (.txt or .pdf).

        Request: multipart/form-data with a 'file' field.
        """
        upload = request.files.get("file")
        if upload is None:
            return jsonify({"error": "No file uploaded. Use form field 'file'."}), 400

        try:
            text = extract_text_from_file(upload)
            result = model_service.predict(text)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:  # pragma: no cover - parsing errors
            return jsonify({"error": f"File processing failed: {e}"}), 500

        # Save analysis in MongoDB
        analysis_id = None
        try:
            current_user = _get_current_user()
            user_id = str(current_user["_id"]) if current_user else None
            analyses = get_collection("analyses")
            doc = build_analysis_document(
                user_id=user_id,
                input_type="file",
                original_text_snippet=text[:500],
                url=None,
                filename=upload.filename,
                prediction=result["label"],
                confidence=result["confidence"],
                suspicious_words=result["suspicious_words"],
            )
            inserted = analyses.insert_one(doc)
            analysis_id = str(inserted.inserted_id)
        except Exception:
            pass

        language_info = detect_language(text)
        summary = summarize_text(text)

        return jsonify(
            {
                "input_type": "file",
                "filename": upload.filename,
                "analysis_id": analysis_id,
                "prediction": result["label"],
                "confidence": result["confidence"],
                "suspicious_words": result["suspicious_words"],
                "explanation": result["explanation"],
                "language": language_info,
                "summary": summary,
                "source": None,
            }
        )

    # --------------- ANALYSIS HISTORY & FEEDBACK ---------------

    @app.route("/api/analyses", methods=["GET"])
    def list_analyses():
        """
        Return recent analyses for the logged-in user.
        """
        user = _get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        limit_str = request.args.get("limit", "20")
        try:
            limit = max(1, min(int(limit_str), 100))
        except ValueError:
            limit = 20

        analyses = get_collection("analyses")
        cursor = (
            analyses.find({"user_id": str(user["_id"])})
            .sort("created_at", -1)
            .limit(limit)
        )
        items = [_serialize_analysis(doc) for doc in cursor]
        return jsonify({"items": items})

    @app.route("/api/analyses/export", methods=["GET"])
    def export_analyses():
        """
        Export all analyses for the logged-in user as a JSON file.

        The response uses a Content-Disposition header so the browser
        downloads it as a file (e.g. analysis-history.json).
        """
        user = _get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        analyses = get_collection("analyses")
        cursor = (
            analyses.find({"user_id": str(user["_id"])})
            .sort("created_at", -1)
        )
        items = [_serialize_analysis(doc) for doc in cursor]

        payload = json.dumps({"items": items}, ensure_ascii=False)
        response = make_response(payload)
        response.headers["Content-Type"] = "application/json; charset=utf-8"
        response.headers[
            "Content-Disposition"
        ] = f'attachment; filename="analysis-history-{datetime.now().date()}.json"'
        return response

    @app.route("/api/analyses/<analysis_id>", methods=["DELETE"])
    def delete_analysis(analysis_id: str):
        """
        Delete a single analysis belonging to the logged-in user.
        """
        user = _get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        try:
            oid = ObjectId(analysis_id)
        except Exception:
            return jsonify({"error": "Invalid analysis id."}), 400

        analyses = get_collection("analyses")
        result = analyses.delete_one({"_id": oid, "user_id": str(user["_id"])})
        if result.deleted_count == 0:
            return jsonify({"error": "Not found"}), 404
        return ("", 204)

    @app.route("/api/analyses/<analysis_id>/bookmark", methods=["POST"])
    def bookmark_analysis(analysis_id: str):
        """
        Mark/unmark an analysis as bookmarked.

        Request JSON:
            { "bookmarked": true/false }
        """
        user = _get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json(silent=True) or {}
        bookmarked = bool(data.get("bookmarked", True))

        try:
            oid = ObjectId(analysis_id)
        except Exception:
            return jsonify({"error": "Invalid analysis id."}), 400

        analyses = get_collection("analyses")
        doc = analyses.find_one_and_update(
            {"_id": oid, "user_id": str(user["_id"])},
            {"$set": {"bookmarked": bookmarked}},
            return_document=True,
        )
        if not doc:
            return jsonify({"error": "Not found"}), 404
        return jsonify({"item": _serialize_analysis(doc)})

    @app.route("/api/analyses/<analysis_id>/feedback", methods=["POST"])
    def feedback_analysis(analysis_id: str):
        """
        Store user feedback about a prediction being correct/incorrect.

        Request JSON:
            { "is_correct": true/false }
        """
        user = _get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json(silent=True) or {}
        if "is_correct" not in data:
            return jsonify({"error": "Field 'is_correct' is required."}), 400
        is_correct = bool(data["is_correct"])

        try:
            oid = ObjectId(analysis_id)
        except Exception:
            return jsonify({"error": "Invalid analysis id."}), 400

        analyses = get_collection("analyses")
        doc = analyses.find_one_and_update(
            {"_id": oid, "user_id": str(user["_id"])},
            {"$set": {"user_feedback": is_correct}},
            return_document=True,
        )
        if not doc:
            return jsonify({"error": "Not found"}), 404
        return jsonify({"item": _serialize_analysis(doc)})

    return app


if __name__ == "__main__":
    # Development entrypoint; in production we will use a WSGI server
    application = create_app()
    application.run(host="0.0.0.0", port=5000, debug=True)
