# app/crud/ai_log.py
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List

from app.models.ai_log import AiLog
from app.schemas.ai import AiLogCreate

def create_log(db: Session, *, log_in: AiLogCreate) -> AiLog:
    """Crea un nuevo registro de log de IA."""
    # No necesitamos especificar timestamp aquí, se genera en DB
    db_log = AiLog(
        user_id=log_in.user_id,
        feature_area=log_in.feature_area,
        input_data=log_in.input_data,
        output_data=log_in.output_data,
        decision_reason=log_in.decision_reason,
        metrics=log_in.metrics
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_log(db: Session, log_id: int) -> Optional[AiLog]:
    """Obtiene un log por ID."""
    return db.query(AiLog).filter(AiLog.id == log_id).first()

def get_logs(
    db: Session,
    *,
    user_id: Optional[int] = None,
    feature_area: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[AiLog]:
    """Obtiene una lista de logs, con filtros opcionales."""
    query = db.query(AiLog)
    if user_id:
        query = query.filter(AiLog.user_id == user_id)
    if feature_area:
        query = query.filter(AiLog.feature_area == feature_area)

    return query.order_by(desc(AiLog.timestamp)).offset(skip).limit(limit).all()