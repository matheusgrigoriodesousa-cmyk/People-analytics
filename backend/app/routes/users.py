from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.services.database import get_db
from app.services.models import UserDB
# Adicionado UserCreate para validar a entrada de dados
from app.services.schemas import UserResponse, UserCreate 
# Adicionado get_password_hash para criptografar a senha do novo usuário
from app.services.auth_utils import get_admin_user, get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])

# --- LISTAR USUÁRIOS ---
@router.get("/", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin: dict = Depends(get_admin_user)
):
    return db.query(UserDB).all()

# --- CADASTRAR NOVO USUÁRIO (POST) ---
# Esta rota resolve o erro 405 ao clicar em salvar no formulário de criação
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user(
    obj_in: UserCreate, 
    db: Session = Depends(get_db), 
    admin: dict = Depends(get_admin_user)
):
    # Verifica se o e-mail já está em uso
    if db.query(UserDB).filter(UserDB.email == obj_in.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    new_user = UserDB(
        nome=obj_in.nome,
        email=obj_in.email,
        hashed_password=get_password_hash(obj_in.password),
        role=obj_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"msg": "Usuário criado com sucesso"}

# --- ATUALIZAR USUÁRIO (PUT) ---
@router.put("/{user_id}")
def update_user(
    user_id: int, 
    obj_in: UserCreate, 
    db: Session = Depends(get_db), 
    admin: dict = Depends(get_admin_user)
):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user.nome = obj_in.nome
    user.email = obj_in.email
    user.role = obj_in.role
    
    # Só atualiza a senha se ela for enviada no formulário
    if obj_in.password:
        user.hashed_password = get_password_hash(obj_in.password)
        
    db.commit()
    return user

# --- EXCLUIR USUÁRIO (DELETE) ---
@router.delete("/{user_id}")
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db), 
    admin: dict = Depends(get_admin_user)
):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    db.delete(user)
    db.commit()
    return {"msg": "Usuário removido"}