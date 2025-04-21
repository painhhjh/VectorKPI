from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from typing import Generator

# Crea el motor SQLAlchemy usando la URL de la base de datos desde la configuración
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# Crea una fábrica de sesiones locales
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependencia para obtener una sesión de base de datos en las rutas
def get_db() -> Generator:
    """
    Generador de dependencia que proporciona una sesión de base de datos
    por petición y se asegura de cerrarla al final.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()