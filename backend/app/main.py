from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.services.database import engine, Base
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.employees import router as employees_router

# Cria as tabelas no banco de dados
Base.metadata.create_all(bind=engine)

# AJUSTE 1: Adicionado redirect_slashes=False para evitar o erro 307
app = FastAPI(
    title="People Analytics API",
    redirect_slashes=False
)

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, substitua pelo domínio do Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AJUSTE 2: Registro das rotas com prefixo centralizado
# Certifique-se de que dentro dos arquivos de rota, os caminhos não estejam duplicados
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(employees_router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "online", "message": "People Analytics API is running"}