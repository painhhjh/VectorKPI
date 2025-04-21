from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import datetime

class User(Base):
    """Modelo SQLAlchemy para la tabla de Usuarios."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relación uno-a-uno con Profile
    # cascade="all, delete-orphan" asegura que si se borra un User, su Profile también
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")

    # Relación uno-a-muchos con Transactions (despues)
    # transactions = relationship("Transaction", back_populates="user")

    # Relación uno-a-muchos con AI Logs (despues)
    # ai_logs = relationship("AiLog", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"