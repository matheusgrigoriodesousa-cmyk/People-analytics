import os
import urllib
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Pega a variável de ambiente (mas não confia nela cegamente)
env_url = os.getenv("DATABASE_URL", "")

# 2. TESTE DE SEGURANÇA: Só usa a variável se for NUVEM (Postgres do Render)
# Se a variável começar com "DRIVER=...", o código vai ignorar e ir para o 'else' (Local)
if env_url and (env_url.startswith("postgres://") or env_url.startswith("postgresql://")):
    # --- CONEXÃO NUVEM (RENDER) ---
    if env_url.startswith("postgres://"):
        env_url = env_url.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URL = env_url
    # Adicionamos pool_pre_ping para evitar quedas no Render
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True, pool_recycle=1800)

else:
    # --- CONEXÃO LOCAL (SQL SERVER) ---
    print("--- MODO LOCAL: Forçando SQL Server ---") # Aviso no terminal
    
    # Monta a URL correta que o SQLAlchemy entende (mssql+pyodbc://...)
    params = urllib.parse.quote_plus(
        "DRIVER={ODBC Driver 17 for SQL Server};SERVER=.;DATABASE=RH_Database;Trusted_Connection=yes;"
    )
    SQLALCHEMY_DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"
    
    engine = create_engine(SQLALCHEMY_DATABASE_URL, fast_executemany=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()