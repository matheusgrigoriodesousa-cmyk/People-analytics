import random
from sqlalchemy import create_engine, text
from passlib.context import CryptContext

# SUA URL DO RENDER (Já configurada)
DATABASE_URL = "postgresql://admin:gvST2c7hU4ZMhLslkW7VRClIWgqogxxv@dpg-d5e76i75r7bs73aahgfg-a.ohio-postgres.render.com/people_analytics_yllo"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
engine = create_engine(DATABASE_URL)

def popular_tudo():
    print("🚀 Iniciando população do Banco de Dados no Render...")

    with engine.connect() as conn:
        # ==========================================
        # 1. GARANTIR O ADMIN (O mais importante)
        # ==========================================
        print("👤 Criando/Resetando Admin...")
        conn.execute(text("DELETE FROM users WHERE email = 'admin@teste.com'"))
        
        senha_hash = pwd_context.hash("123")
        
        conn.execute(text("""
            INSERT INTO users (nome, email, hashed_password, role, is_active)
            VALUES (:nome, :email, :senha, :role, :ativo)
        """), {
            "nome": "Admin Master",
            "email": "admin@teste.com",
            "senha": senha_hash,
            "role": "admin",
            "ativo": True
        })

        # ==========================================
        # 2. CRIAR FUNCIONÁRIOS (Para os Gráficos)
        # ==========================================
        print("💼 Inserindo funcionários de teste...")
        
        # Limpa funcionários antigos para não duplicar
        conn.execute(text("DELETE FROM employees"))

        departamentos = ["TI", "RH", "Vendas", "Marketing", "Financeiro"]
        cargos = ["Analista", "Gerente", "Assistente", "Diretor", "Estagiário"]
        nomes = ["Ana Silva", "Carlos Souza", "Beatriz Lima", "João Santos", "Fernanda Oliveira", 
                 "Lucas Pereira", "Mariana Costa", "Pedro Alves", "Juliana Rocha", "Rafael Gomes"]

        for i, nome in enumerate(nomes):
            dept = random.choice(departamentos)
            cargo = random.choice(cargos)
            salario = random.randint(3000, 15000)
            idade = random.randint(22, 60)
            
            conn.execute(text("""
                INSERT INTO employees (nome, dept, cargo, salario, idade, status)
                VALUES (:nome, :dept, :cargo, :salario, :idade, :status)
            """), {
                "nome": nome,
                "dept": dept,
                "cargo": cargo,
                "salario": salario,
                "idade": idade,
                "status": "Ativo"
            })
            
        conn.commit()
        print("------------------------------------------------")
        print("✅ SUCESSO TOTAL!")
        print("1. Admin criado (admin@teste.com / 123)")
        print(f"2. {len(nomes)} funcionários inseridos.")
        print("------------------------------------------------")

if __name__ == "__main__":
    popular_tudo()