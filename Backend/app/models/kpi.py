# app/models/kpi.py
from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, DateTime, Enum as DBEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum
import datetime

# Enums para campos específicos de KPI (pueden venir de schemas también)
# Asegúrate que coincidan con los tipos en types/kpi.ts
class KpiTrendDB(str, enum.Enum):
    up = 'up'
    down = 'down'
    stable = 'stable'

class KpiCategoryDB(str, enum.Enum):
    perforacion = 'perforación'
    produccion = 'producción'
    logistica = 'logística'
    seguridad = 'seguridad'
    financiero = 'financiero' # Ejemplo adicional
    otro = 'otro'

class KPI(Base):
    __tablename__ = "kpis"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    value = Column(Numeric(15, 5), nullable=False) # Precisión alta para valores KPI
    target = Column(Numeric(15, 5), nullable=True)
    unit = Column(String, nullable=False) # Ej: "%", "bbl/día", "USD/bbl", "días"
    trend = Column(DBEnum(KpiTrendDB, name="kpi_trend_enum"), nullable=True, default=KpiTrendDB.stable)
    category = Column(DBEnum(KpiCategoryDB, name="kpi_category_enum"), nullable=False, index=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), index=True) # Se actualiza siempre

    # Quién es "dueño" o responsable de este KPI (puede ser opcional)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # updated_at no es necesario si usamos last_updated con onupdate

    # Relación con el dueño (si aplica)
    owner = relationship("User") # Asume que quieres acceder al User desde KPI

    def __repr__(self):
        return f"<KPI(id={self.id}, name='{self.name}', value={self.value})>"