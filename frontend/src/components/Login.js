// --- 1. IMPORTAÇÕES ---
import React, { useState } from 'react';
import { User, Lock, LogIn, AlertCircle, Server, Linkedin } from 'lucide-react';
import '../App.css'; 

const Login = ({ onLogin }) => {
  
  // --- 3. ESTADOS (A Memória da Tela) ---
  const [email, setEmail] = useState('');     
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');     
  const [loading, setLoading] = useState(false); 

  // --- 4. CONFIGURAÇÃO INTELIGENTE DE URL (BLINDADA) ---
  // 1. Pega o domínio do .env (ou usa localhost SEM /api como fallback)
  const ENV_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  // 2. Remove a barra do final se existir (pra evitar duplicidade //)
  const BASE_URL = ENV_URL.replace(/\/$/, '');
  // 3. Monta a URL final da API (Adiciona o /api aqui)
  const API_URL = `${BASE_URL}/api`;

  const LINKEDIN_URL = "https://www.linkedin.com/in/matheus-grigorio-77a51b355"; 

  // --- 5. FUNÇÃO DE ENVIO (O "Motor" do Login) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError('');       
    setLoading(true);   

    try {
      const formData = new URLSearchParams();
      formData.append('username', email); 
      formData.append('password', password);

      // Agora a URL estará correta: .../api/auth/login
      console.log(`Tentando logar em: ${API_URL}/auth/login`); 

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json(); 

      if (!response.ok) {
        throw new Error(data.detail || 'Falha ao conectar no servidor.');
      }

      // --- 6. SUCESSO: SALVANDO A SESSÃO ---
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user_name', data.user_name);
      localStorage.setItem('user_role', data.role);

      const userData = {
        name: data.user_name,
        email: email,
        role: data.role,
        token: data.access_token
      };

      onLogin(userData);

    } catch (err) {
      console.error(err);
      setError('Acesso negado: Verifique suas credenciais ou se o servidor está rodando.');
    } finally {
      setLoading(false); 
    }
  };

  // --- 8. RENDERIZAÇÃO (ESTRUTURA ORIGINAL MANTIDA) ---
  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <div style={{ 
                width: '70px', height: '70px', 
                background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)', 
                borderRadius: '18px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 15px auto',
                boxShadow: '0 10px 20px rgba(0, 120, 212, 0.3)' 
            }}>
                <Server size={36} color="#fff" />
            </div>
            
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '5px' }}>
              People Analytics
            </h1>
            
            <p style={{ fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
              &copy; Todos os direitos reservados.
            </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="form-group">
                <label style={{fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555'}}>
                  E-mail
                </label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                    <span className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }}>
                        <User size={20} />
                    </span>
                    <input 
                        type="email" 
                        required
                        placeholder="usuario@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ height: '45px', fontSize: '0.95rem', paddingLeft: '45px', width: '100%' }} 
                    />
                </div>
            </div>

            <div className="form-group">
                <label style={{fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555'}}>
                  Senha
                </label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                    <span className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }}>
                        <Lock size={20} />
                    </span>
                    <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ height: '45px', fontSize: '0.95rem', paddingLeft: '45px', width: '100%' }}
                    />
                </div>
            </div>

            {error && (
              <div className="login-error animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" className="btn-login" disabled={loading} style={{ height: '48px', fontSize: '1rem', fontWeight: '600', marginTop: '10px' }}>
                {loading ? 'Entrando...' : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        Entrar <LogIn size={20} />
                    </span>
                )}
            </button>
        </form>

        <div className="login-footer" style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <p style={{ fontSize: '0.8rem', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: '600' }}>
              Desenvolvido por 
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0077b5', textDecoration: 'none', fontWeight: 'bold' }}>
                 <Linkedin size={14} /> Matheus
              </a>
            </p>
        </div>

      </div>
    </div>
  );
};

export default Login;