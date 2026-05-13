import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.firebase import initialize_firebase
from app.api.v1.router import api_router
from app.middleware.error_handler import global_exception_handler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Uygulama başlarken ve kapanırken çalışacak işlemler."""
    settings = get_settings()
    logger.info("Starting %s [%s]", settings.app_name, settings.app_env)

    # Firebase Admin SDK'yı başlat
    firebase_app = initialize_firebase()
    if firebase_app:
        logger.info("Firebase Admin SDK ready.")
    else:
        logger.warning("Firebase Admin SDK not initialized — auth endpoints will return 503.")

    yield  # Uygulama burada çalışır

    logger.info("Shutting down %s", settings.app_name)


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        description=(
            "EstateFlow — Modern Emlak Platformu REST API\n\n"
            "Ana veri akışı: **React → FastAPI → Firestore**\n"
            "Authentication: **Firebase Auth (Bearer token)**"
        ),
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ── CORS ────────────────────────────────────────────────────────────────
    # TODO (Step 10 / Production): allow_origins listesini kısıtla,
    # allow_methods ve allow_headers'ı daralt.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Global exception handler ─────────────────────────────────────────
    app.add_exception_handler(Exception, global_exception_handler)

    # ── API Router ──────────────────────────────────────────────────────
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    # ── Root endpoint ────────────────────────────────────────────────────
    @app.get("/", tags=["Root"], include_in_schema=False)
    async def root() -> dict[str, str]:
        return {
            "message": f"{settings.app_name} is running",
            "version": settings.version,
            "docs": "/docs",
            "health": f"{settings.api_v1_prefix}/health",
        }

    return app


app = create_app()
