import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from typing import Optional

# Carga las variables de entorno desde el archivo .env
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "VectorKPI API"
    API_V1_STR: str = "/api/v1"

    # Base de datos
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "tesis_kpi_db")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    # DATABASE_URL es construida o tomada directamente
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        DATABASE_URL = f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"

    # Seguridad JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default_secret_key_please_change")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # CORS (Configuración de Orígenes Cruzados) - Ajusta según tus necesidades
    # Lista de orígenes permitidos. '*' permite todos (inseguro para producción).
    # Para desarrollo con Expo Go, podrías necesitar http://localhost:8081 o tu IP local
    BACKEND_CORS_ORIGINS: list[str] = os.getenv("BACKEND_CORS_ORIGINS", "*").split(",")


    class Config:
        case_sensitive = True
        # Si usas Pydantic v1: env_file = ".env"

settings = Settings()