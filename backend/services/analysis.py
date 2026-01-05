import pandas as pd
from sqlalchemy.orm import Session

def gerar_dashboard(db: Session, model_class):
    """
    Lê dados do SQL Server via Pandas e gera estatísticas.
    """
    try:
        # 1. Lê a query do SQLAlchemy
        query = db.query(model_class).statement
        
        # 2. Carrega no Pandas usando a conexão do banco
        df = pd.read_sql(query, db.bind)

        # Se banco vazio, retorna zerado para não quebrar o React
        if df.empty:
            return {
                "media_salarial": 0,
                "media_idade": 0,
                "lista_departamentos": [],
                "por_departamento": []
            }

        # --- PROTEÇÃO CONTRA DADOS SUJOS (ATUALIZAÇÃO) ---
        # Preenche vazios (NaN) com 0 para evitar erros de cálculo
        if "idade" in df.columns:
            df["idade"] = df["idade"].fillna(0)
        if "salario" in df.columns:
            df["salario"] = df["salario"].fillna(0)

        # 3. Cálculos Gerais
        media_salarial = float(df["salario"].mean())
        
        # Converte para int apenas se a coluna existir
        media_idade = int(df["idade"].mean()) if "idade" in df.columns else 0
        
        # Lista de departamentos únicos (tratando possíveis nulos como "Outros")
        lista_deptos = sorted(df["dept"].fillna("Outros").unique().tolist())

        # 4. Agrupamento por Departamento
        df_group = df.groupby("dept").agg({
            "salario": "mean",
            "id": "count" # Conta quantos funcionários
        }).reset_index()

        df_group.rename(columns={"salario": "salario_medio", "id": "qtd_funcionarios"}, inplace=True)
        
        # Arredonda valores para 2 casas decimais
        df_group["salario_medio"] = df_group["salario_medio"].round(2)
        
        # Converte para lista de dicionários
        por_departamento = df_group.to_dict(orient="records")

        # Retorna estrutura pronta para o React
        return {
            "media_salarial": round(media_salarial, 2),
            "media_idade": media_idade,
            "lista_departamentos": lista_deptos,
            "por_departamento": por_departamento
        }

    except Exception as e:
        print(f"❌ Erro na análise (Pandas): {e}")
        return None