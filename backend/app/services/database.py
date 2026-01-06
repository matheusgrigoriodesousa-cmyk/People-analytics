import os
import urllib
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Tenta pegar a URL do PostgreSQL (Render)
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Ajuste para compatibilidade do SQLAlchemy com URLs "postgres://" do Render/Heroku
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
    # Engine para PostgreSQL (Render)
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    # 2. Se não houver DATABASE_URL, mantém a ESTRUTURA LOCAL (SQL Server)
    params = urllib.parse.quote_plus(
        os.getenv(
            "DATABASE_CONNECTION",
            "DRIVER={ODBC Driver 17 for SQL Server};"
            "SERVER=.;"
            "DATABASE=RH_Database;"
            "Trusted_Connection=yes;"
        )
    )
    SQLALCHEMY_DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"
    # Engine para SQL Server (Local)
    engine = create_engine(SQLALCHEMY_DATABASE_URL, fast_executemany=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()