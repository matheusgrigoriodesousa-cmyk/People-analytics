import random
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base # Importa a nova estrutura de conexão
from app.models import EmployeeDB                     # Importa o modelo da pasta app

# --- CONFIGURAÇÃO DE DADOS ---
DEPARTAMENTOS = ["TI", "RH", "Financeiro", "Comercial", "Operações", "Marketing"]
STATUS = ["Ativo", "Ativo", "Ativo", "Férias", "Licença"]

CARGOS_POR_DEPT = {
    "TI": ["Dev Junior", "Dev Pleno", "Dev Senior", "Tech Lead", "QA", "DevOps"],
    "RH": ["Assistente de RH", "Analista de RH", "Gerente de Pessoas", "Recrutador"],
    "Financeiro": ["Analista Financeiro", "Contador", "Controller", "CFO"],
    "Comercial": ["Vendedor", "Executivo de Vendas", "Gerente de Contas", "Diretor"],
    "Operações": ["Auxiliar Operacional", "Supervisor", "Gerente de Operações"],
    "Marketing": ["Analista de Marketing", "Designer", "Copywriter", "CMO"]
}

NOMES = ["Ana", "Bruno", "Carla", "Daniel", "Eduarda", "Felipe", "Gabriela", "Hugo", "Isabela", "João"]
SOBRENOMES = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves"]

def gerar_dados_fake():
    """Gera um dicionário com dados de um funcionário aleatório."""
    dept = random.choice(DEPARTAMENTOS)
    return {
        "nome": f"{random.choice(NOMES)} {random.choice(SOBRENOMES)}",
        "cargo": random.choice(CARGOS_POR_DEPT[dept]),
        "dept": dept,
        "salario": float(random.randint(3000, 15000)),
        "idade": random.randint(20, 60),
        "status": random.choice(STATUS)
    }

def popular_banco():
    # Garante que as tabelas existam antes de inserir
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    print("🚀 Iniciando a inserção de dados diretamente no Banco de Dados...")
    
    try:
        for i in range(15):
            dados = gerar_dados_fake()
            # Cria a instância do modelo EmployeeDB com os dados gerados
            novo_func = EmployeeDB(**dados)
            db.add(novo_func)
            print(f"✅ [{i+1}/15] Adicionado: {dados['nome']} ({dados['dept']})")
        
        db.commit()
        print("-" * 50)
        print("🏁 Sucesso! 15 funcionários foram inseridos no banco de dados.")
    except Exception as e:
        print(f"❌ Erro ao popular banco: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    popular_banco()