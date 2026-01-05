import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// --- IMPORTAÇÃO DOS COMPONENTES ---
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // A tela principal que acabamos de separar
import UserManagement from './components/UserManagement'; // A tela de usuários
import PrivateRoute from './components/PrivateRoute'; // O segurança

function App() {
  const [user, setUser] = useState(null);

  // --- EFEITO: MANTER LOGADO ---
  // Verifica se já existe um token salvo quando a página carrega (F5)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('user_name');
    const userRole = localStorage.getItem('user_role');

    if (token && userName) {
        setUser({ name: userName, role: userRole, token: token });
    }
  }, []);

  // Função chamada quando o componente de Login tiver sucesso
  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <div className="app-container">
        {/* Componente de notificações (Toast) fica aqui para funcionar em todo o app */}
        <Toaster position="top-right" />

        <Routes>
            {/* --- ROTA 1: PÚBLICA (LOGIN) --- */}
            {/* Se o usuário tentar ir para a raiz e já estiver logado, manda pro Dashboard */}
            <Route path="/" element={
                user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
            } />

            {/* --- ROTA 2: DASHBOARD (PROTEGIDA) --- */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            {/* --- ROTA 3: USUÁRIOS (PROTEGIDA) --- */}
            <Route path="/users" element={
              <PrivateRoute>
                <UserManagement />
              </PrivateRoute>
            } />

            {/* --- ROTA CORINGA (404) --- */}
            {/* Se digitar qualquer endereço maluco, volta para o Login */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;