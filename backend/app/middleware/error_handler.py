import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Tüm yakalanmamış exception'lar için fallback handler.
    Production'da stack trace gizlenir; development'ta detay döner.
    """
    from app.core.config import get_settings
    settings = get_settings()

    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)

    if settings.is_development:
        detail = f"{type(exc).__name__}: {exc}"
    else:
        detail = "An internal server error occurred."

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": detail},
    )
