# app/schemas/ai.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import datetime

# --- Schemas para AI Log ---

class AiLogBase(BaseModel):
    feature_area: str = Field(..., example="InventoryRestock")
    user_id: Optional[int] = None
    input_data: Optional[str] = None
    output_data: Optional[str] = None
    decision_reason: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None # Flexible para distintas métricas

class AiLogCreate(AiLogBase):
    pass # Timestamp se genera en DB

class AiLogRead(AiLogBase):
    id: int
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# --- Schemas para Interacción IA ---

class AIContextInput(BaseModel):
    """Schema genérico para enviar contexto a un endpoint de IA."""
    context: Dict[str, Any] = Field(..., example={"product_id": 1, "current_stock": 5, "sales_last_30d": 50})
    user_prompt: Optional[str] = Field(None, example="Sugiere cantidad óptima de reorden.")

class AISuggestion(BaseModel):
    """Schema genérico para la respuesta de una sugerencia de IA."""
    suggestion: Any = Field(..., example={"restock_quantity": 25, "confidence": 0.85})
    explanation: Optional[str] = Field(None, example="Basado en ventas históricas y stock actual.")
    log_id: Optional[int] = Field(None, description="ID del registro en AiLog si se guardó.")