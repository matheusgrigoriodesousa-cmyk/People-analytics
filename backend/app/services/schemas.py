from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    nome: str
    email: EmailStr
    role: str = "viewer"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class EmployeeBase(BaseModel):
    nome: str
    cargo: str
    dept: str
    salario: float
    idade: int
    status: str = "Ativo"

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int

    class Config:
        from_attributes = True
