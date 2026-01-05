import requests
import random
import time

# --- CONFIGURAÇÃO ---
# URL da sua API no Render
URL_API = "https://people-analytics-api-jba6.onrender.com/api/employees"

# Dados para gerar aleatoriedade
DEPARTAMENTOS = ["TI", "RH", "Financeiro", "Comercial", "Operações", "Marketing"]
STATUS = ["Ativo", "Ativo", "Ativo", "Férias", "Licença"] # Mais chance de ser Ativo

CARGOS_POR_DEPT = {
    "TI": ["Dev Junior", "Dev Pleno", "Dev Senior", "Tech Lead", "QA", "DevOps"],
    "RH": ["Assistente de RH", "Analista de RH", "Gerente de Pessoas", "Recrutador"],
    "Financeiro": ["Analista Financeiro", "Contador", "Controller", "CFO"],
    "Comercial": ["Vendedor", "Executivo de Vendas", "Gerente de Contas", "Diretor"],
    "Operações": ["Auxiliar Operacional", "Supervisor", "Gerente de Operações"],
    "Marketing": ["Analista de Marketing", "Designer", "Copywriter", "CMO"]
}

NOMES = [
    "Ana", "Bruno", "Carla", "Daniel", "Eduarda", "Felipe", "Gabriela", "Hugo", 
    "Isabela", "João", "Karina", "Lucas", "Mariana", "Nicolas", "Olivia", "Pedro",
    "Quintino", "Rafaela", "Samuel", "Tatiana", "Ubaldo", "Vanessa", "Wagner", "Yara"
]

SOBRENOMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", 
    "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins"
]

def gerar_funcionario_fake():
    nome_completo = f"{random.choice(NOMES)} {random.choice(SOBRENOMES)}"
    dept = random.choice(DEPARTAMENTOS)
    cargo = random.choice(CARGOS_POR_DEPT[dept])
    
    # Salário base + variação
    salario_base = random.randint(3000, 15000)
    
    return {
        "nome": nome_completo,
        "cargo": cargo,
        "dept": dept,
        "salario": float(salario_base),
        "idade": random.randint(20, 60),
        "status": random.choice(STATUS)
    }

print(f"🚀 Iniciando inserção de dados em: {URL_API}")
print("-" * 50)

sucessos = 0
erros = 0

# Vamos criar 15 funcionários
for i in range(15):
    dados = gerar_funcionario_fake()
    
    try:
        response = requests.post(URL_API, json=dados)
        
        if response.status_code == 201:
            print(f"✅ [{i+1}/15] Cadastrado: {dados['nome']} - {dados['cargo']} ({dados['dept']})")
            sucessos += 1
        else:
            print(f"❌ Erro ao cadastrar {dados['nome']}: {response.status_code} - {response.text}")
            erros += 1
            
    except Exception as e:
        print(f"💀 Erro de conexão: {e}")
        erros += 1
    
    # Pausa pequena para não sobrecarregar o servidor gratuito
    time.sleep(0.5)

print("-" * 50)
print(f"🏁 Fim! Sucessos: {sucessos} | Erros: {erros}")
print("👉 Agora atualize a página do seu Dashboard!")