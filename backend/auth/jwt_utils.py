from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt

# Import config as a simple module; app.py ensures backend directory is on
# sys.path so that `import config` resolves to backend/config.py.
import config  # type: ignore


def create_access_token(user_id: str) -> str:
    """
    Create a signed JWT access token for the given user ID.
    """
    now = datetime.now(timezone.utc)
    payload: Dict[str, Any] = {
        "sub": user_id,
        "iat": int(now.timestamp()),
        "exp": int(
            (now + timedelta(minutes=config.JWT_ACCESS_TOKEN_EXPIRES_MINUTES)).timestamp()
        ),
    }
    token = jwt.encode(payload, config.JWT_SECRET_KEY, algorithm="HS256")
    # In PyJWT >= 2.0 encode returns a str already.
    return token


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT access token.

    Returns the payload dict on success, or None if the token is invalid/expired.
    """
    try:
        return jwt.decode(token, config.JWT_SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
