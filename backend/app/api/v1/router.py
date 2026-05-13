from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.properties import router as properties_router
from app.api.v1.leads import router as leads_router
from app.api.v1.admin import router as admin_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(properties_router)
api_router.include_router(leads_router)
api_router.include_router(admin_router)
