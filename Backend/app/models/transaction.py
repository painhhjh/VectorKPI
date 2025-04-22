# app/models/transaction.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as DBEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum

# Enum para tipos de transacción
class TransactionType(str, enum.Enum):
    IN = "IN"
    OUT = "OUT"
    ADJUSTMENT = "ADJUSTMENT"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    quantity = Column(Integer, nullable=False)
    # Usamos el Enum de Python mapeado a un Enum de DB (o String si prefieres más flexibilidad)
    type = Column(DBEnum(TransactionType, name="transaction_type_enum"), nullable=False)
    reason = Column(Text, nullable=True) # Motivo del ajuste, nota de salida, etc.
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Clave foránea a Products
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    # Clave foránea a Users (quién realizó la transacción)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True) # Nullable si puede ser automática

    # Relación inversa con Product
    product = relationship("Product", back_populates="transactions")
    # Relación inversa con User (opcional si no necesitas navegar desde User a Transactions)
    user = relationship("User") # , back_populates="transactions" <- Añadir a User model si se necesita

    def __repr__(self):
        return f"<Transaction(id={self.id}, type='{self.type}', product_id={self.product_id}, quantity={self.quantity})>"