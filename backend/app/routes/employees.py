from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.services.database import get_db
from app.services.models import EmployeeDB
from app.services.schemas import Employee, EmployeeCreate # Certifique-se que EmployeeCreate existe no schemas.py
from app.services.analysis import gerar_dashboard

router = APIRouter(prefix="/employees", tags=["Employees"])

# --- 1. LISTAR FUNCIONÁRIOS (GET) ---
@router.get("/", response_model=List[Employee])
def get_employees(db: Session = Depends(get_db)):
    return db.query(EmployeeDB).all()

# --- 2. DASHBOARD (GET) ---
@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    return gerar_dashboard(db, EmployeeDB)

# --- 3. CADASTRAR FUNCIONÁRIO (POST) ---
# Adicionado para resolver o erro 405 ao tentar salvar novo funcionário
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_employee(obj_in: EmployeeCreate, db: Session = Depends(get_db)):
    new_employee = EmployeeDB(
        nome=obj_in.nome,
        dept=obj_in.dept,
        cargo=obj_in.cargo,
        salario=obj_in.salario,
        idade=obj_in.idade,
        status=obj_in.status
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee

# --- 4. ATUALIZAR FUNCIONÁRIO (PUT) ---
# Adicionado para resolver o erro 405 ao tentar editar
@router.put("/{emp_id}")
def update_employee(emp_id: int, obj_in: EmployeeCreate, db: Session = Depends(get_db)):
    employee = db.query(EmployeeDB).filter(EmployeeDB.id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    
    employee.nome = obj_in.nome
    employee.dept = obj_in.dept
    employee.cargo = obj_in.cargo
    employee.salario = obj_in.salario
    employee.idade = obj_in.idade
    employee.status = obj_in.status
    
    db.commit()
    return employee

# --- 5. EXCLUIR FUNCIONÁRIO (DELETE) ---
# Adicionado para resolver o erro 405 ao tentar deletar
@router.delete("/{emp_id}")
def delete_employee(emp_id: int, db: Session = Depends(get_db)):
    employee = db.query(EmployeeDB).filter(EmployeeDB.id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    
    db.delete(employee)
    db.commit()
    return {"msg": "Funcionário excluído com sucesso"}