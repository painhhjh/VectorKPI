# app/main.py
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
# Descomentar SOLO si no usas Alembic para la creación inicial de tablas
# from app.db.session import engine
# from app.db.base import Base
# from app.models import user, profile # Importa todos tus modelos

# --- Opcional: Creación inicial de tablas (MEJOR CON ALEMBIC) ---
# def init_db():
#     try:
#         Base.metadata.create_all(bind=engine)
#         print("Tablas creadas (si no existían)")
#     except Exception as e:
#         print(f"Error al crear tablas: {e}")

# Descomenta la siguiente línea si necesitas crear tablas al inicio (no recomendado para prod)
# init_db()
# ----------------------------------------------------------------

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="API para el proyecto de tesis sobre trazabilidad de KPIs en la industria petrolera.",
    version="0.1.0" # Puedes versionar tu API aquí
)

# --- Configuración de CORS ---
# Es crucial para permitir que tu app React Native (que corre en un origen diferente)
# se comunique con la API.
if settings.BACKEND_CORS_ORIGINS:
    # Filtra orígenes vacíos que podrían venir de una variable de entorno mal configurada
    allowed_origins = [str(origin).strip() for origin in settings.BACKEND_CORS_ORIGINS if origin.strip()]
    
    # Si después de filtrar no quedan orígenes (o era solo "*"), permite todos
    # ¡PRECAUCIÓN! Usar "*" es inseguro en producción. Sé específico.
    # Ejemplo para desarrollo local con Expo Web y Expo Go en la misma red:
    # BACKEND_CORS_ORIGINS="http://localhost:8081,http://localhost:19006,http://192.168.1.YOUR_IP:8081"
    if not allowed_origins or "*" in allowed_origins:
         print("ADVERTENCIA: Permitiendo todos los orígenes CORS ('*'). No recomendado para producción.")
         allowed_origins = ["*"] # O déjalo como estaba si "*" era la intención

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True, # Permite cookies/auth headers
        allow_methods=["*"],    # Permite todos los métodos (GET, POST, PUT, DELETE, etc.)
        allow_headers=["*"],    # Permite todos los headers (incluyendo Authorization)
    )
# -----------------------------

# Incluye el router principal de la API v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"], summary="Endpoint raíz de bienvenida")
def read_root():
    """
    Endpoint raíz simple que devuelve un mensaje de bienvenida.
    """
    return {"message": f"Bienvenido a {settings.PROJECT_NAME} API"}

# Comando para ejecutar: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# --host 0.0.0.0 permite conexiones desde otras máquinas en tu red local (útil para Expo Go)