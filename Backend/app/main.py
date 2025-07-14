import logging
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="API para el proyecto de tesis sobre trazabilidad de KPIs en la industria petrolera.",
    version="0.1.0"
)

# --- Configuración de CORS ---
# Definir explícitamente los orígenes permitidos para desarrollo y producción

# Ejemplo de orígenes permitidos:
# - Para desarrollo local con React Native y Expo Go, puede ser la IP local de la máquina
# - Para producción, la URL real del frontend

# Lista de orígenes permitidos para CORS
allowed_origins = [
    "http://192.168.0.193:8081",     # Expo Go en la IP local
    "http://localhost",               # localhost simple
    "http://localhost:8081",         # Puerto por defecto de Expo Go
    "http://localhost:5432",        # Puerto para PostgreSqL
    "http://192.168.0.193",          # Loopback de localhost en red local
    "http://192.168.0.193:8000",     # Backend FastAPI en la IP local
    "https://vector-kpi.onrender.com", # URL de producción del frontend (modificar según despliegue)
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8081", # localhost simple
    "http://127.0.0.1:5432"
]

# Filtrar orígenes vacíos o inválidos por seguridad
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

if not allowed_origins:
    logger.error("No hay orígenes CORS configurados. La API no será accesible desde frontend.")
else:
    logger.info(f"Orígenes CORS permitidos: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]  # Importante para downloads
)

# --- Incluir routers ---
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"], summary="Endpoint raíz de bienvenida")
def read_root():
    """
    Endpoint raíz simple que devuelve un mensaje de bienvenida.
    Útil para verificar que la API está corriendo.
    """
    return {"message": f"Bienvenido a {settings.PROJECT_NAME} API"}

# Comando para ejecutar:
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# --host 0.0.0.0 permite conexiones desde otras máquinas en tu red local (útil para Expo Go)