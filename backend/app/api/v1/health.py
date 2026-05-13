from fastapi import APIRouter, HTTPException, status
from firebase_admin import auth as firebase_auth

from app.core.config import get_settings
from app.core.firebase import is_firebase_ready, get_firestore_client
from app.schemas.common import HealthResponse, FirebaseHealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Temel sağlık kontrolü — API'nin ayakta olduğunu doğrular."""
    settings = get_settings()
    return HealthResponse(
        status="ok",
        app=settings.app_name,
        environment=settings.app_env,
        version=settings.version,
    )


@router.get("/firebase", response_model=FirebaseHealthResponse)
async def firebase_health_check() -> FirebaseHealthResponse:
    """
    Firebase Admin SDK bağlantı kontrolü.
    Firebase env eksikse veya initialize başarısızsa 503 döner.
    """
    if not is_firebase_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Firebase Admin SDK is not initialized. "
                "Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and "
                "FIREBASE_PRIVATE_KEY in your .env file."
            ),
        )

    # Basit Firestore erişim denemesi — gerçek veri okumaz
    try:
        db = get_firestore_client()
        # Yalnızca client nesnesinin oluşturulduğunu doğrula
        _ = db.collection("_health_check")
        return FirebaseHealthResponse(status="ok", firebase="connected")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Firebase connection error: {exc}",
        )
