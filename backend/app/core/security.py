from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth

from app.schemas.auth import CurrentUser
from app.core.firebase import is_firebase_ready

# HTTPBearer scheme — Swagger UI'da "Authorize" butonu çıkar
_bearer_scheme = HTTPBearer(auto_error=False)


def _extract_role(decoded_token: dict) -> str:
    """
    Firebase custom claims'ten rol bilgisini çıkar.
    TODO (Step 4+): Gerçek rol, FastAPI /auth/me endpoint'i çağrıldığında
    Firebase Admin custom claims'den okunacak.
    Şu an priority sırası: custom claim "role" > "admin" bool > varsayılan "user"
    """
    if decoded_token.get("role") in ("admin", "agent", "user"):
        return decoded_token["role"]
    if decoded_token.get("admin") is True:
        return "admin"
    return "user"


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)],
) -> CurrentUser:
    """
    Authorization header'daki Bearer token'ı Firebase Admin SDK ile doğrular.
    Geçersiz ya da eksik token durumunda 401 fırlatır.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not is_firebase_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase Auth service is not configured.",
        )

    token = credentials.credentials
    try:
        decoded = auth.verify_id_token(token)
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.InvalidIdTokenError as exc:
        from app.core.config import get_settings
        detail = f"Invalid token: {exc}" if get_settings().is_development else "Invalid token."
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as exc:
        from app.core.config import get_settings
        detail = f"Token verification failed: {exc}" if get_settings().is_development else "Token verification failed."
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

    return CurrentUser(
        uid=decoded["uid"],
        email=decoded.get("email"),
        name=decoded.get("name"),
        picture=decoded.get("picture"),
        role=_extract_role(decoded),
    )


async def require_admin(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> CurrentUser:
    """Admin rolü zorunlu endpoint'ler için dependency."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required.",
        )
    return current_user


async def require_agent_or_admin(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> CurrentUser:
    """Agent veya admin rolü zorunlu endpoint'ler için dependency."""
    if current_user.role not in ("admin", "agent"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent or Admin privileges required.",
        )
    return current_user


# Tip alias'ları — route handler'larda okunabilirlik için
CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]
AdminDep       = Annotated[CurrentUser, Depends(require_admin)]
AgentOrAdminDep = Annotated[CurrentUser, Depends(require_agent_or_admin)]
