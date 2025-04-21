from sqlalchemy.orm import declarative_base
from sqlalchemy import MetaData

# Base declarativa para los modelos SQLAlchemy
Base = declarative_base()

# Metadatos para Alembic (opcional, pero bueno para convenciones)
metadata = Base.metadata