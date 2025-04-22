# app/models/ai_log.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB # Específico de PostgreSQL
from sqlalchemy.sql import func
from app.db.base import Base
import datetime

class AiLog(Base):
    __tablename__ = "ai_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    # Quién inició la interacción con la IA (puede ser nulo si es un proceso del sistema)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    # Área funcional donde se usó la IA
    feature_area = Column(String, index=True, nullable=False, comment="Ej: InventoryRestock, KpiAnalysis, UserProfiling")
    # Datos/Contexto proporcionado a la IA
    input_data = Column(Text, nullable=True)
    # Respuesta/Sugerencia generada por la IA
    output_data = Column(Text, nullable=True)
    # Razón o explicación de la decisión/sugerencia (si la IA la proporciona)
    decision_reason = Column(Text, nullable=True)
    # Métricas de rendimiento de la IA para esta interacción (ej: confianza, tiempo)
    metrics = Column(JSONB, nullable=True) # Usar JSONB en PostgreSQL

    # Relación con el usuario (opcional)
    user = relationship("User") # , back_populates="ai_logs" <- Añadir a User si se necesita

    def __repr__(self):
        return f"<AiLog(id={self.id}, feature_area='{self.feature_area}', timestamp='{self.timestamp}')>"