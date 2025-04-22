from pydantic import BaseModel, Field
from typing import Optional
import datetime

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, example="Crudo Pesado")
    description: Optional[str] = Field(None, example="Categoría para crudos con alta densidad.")

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel): # Permite actualización parcial
    name: Optional[str] = Field(None, min_length=1, max_length=100, example="Crudo Liviano")
    description: Optional[str] = Field(None, example="Categoría actualizada.")

class CategoryRead(CategoryBase):
    id: int
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True