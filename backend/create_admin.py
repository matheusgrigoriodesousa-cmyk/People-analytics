# Importações atualizadas para a nova estrutura de pastas
from app.database import SessionLocal, engine, Base # Busca a conexão e a base no arquivo database
from app.models import UserDB                       # Busca o modelo da tabela de usuários
from app.auth_utils import get_password_hash        # Busca a função de criptografia de senha

# Garante que a tabela existe no banco de dados
Base.metadata.create_all(bind=engine)

def create_admin_user():
    db = SessionLocal()
    
    email = "admin@empresa.com"
    senha_texto = "123"
    
    # Verifica se o usuário já existe para não criar duplicados
    existing_user = db.query(UserDB).filter(UserDB.email == email).first()
    
    if existing_user:
        print(f"⚠️ O usuário '{email}' JÁ EXISTE no banco de dados!")
    else:
        print(f"🚀 Criando usuário administrador '{email}'...")
        
        # Cria o usuário utilizando a lógica de segurança centralizada
        new_user = UserDB(
            email=email,
            hashed_password=get_password_hash(senha_texto), # Senha transformada em Hash
            nome="Administrador",
            role="admin"
        )
        
        db.add(new_user)
        db.commit()
        print("✅ Usuário Admin criado com sucesso!")
        print(f"📧 Login: {email}")
        print(f"🔑 Senha: {senha_texto}")

    db.close()

if __name__ == "__main__":
    create_admin_user()