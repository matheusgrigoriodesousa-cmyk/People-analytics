import sys
import os

# 1. Configura o caminho para o Python
current_dir = os.getcwd()
sys.path.append(current_dir)

try:
    # Importa a conexão com o banco
    from app.services.database import SessionLocal
    
    # --- CORREÇÃO AQUI ---
    # Importamos UserDB (o nome real da sua classe)
    from app.services.models import UserDB
    
    from passlib.context import CryptContext

except ImportError as e:
    print("\n❌ ERRO DE IMPORTAÇÃO:")
    print(f"Detalhe: {e}")
    sys.exit(1)

# Configuração de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_super_user():
    print("🔌 Conectando ao banco de dados...")
    db = SessionLocal()
    
    print("🔍 Buscando usuário existente...")
    try:
        # Usa UserDB aqui também
        existing_user = db.query(UserDB).filter(UserDB.email == "admin@teste.com").first()
    except Exception as e:
        print(f"❌ Erro ao consultar o banco. Verifique se as tabelas foram criadas.")
        print(f"Detalhe do erro: {e}")
        return

    if existing_user:
        print("⚠️ O usuário admin@teste.com JÁ EXISTE no banco de dados local.")
        db.close()
        return

    print("🔨 Criando superusuário...")

    # Cria o objeto usando a classe UserDB
    db_user = UserDB(
        email="admin@teste.com",
        hashed_password=pwd_context.hash("123"),
        nome="Admin Local",
        role="admin",
        is_active=True
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    print("\n✅ SUCESSO! Usuário criado.")
    print("📧 Login: admin@teste.com")
    print("🔑 Senha: 123")
    db.close()

if __name__ == "__main__":
    create_super_user()