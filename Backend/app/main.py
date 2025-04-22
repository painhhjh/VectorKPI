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

allowed_origins = [
    "http://localhost",               # localhost simple
    "http://localhost:19000",         # Expo Go default port
    "http://localhost:19006",         # Expo web port
    "http://127.0.0.1",               # localhost loopback
    "http://127.0.0.1:19000",
    "http://192.168.1.100:19000",    # IP local ejemplo (ajustar a tu red)
    "http://192.168.1.100:8000",     # IP local backend (ajustar)
    "https://tu-dominio-frontend.com" # URL producción frontend (cambiar según despliegue)
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