# app/schemas/product.py
from pydantic import BaseModel, Field
from typing import Optional
import datetime
from decimal import Decimal # Importar Decimal para precios
from .category import CategoryRead # Importar schema de categoría para anidación

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, example="Barril BRENT")
    description: Optional[str] = Field(None, example="Descripción del producto o tipo de crudo.")
    price: Optional[Decimal] = Field(0.00, ge=0, decimal_places=2, example=85.50)
    stock: int = Field(0, ge=0, example=1000)
    sku: Optional[str] = Field(None, max_length=100, example="BRENT-Q2-2025")
    category_id: Optional[int] = Field(None, description="ID de la categoría a la que pertenece")
    owner_id: Optional[int] = Field(None, description="ID del propietario del producto")

class ProductCreate(ProductBase):
    category_id: int = Field(..., description="ID de la categoría a la que pertenece")
    owner_id: int = Field(..., description="ID del propietario del producto")

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    stock: Optional[int] = Field(None, ge=0)
    sku: Optional[str] = Field(None, max_length=100)
    category_id: Optional[int] = None
    owner_id: Optional[int] = None

class ProductRead(ProductBase):
    id: int
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    category: Optional[CategoryRead] = None
    owner_id: int


class ProductDelete(BaseModel):
    id: int
    owner_id: Optional[int] = None

    class Config:
        from_attributes = True