# app/crud/kpi.py
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from decimal import Decimal

from app.models.kpi import KPI, KpiCategoryDB, KpiTrendDB
from app.schemas.kpi import KpiCreate, KpiUpdate, KpiFilters

def get_kpi(db: Session, kpi_id: int) -> Optional[KPI]:
    """Obtiene un KPI por su ID."""
    return db.query(KPI).options(joinedload(KPI.owner)).filter(KPI.id == kpi_id).first()

def get_kpis(
    db: Session,
    *,
    filters: Optional[KpiFilters] = None,
    skip: int = 0,
    limit: int = 100
) -> List[KPI]:
    """Obtiene una lista de KPIs, aplicando filtros opcionales."""
    query = db.query(KPI).options(joinedload(KPI.owner)) # Carga el owner

    # Aplicar filtros si se proporcionan
    if filters:
        if filters.category:
            query = query.filter(KPI.category == filters.category)
        if filters.trend:
            query = query.filter(KPI.trend == filters.trend)
        if filters.owner_id:
            query = query.filter(KPI.owner_id == filters.owner_id)
        # Añadir más filtros según sea necesario (rango de valores, nombre, etc.)

    # Añadir ordenamiento si es necesario (ejemplo básico por ID)
    query = query.order_by(KPI.id)

    return query.offset(skip).limit(limit).all()

def get_kpis_count(db: Session, *, filters: Optional[KpiFilters] = None) -> int:
    """Cuenta el número total de KPIs, aplicando filtros opcionales."""
    query = db.query(KPI.id) # Contar solo IDs es más eficiente

    if filters:
        if filters.category:
            query = query.filter(KPI.category == filters.category)
        if filters.trend:
            query = query.filter(KPI.trend == filters.trend)
        if filters.owner_id:
            query = query.filter(KPI.owner_id == filters.owner_id)

    return query.count()


def create_kpi(db: Session, *, kpi_in: KpiCreate, owner_id: Optional[int] = None) -> KPI:
    """Crea un nuevo KPI."""
    # Asigna owner_id si se proporciona explícitamente o desde el usuario actual
    create_data = kpi_in.model_dump()
    if owner_id and 'owner_id' not in create_data: # Prioriza el owner_id del usuario autenticado si no se especifica otro
        create_data['owner_id'] = owner_id

    db_kpi = KPI(**create_data)
    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    return db_kpi

def update_kpi(db: Session, *, db_kpi: KPI, kpi_in: KpiUpdate) -> KPI:
    """Actualiza un KPI existente."""
    update_data = kpi_in.model_dump(exclude_unset=True)

    # Aquí se podría recalcular la tendencia si el valor cambia
    if 'value' in update_data and 'trend' not in update_data:
        # Lógica simple de ejemplo para recalcular tendencia:
        if db_kpi.value is not None: # Necesitas el valor anterior
            if update_data['value'] > db_kpi.value:
                db_kpi.trend = KpiTrendDB.up
            elif update_data['value'] < db_kpi.value:
                db_kpi.trend = KpiTrendDB.down
            else:
                db_kpi.trend = KpiTrendDB.stable
        else: # Si no había valor anterior, poner estable
             db_kpi.trend = KpiTrendDB.stable

    for field, value in update_data.items():
        if hasattr(db_kpi, field):
            setattr(db_kpi, field, value)

    # last_updated se actualiza automáticamente por `onupdate=func.now()`

    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    return db_kpi

def delete_kpi(db: Session, *, kpi_id: int) -> Optional[KPI]:
    """Elimina un KPI."""
    db_kpi = db.query(KPI).filter(KPI.id == kpi_id).first()
    if db_kpi:
        db.delete(db_kpi)
        db.commit()
    return db_kpi