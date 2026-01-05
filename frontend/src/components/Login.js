// --- 1. IMPORTAÇÕES ---
// React e useState: Essenciais para criar o componente e controlar a "memória" dele (texto digitado, erros).
import React, { useState } from 'react';

// Ícones: Trazendo ícones modernos da biblioteca Lucide para deixar o visual profissional.
// User/Lock: Para os campos de input. LogIn: Para o botão. AlertCircle: Para mensagens de erro.
import { User, Lock, LogIn, AlertCircle, Server, Linkedin } from 'lucide-react';

// Importa o CSS global para garantir que as animações (fade-in) e estilos básicos funcionem.
import '../App.css'; 

// --- 2. DEFINIÇÃO DO COMPONENTE ---
// O componente recebe uma função 'onLogin' via props.
// Essa função serve para avisar o 'App.js' (pai) quando o login der certo, para ele liberar o acesso.
const Login = ({ onLogin }) => {
  
  // --- 3. ESTADOS (A Memória da Tela) ---
  const [email, setEmail] = useState('');     // Guarda o que o usuário digita no campo E-mail
  const [password, setPassword] = useState(''); // Guarda o que o usuário digita no campo Senha
  const [error, setError] = useState('');     // Guarda mensagens de erro (ex: "Senha incorreta")
  const [loading, setLoading] = useState(false); // Controla se o botão mostra "Carregando..."

  // --- 4. CONFIGURAÇÃO INTELIGENTE DE URL (O "Cérebro" da conexão) ---
  // Esta lógica permite que o Login funcione tanto no seu PC (localhost) quanto na Nuvem (Render) sem mudar código.
  // 1. Tenta pegar a URL do arquivo .env (process.env.REACT_APP_API_URL).
  // 2. Se não tiver (na nuvem as vezes não tem .env), usa a URL fixa do Render como garantia.
  // 3. O .replace('/api', '') é um ajuste técnico: a rota de login (/auth/login) fica na raiz, não dentro de /api.
  const BASE_URL = (process.env.REACT_APP_API_URL || "https://people-analytics-api-jba6.onrender.com").replace('/api', '');

  // Link para o seu LinkedIn no rodapé
  const LINKEDIN_URL = "https://www.linkedin.com/in/matheus-grigorio-77a51b355"; 

  // --- 5. FUNÇÃO DE ENVIO (O "Motor" do Login) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede a página de recarregar sozinha (comportamento padrão de formulários)
    setError('');       // Limpa erros antigos
    setLoading(true);   // Ativa o modo de carregamento (trava o botão)

    try {
      // O FastAPI espera os dados no formato de formulário (x-www-form-urlencoded), não JSON.
      // O URLSearchParams cria esse formato automaticamente.
      const formData = new URLSearchParams();
      formData.append('username', email); // O FastAPI chama o email de 'username' por padrão
      formData.append('password', password);

      console.log(`Tentando logar em: ${BASE_URL}/auth/login`); // Ajuda a ver no console se a URL está certa

      // Faz a chamada para o Backend (Python)
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json(); // Converte a resposta do servidor para texto legível (JSON)

      // Se o servidor retornar erro (ex: 401 Unauthorized), joga para o bloco 'catch'
      if (!response.ok) {
        throw new Error(data.detail || 'Falha ao conectar no servidor.');
      }

      // --- 6. SUCESSO: SALVANDO A SESSÃO ---
      // Salva o Token e dados do usuário no navegador (LocalStorage).
      // Isso garante que se o usuário der F5, ele continua logado.
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user_name', data.user_name);
      localStorage.setItem('user_role', data.role);

      // Prepara o objeto para enviar ao App.js
      const userData = {
        name: data.user_name,
        email: email,
        role: data.role,
        token: data.access_token
      };

      // Avisa o componente pai (App.js) que o login funcionou!
      onLogin(userData);

    } catch (err) {
      // --- 7. TRATAMENTO DE ERRO ---
      console.error(err);
      setError('Acesso negado: Verifique suas credenciais ou se o servidor está rodando.');
    } finally {
      setLoading(false); // Destrava o botão, independente se deu certo ou errado
    }
  };

  // --- 8. RENDERIZAÇÃO (O HTML/Visual) ---
  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        
        {/* --- A. CABEÇALHO DO CARD (Logo e Título) --- */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <div style={{ 
                width: '70px', height: '70px', 
                background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)', // Gradiente azul bonito
                borderRadius: '18px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 15px auto',
                boxShadow: '0 10px 20px rgba(0, 120, 212, 0.3)' // Sombra para dar destaque
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

        {/* --- B. FORMULÁRIO DE INPUTS --- */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            
            {/* Campo de E-mail */}
            <div className="form-group">
                <label style={{fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#555'}}>
                  E-mail
                </label>
                
                <div className="input-wrapper" style={{ position: 'relative' }}>
                    {/* Ícone de Usuário (posicionado absolutamente dentro do input) */}
                    <span className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }}>
                        <User size={20} />
                    </span>
                    
                    <input 
                        type="email" 
                        required
                        placeholder="usuario@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        // Padding left cria espaço para o ícone não ficar em cima do texto
                        style={{ height: '45px', fontSize: '0.95rem', paddingLeft: '45px', width: '100%' }} 
                    />
                </div>
            </div>

            {/* Campo de Senha */}
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

            {/* --- C. MENSAGEM DE ERRO (Só aparece se tiver erro) --- */}
            {error && (
              <div className="login-error animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* --- D. BOTÃO DE ENTRAR --- */}
            <button type="submit" className="btn-login" disabled={loading} style={{ height: '48px', fontSize: '1rem', fontWeight: '600', marginTop: '10px' }}>
                {loading ? 'Entrando...' : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        Entrar <LogIn size={20} />
                    </span>
                )}
            </button>
        </form>

        {/* --- E. RODAPÉ (CRÉDITOS) --- */}
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