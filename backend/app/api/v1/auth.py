from fastapi import APIRouter

from app.core.security import CurrentUserDep
from app.schemas.auth import CurrentUser, TokenVerifyResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me", response_model=CurrentUser)
async def get_me(current_user: CurrentUserDep) -> CurrentUser:
    """
    Mevcut authenticated kullanıcının bilgisini döndürür.
    Frontend bu endpoint'i:
    - Login sonrası kullanıcı bilgisini yenilemek için
    - Gerçek rol bilgisini almak için (Adım 4+: custom claims)
    kullanacak.
    """
    return current_user


@router.post("/verify-token", response_model=TokenVerifyResponse)
async def verify_token(current_user: CurrentUserDep) -> TokenVerifyResponse:
    """
    Firebase ID Token'ın geçerli olup olmadığını doğrular.
    Token geçerliyse authenticated=True ve kullanıcı bilgisini döndürür.
    """
    return TokenVerifyResponse(authenticated=True, user=current_user)
