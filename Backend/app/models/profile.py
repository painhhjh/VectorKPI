from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB # Específico de PostgreSQL para mejor rendimiento JSON
from sqlalchemy.sql import func
from app.db.base import Base
import datetime

class Profile(Base):
    """Modelo SQLAlchemy para la tabla de Perfiles de Usuario."""
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    # Clave foránea que referencia a la tabla users. Unique=True para asegurar 1-a-1
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    full_name = Column(String, index=True, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True) # URL a una imagen de avatar
    # Campo JSONB para almacenar preferencias o datos flexibles para IA
    preferences = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relación inversa con User
    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<Profile(id={self.id}, user_id={self.user_id}, full_name='{self.full_name}')>"