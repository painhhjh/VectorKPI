# app/schemas/kpi.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
import datetime
from decimal import Decimal
from app.models.kpi import KpiTrendDB, KpiCategoryDB # Importa Enums del modelo

# --- Schemas ---
class KpiBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=150, example="Eficiencia de Perforación")
    description: Optional[str] = Field(None, example="Porcentaje de tiempo efectivo de perforación.")
    value: Decimal = Field(..., example=85.5)
    target: Optional[Decimal] = Field(None, example=90.0)
    unit: str = Field(..., max_length=20, example="%")
    category: KpiCategoryDB = Field(..., example=KpiCategoryDB.perforacion)
    owner_id: Optional[int] = Field(None, description="ID del usuario dueño/responsable del KPI")
    trend: Optional[KpiTrendDB] = Field(KpiTrendDB.stable, example=KpiTrendDB.up) # Tendencia puede calcularse o asignarse

class KpiCreate(KpiBase):
    # Podrías añadir validaciones específicas para creación si es necesario
    pass

class KpiUpdate(BaseModel): # Actualización parcial
    name: Optional[str] = Field(None, min_length=3, max_length=150)
    description: Optional[str] = None
    value: Optional[Decimal] = None
    target: Optional[Decimal] = None
    unit: Optional[str] = Field(None, max_length=20)
    category: Optional[KpiCategoryDB] = None
    owner_id: Optional[int] = None
    trend: Optional[KpiTrendDB] = None

class KpiRead(KpiBase):
    id: int
    last_updated: datetime.datetime
    created_at: datetime.datetime
    # Podrías incluir info del owner si lo necesitas
    # owner: Optional[UserRead] = None # Requiere importar UserRead

    class Config:
        from_attributes = True

# Schema para la respuesta de lista (como en VectorKPI/types/kpi.ts)
class KpiListResponse(BaseModel):
    count: int
    # Asumiendo que no necesitas paginación compleja con next/previous aquí
    # next: Optional[str] = None
    # previous: Optional[str] = None
    results: List[KpiRead]

# Schema para filtros (como en VectorKPI/types/kpi.ts) - puede usarse con Depends
class KpiFilters(BaseModel):
    category: Optional[KpiCategoryDB] = None
    trend: Optional[KpiTrendDB] = None
    # dateRange: Optional[dict] = None # Podrías implementar filtros de fecha
    owner_id: Optional[int] = None
    # sortBy: Optional[str] = None # Implementar lógica de ordenamiento
    # orderBy: Optional[str] = None