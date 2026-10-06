import secrets
import time
from collections import defaultdict
from typing import Optional

from fastapi import Depends, HTTPException, Request
from fastapi.security import APIKeyHeader
from pydantic_settings import BaseSettings, SettingsConfigDict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response


class AuthSettings(BaseSettings):
    api_secret_key: str
    cors_origins: str = (
        "https://heritogo.vercel.app,"
        "http://localhost:3000,"
        "http://127.0.0.1:3000"
    )
    environment: str = "production"
    enable_embeddings_init: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


auth_settings = AuthSettings()

if not auth_settings.api_secret_key or len(auth_settings.api_secret_key) < 16:
    raise RuntimeError("API_SECRET_KEY doit contenir au moins 16 caractères.")

API_KEY_HEADER_NAME = "herit"
api_key_header = APIKeyHeader(name=API_KEY_HEADER_NAME, auto_error=False)


def cors_origin_list() -> list[str]:
    return [origin.strip() for origin in auth_settings.cors_origins.split(",") if origin.strip()]


def verifier_cle_api(api_key_recue: Optional[str] = Depends(api_key_header)) -> str:
    attendue = auth_settings.api_secret_key.encode("utf-8")
    fournie = (api_key_recue or "").encode("utf-8")
    if not api_key_recue or not secrets.compare_digest(fournie, attendue):
        raise HTTPException(
            status_code=403,
            detail="Accès interdit: Clé API invalide ou manquante",
        )
    return api_key_recue


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()[:64]
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


class RateLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, list[float]] = defaultdict(list)

    def allow(self, key: str, max_requests: int, window_seconds: int) -> bool:
        now = time.monotonic()
        recent = [t for t in self._hits[key] if now - t < window_seconds]
        if len(recent) >= max_requests:
            self._hits[key] = recent
            return False
        recent.append(now)
        self._hits[key] = recent
        return True


rate_limiter = RateLimiter()

# Plus strict sur les routes coûteuses (IA / embeddings).
ROUTE_LIMITS = (
    ("/predict", 8, 60),
    ("/chatbot/api/v1/chat", 15, 60),
    ("/api/v1/chat", 15, 60),
    ("/chatbot/api/v1/init-embeddings", 2, 3600),
    ("/api/v1/init-embeddings", 2, 3600),
    ("/chatbot/api/v1/models", 5, 60),
    ("/api/v1/models", 5, 60),
)
GLOBAL_LIMIT = (90, 60)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        ip = client_ip(request)
        path = request.url.path

        if not rate_limiter.allow(f"global:{ip}", GLOBAL_LIMIT[0], GLOBAL_LIMIT[1]):
            return JSONResponse(
                status_code=429,
                content={"detail": "Trop de requêtes. Réessayez plus tard."},
            )

        for prefix, max_req, window in ROUTE_LIMITS:
            if path == prefix or path.rstrip("/") == prefix.rstrip("/"):
                if not rate_limiter.allow(f"{prefix}:{ip}", max_req, window):
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Trop de requêtes. Réessayez plus tard."},
                    )
                break

        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Cache-Control"] = "no-store"
        return response
