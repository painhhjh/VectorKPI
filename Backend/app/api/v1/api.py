# app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, inventory, kpi, ai # Importar ai

api_router = APIRouter()

# --- Rutas ---
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
api_router.include_router(kpi.router, prefix="/kpis", tags=["KPIs"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])