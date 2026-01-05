from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import uvicorn
import os
import bcrypt
import urllib
from dotenv import load_dotenv
from jose import JWTError, jwt 
from datetime import datetime, timedelta

# Importação do serviço de análise
try:
    from services.analysis import gerar_dashboard
except ImportError:
    def gerar_dashboard(db, model): 
        return {"msg": "Serviço de análise não encontrado localmente"}

load_dotenv()

# --- CONFIGURAÇÕES DE SEGURANÇA ---
SECRET_KEY = os.getenv("SECRET_KEY", "sua_chave_secreta_super_segura_aqui") 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# ================= CONFIG BANCO HÍBRIDA =================

DATABASE_URL_ENV = os.getenv("DATABASE_URL")

if DATABASE_URL_ENV:
    # --- AMBIENTE: NUVEM (Render / PostgreSQL) ---
    if DATABASE_URL_ENV.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = DATABASE_URL_ENV.replace("postgres://", "postgresql://", 1)
    else:
        SQLALCHEMY_DATABASE_URL = DATABASE_URL_ENV
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    print("🚀 Conectado ao PostgreSQL (Ambiente de Nuvem)")
else:
    # --- AMBIENTE: LOCAL (SQL Server) ---
    params = urllib.parse.quote_plus(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=localhost;"
        "DATABASE=RH_Database;"
        "Trusted_Connection=yes;"
    )
    SQLALCHEMY_DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    print("💻 Conectado ao SQL Server Local")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ================= MODELOS SQL (TABELAS) =================

class EmployeeDB(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100))
    cargo = Column(String(100))
    dept = Column(String(50))
    salario = Column(Float)
    status = Column(String(20), default="Ativo")
    idade = Column(Integer, default=25)

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200))
    nome = Column(String(100))
    role = Column(String(20), default="viewer") 
    is_active = Column(Boolean, default=True)

Base.metadata.create_all(bind=engine)

# ================= SCHEMAS PYDANTIC =================

class EmployeeBase(BaseModel):
    nome: str
    cargo: str
    dept: str
    salario: float
    status: str = "Ativo"
    idade: int = 25

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    password: str
    nome: str
    role: str = "viewer"

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    role: str

# ================= FUNÇÕES AUXILIARES =================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ================= API APP =================

app = FastAPI(title="People Analytics API")

# --- CONFIGURAÇÃO DE CORS ATUALIZADA ---
origins = [
    "https://people-analytics-pi.vercel.app", # Produção
    "http://localhost:3000",                  # Local React
    "http://127.0.0.1:3000",                 # Local React Alt
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Essencial para navegadores modernos lidarem com Private Network Access
    expose_headers=["*"],
)

# --- ROTAS DE AUTENTICAÇÃO ---

@app.post("/auth/register", status_code=201)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    
    new_user = UserDB(
        email=user.email,
        hashed_password=get_password_hash(user.password),
        nome=user.nome,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    return {"msg": "Usuário criado com sucesso"}

@app.post("/auth/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_name": user.nome,
        "role": user.role
    }

# --- ROTAS DE FUNCIONÁRIOS ---

@app.get("/api/employees", response_model=List[Employee])
def get_employees(db: Session = Depends(get_db)):
    return db.query(EmployeeDB).all()

@app.get("/api/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    stats = gerar_dashboard(db, EmployeeDB)
    if not stats:
        raise HTTPException(status_code=500, detail="Erro ao calcular estatísticas")
    return stats

@app.post("/api/employees", response_model=Employee, status_code=201)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = EmployeeDB(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.delete("/api/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = db.query(EmployeeDB).filter(EmployeeDB.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Não encontrado")
    db.delete(db_employee)
    db.commit()
    return None

if __name__ == "__main__":
    # Rodar em 0.0.0.0 permite acesso externo na rede local
    uvicorn.run(app, host="0.0.0.0", port=8000)
    @app.put("/api/employees/{employee_id}", response_model=Employee)
def update_employee(employee_id: int, employee: EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = db.query(EmployeeDB).filter(EmployeeDB.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    
    for key, value in employee.model_dump().items():
        setattr(db_employee, key, value)
        
    db.commit()
    db.refresh(db_employee)
    return db_employee