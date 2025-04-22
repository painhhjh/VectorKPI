# app/models/product.py
from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    # Usar Numeric para precios o valores exactos
    price = Column(Numeric(10, 2), nullable=True, default=0.00)
    stock = Column(Integer, default=0, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=True) # Stock Keeping Unit (Opcional)

    # Clave foránea a Categories
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relación inversa con Category
    category = relationship("Category", back_populates="products")

    # Relación uno-a-muchos con Transactions
    transactions = relationship("Transaction", back_populates="product", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', stock={self.stock})>"