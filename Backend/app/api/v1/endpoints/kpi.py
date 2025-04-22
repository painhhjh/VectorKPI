# app/api/v1/endpoints/kpi.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Annotated, Any, List, Optional

from app.db.session import get_db
from app.api.dependencies import ActiveUser, DbSession
from app.models.user import User
from app.models.kpi import KPI

from app.schemas.kpi import KpiCreate, KpiRead, KpiUpdate, KpiListResponse, KpiFilters
from app.crud import kpi as crud_kpi

router = APIRouter()

@router.post("/", response_model=KpiRead, status_code=status.HTTP_201_CREATED)
def create_new_kpi(
    *,
    db: DbSession,
    kpi_in: KpiCreate,
    current_user: ActiveUser, # Necesario para asignar owner_id si no se especifica
):
    """
    Crea un nuevo KPI. El owner por defecto es el usuario actual si no se especifica.
    """
    # owner_id en kpi_in tiene precedencia si se envía explícitamente
    owner_id_to_set = kpi_in.owner_id if kpi_in.owner_id is not None else current_user.id
    # Aquí podrías añadir lógica de permisos: ¿Puede este usuario crear KPIs globales (owner_id=None)?
    # ¿Puede asignar un owner_id diferente al suyo?
    return crud_kpi.create_kpi(db=db, kpi_in=kpi_in, owner_id=owner_id_to_set)


@router.get("/", response_model=KpiListResponse)
def read_kpis_endpoint(
    db: DbSession,
    current_user: ActiveUser,  # Proteger endpoint 
    filters: Annotated[KpiFilters, Depends()], # Inyecta filtros desde query params
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
):
    """
    Obtiene una lista de KPIs, con filtros y paginación.
    """
    kpis = crud_kpi.get_kpis(db, filters=filters, skip=skip, limit=limit)
    total_count = crud_kpi.get_kpis_count(db, filters=filters)
    return KpiListResponse(count=total_count, results=kpis)


@router.get("/{kpi_id}", response_model=KpiRead)
def read_kpi_by_id(
    kpi_id: int,
    db: DbSession,
    current_user: ActiveUser, # Proteger endpoint
):
    """
    Obtiene un KPI específico por ID.
    """
    kpi = crud_kpi.get_kpi(db, kpi_id=kpi_id)
    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI not found")
    # Podrías añadir lógica de permisos: ¿Puede este usuario ver este KPI?
    return kpi


@router.put("/{kpi_id}", response_model=KpiRead)
def update_kpi_endpoint(
    *,
    db: DbSession,
    kpi_id: int,
    kpi_in: KpiUpdate,
    current_user: ActiveUser, # Proteger endpoint
):
    """
    Actualiza un KPI existente.
    """
    db_kpi = crud_kpi.get_kpi(db, kpi_id=kpi_id)
    if not db_kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI not found")

    # Lógica de permisos: ¿Puede el current_user actualizar este KPI?
    # Ejemplo: Solo el owner o un admin pueden actualizar
    # if db_kpi.owner_id != current_user.id and not crud_user.is_superuser(current_user):
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    updated_kpi = crud_kpi.update_kpi(db=db, db_kpi=db_kpi, kpi_in=kpi_in)
    return updated_kpi


@router.delete("/{kpi_id}", response_model=KpiRead)
def delete_kpi_endpoint(
    *,
    db: DbSession,
    kpi_id: int,
    current_user: ActiveUser, # Proteger endpoint
):
    """
    Elimina un KPI.
    """
    db_kpi = crud_kpi.get_kpi(db, kpi_id=kpi_id) # Verificar que existe primero
    if not db_kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI not found")

    # Lógica de permisos similar a update
    # if db_kpi.owner_id != current_user.id and not crud_user.is_superuser(current_user):
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    deleted_kpi = crud_kpi.delete_kpi(db=db, kpi_id=kpi_id)
    # La función delete_kpi ya maneja el caso si no se encontró, aunque ya lo verificamos.
    if not deleted_kpi:
         # Esto no debería ocurrir si la verificación anterior pasó
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI not found during deletion")

    return deleted_kpi # Devuelve el objeto eliminado