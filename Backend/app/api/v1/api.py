# app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users
# --- Importar futuros endpoints ---
# from app.api.v1.endpoints import inventory, kpi, ai

api_router = APIRouter()

# --- Rutas Actuales ---
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# --- Rutas Futuras (Marcadores) ---
# Descomenta y ajusta los prefijos cuando implementes estos módulos
# api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
# api_router.include_router(kpi.router, prefix="/kpis", tags=["KPIs"]) # Basado en VectorKPI/constants/Api.ts
# api_router.include_router(ai.router, prefix="/ai", tags=["AI"])