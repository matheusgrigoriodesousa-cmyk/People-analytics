import React, { useState } from 'react';
import { User, Lock, LogIn, AlertCircle, Server, Linkedin } from 'lucide-react';
import '../App.css'; // Caminho para o CSS

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- SEU LINK DO LINKEDIN ---
  const LINKEDIN_URL = "https://www.linkedin.com/in/matheus-grigorio-77a51b355"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // Ajuste a URL se necessário (ex: localhost vs IP)
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
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

      // Salva dados e token
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
      setError('Acesso negado: Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        
        {/* --- CABEÇALHO --- */}
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

        {/* --- FORMULÁRIO --- */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            
            {/* CAMPO E-MAIL */}
            <div className="form-group">
                <label style={{fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555'}}>
                  E-mail
                </label>
                
                {/* Wrapper para posicionamento relativo */}
                <div className="input-wrapper" style={{ position: 'relative' }}>
                    {/* Ícone posicionado absolutamente */}
                    <span className="input-icon" style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        color: '#888',
                        zIndex: 10,
                        pointerEvents: 'none'
                    }}>
                        <User size={20} />
                    </span>
                    
                    {/* Input com paddingLeft forçado inline para vencer o CSS global */}
                    <input 
                        type="email" 
                        required
                        placeholder="usuario@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ 
                            height: '45px', 
                            fontSize: '0.95rem',
                            paddingLeft: '45px', /* AQUI ESTÁ A CORREÇÃO FORÇADA */
                            width: '100%'
                        }} 
                    />
                </div>
            </div>

            {/* CAMPO SENHA */}
            <div className="form-group">
                <label style={{fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555'}}>
                  Senha
                </label>
                
                <div className="input-wrapper" style={{ position: 'relative' }}>
                    <span className="input-icon" style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        color: '#888',
                        zIndex: 10,
                        pointerEvents: 'none'
                    }}>
                        <Lock size={20} />
                    </span>

                    <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ 
                            height: '45px', 
                            fontSize: '0.95rem',
                            paddingLeft: '45px', /* AQUI ESTÁ A CORREÇÃO FORÇADA */
                            width: '100%'
                        }}
                    />
                </div>
            </div>

            {/* MENSAGEM DE ERRO */}
            {error && (
              <div className="login-error animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* BOTÃO ENTRAR */}
            <button type="submit" className="btn-login" disabled={loading} style={{ height: '48px', fontSize: '1rem', fontWeight: '600', marginTop: '10px' }}>
                {loading ? 'Entrando...' : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        Entrar <LogIn size={20} />
                    </span>
                )}
            </button>
        </form>

        {/* --- RODAPÉ COM LINKEDIN --- */}
        <div className="login-footer" style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <p style={{ 
                fontSize: '0.8rem', 
                color: '#000', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '5px',
                fontWeight: '600'
            }}>
              Desenvolvido por 
              
              <a 
                href={LINKEDIN_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    color: '#0077b5', 
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                 <Linkedin size={14} /> Matheus
              </a>
            </p>
        </div>

      </div>
    </div>
  );
};

export default Login;