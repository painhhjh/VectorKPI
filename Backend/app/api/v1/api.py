from fastapi import APIRouter

from app.api.v1.endpoints import auth, user, inventory, kpi, ai

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(kpi.router, prefix="/kpis", tags=["kpis"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
