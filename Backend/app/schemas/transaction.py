# app/schemas/transaction.py
from pydantic import BaseModel, Field
from typing import Optional
import datetime
from app.models.transaction import TransactionType # Importa el Enum
from .product import ProductRead # Para mostrar info del producto
from .user import UserRead # Para mostrar info del usuario

class TransactionBase(BaseModel):
    product_id: int = Field(..., example=1)
    quantity: int = Field(..., gt=0, example=10) # Cantidad debe ser positiva
    type: TransactionType = Field(..., example=TransactionType.IN)
    reason: Optional[str] = Field(None, example="Recepción de proveedor X")
    # user_id se establecerá automáticamente desde el usuario autenticado

class TransactionCreate(TransactionBase):
    pass # No necesita user_id aquí, se obtiene del contexto

class TransactionRead(TransactionBase):
    id: int
    timestamp: datetime.datetime
    user_id: Optional[int] = None # Quién realizó la transacción
    # Opcional: Incluir detalles del producto y usuario
    product: Optional[ProductRead] = None
    user: Optional[UserRead] = None # Mostrar solo la info pública del usuario

    class Config:
        from_attributes = True