from typing import Any
from fastapi import APIRouter

from app.core.security import AdminDep
from app.services import property_service

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
async def get_admin_stats(current_user: AdminDep) -> dict[str, Any]:
    """Admin dashboard istatistikleri."""
    stats = await property_service.get_stats()
    return {"requestedBy": current_user.uid, **stats}
