from main import SessionLocal, UserDB, get_password_hash, engine, Base

# Garante que a tabela existe
Base.metadata.create_all(bind=engine)

def create_admin_user():
    db = SessionLocal()
    
    email = "admin@empresa.com"
    senha_texto = "123"
    
    # Verifica se já existe
    existing_user = db.query(UserDB).filter(UserDB.email == email).first()
    
    if existing_user:
        print(f"⚠️ O usuário '{email}' JÁ EXISTE no banco de dados!")
    else:
        print(f"Criando usuário '{email}'...")
        
        # Cria o usuário com a senha criptografada (Hash)
        new_user = UserDB(
            email=email,
            hashed_password=get_password_hash(senha_texto),
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