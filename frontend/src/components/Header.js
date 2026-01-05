import React from 'react';
// --- 1. IMPORTAÇÃO DE ÍCONES ---
// Trazemos os ícones da biblioteca 'lucide-react'.
// LogOut: ícone de sair/porta.
// Moon/Sun: ícones de Lua e Sol para o botão de tema.
import { LogOut, User, Moon, Sun } from 'lucide-react'; 
import '../App.css'; // Importa o CSS global (onde estão as variáveis de cores var(--bg-color), etc)

// --- 2. DEFINIÇÃO DO COMPONENTE E PROPS ---
// O Header recebe 4 "props" (propriedades) do componente pai (Dashboard.js):
// - user: Objeto com os dados do usuário logado (nome, email).
// - onLogout: A função que limpa o token e chuta para o login.
// - toggleTheme: A função que troca o estado do tema (light <-> dark).
// - currentTheme: Uma string dizendo qual o tema atual ('light' ou 'dark').
const Header = ({ user, onLogout, toggleTheme, currentTheme }) => {
  return (
    // --- 3. CONTAINER PRINCIPAL (CABEÇALHO) ---
    // Usa 'display: flex' com 'justify-content: space-between' para empurrar 
    // a Logo para a esquerda e os Botões para a direita.
    <header className="app-header" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '20px',
      paddingBottom: '15px',
      borderBottom: '1px solid var(--border-color)' // Linha sutil embaixo
    }}>
      
      {/* --- 4. BLOCO ESQUERDO: LOGO E TÍTULO --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        {/* O Quadrado Azul com gradiente (Logo "RH") */}
        <div style={{ 
            width: '40px', height: '40px', 
            background: 'linear-gradient(135deg, #0078d4 0%, #00bcf2 100%)', // Gradiente azul Microsoft
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: '1.2rem',
            boxShadow: '0 4px 10px rgba(0, 120, 212, 0.3)' // Sombra suave azul
        }}>
            RH
        </div>
        
        {/* Textos ao lado da Logo */}
        <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Portal Corporativo</h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gerenciamento de Talentos</p>
        </div>
      </div>

      {/* --- 5. BLOCO DIREITO: BOTÕES E PERFIL --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        {/* --- A. BOTÃO DE TEMA (DARK/LIGHT MODE) --- */}
        <button 
            onClick={toggleTheme} // Ao clicar, executa a troca de tema
            style={{
                background: 'var(--bg-hover)', // Cor de fundo muda conforme o tema
                border: '1px solid var(--border-color)',
                borderRadius: '50%', // Deixa o botão redondo
                width: '36px',
                height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.2s'
            }}
            // Muda o texto de ajuda (tooltip) dependendo do tema atual
            title={currentTheme === 'light' ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
        >
            {/* LÓGICA VISUAL: Se for 'light', mostra a Lua. Se for 'dark', mostra o Sol */}
            {currentTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* --- B. INFORMAÇÕES DO USUÁRIO --- */}
        <div style={{ textAlign: 'right', marginRight: '10px' }}>
            {/* Mostra o e-mail do usuário. Se não tiver (user nulo), mostra 'Admin' */}
            <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {user?.email || 'Admin'} 
            </span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Gestor de RH
            </span>
        </div>
        
        {/* --- C. BOTÃO LOGOUT (SAIR) --- */}
        <button className="btn-logout" onClick={onLogout} title="Sair do sistema">
            <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;