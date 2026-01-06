from sqlalchemy import Column, Integer, String, Float, Boolean
from app.services.database import Base

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(String(20), default="viewer")
    is_active = Column(Boolean, default=True)

class EmployeeDB(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100))
    dept = Column(String(50))
    cargo = Column(String(50))
    salario = Column(Float)
    idade = Column(Integer)
    status = Column(String(50))
