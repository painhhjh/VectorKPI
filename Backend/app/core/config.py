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

    # --- Configuración de Email (Ejemplo - AJUSTAR SEGÚN TU PROVEEDOR) ---
    # Esto debería ir idealmente en config.py o ser cargado desde .env
    # Asegúrate de tener variables de entorno como MAIL_USERNAME, MAIL_PASSWORD, etc.
    # if settings.EMAILS_ENABLED: # Considera usar una bandera en settings
    #     email_conf = ConnectionConfig(
    #           MAIL_USERNAME = settings.MAIL_USERNAME, # Usar settings
    #           MAIL_PASSWORD = settings.MAIL_PASSWORD, # Usar settings
    #           MAIL_FROM = EmailStr(settings.MAIL_FROM), # Usar settings y validar
    #           MAIL_PORT = settings.MAIL_PORT, # Usar settings
    #           MAIL_SERVER = settings.MAIL_SERVER, # Usar settings
    #           MAIL_STARTTLS = settings.MAIL_STARTTLS, # Usar settings
    #           MAIL_SSL_TLS = settings.MAIL_SSL_TLS, # Usar settings
    #           USE_CREDENTIALS = settings.USE_CREDENTIALS, # Usar settings
    #           VALIDATE_CERTS = settings.VALIDATE_CERTS # Usar settings
    #     )
    #     fm = FastMail(email_conf)
    # --------------------------------------------------------------------


    class Config:
        case_sensitive = True
        # Si usas Pydantic v1: env_file = ".env"

settings = Settings()