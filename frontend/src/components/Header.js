import React from 'react';
import { LogOut, User, Moon, Sun } from 'lucide-react'; // Novos ícones
import '../App.css';

const Header = ({ user, onLogout, toggleTheme, currentTheme }) => {
  return (
    <header className="app-header" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '20px',
      paddingBottom: '15px',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ 
            width: '40px', height: '40px', 
            background: 'linear-gradient(135deg, #0078d4 0%, #00bcf2 100%)', 
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: '1.2rem',
            boxShadow: '0 4px 10px rgba(0, 120, 212, 0.3)'
        }}>
            RH
        </div>
        <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Portal Corporativo</h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gerenciamento de Talentos</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* BOTÃO DE TEMA (DARK MODE) */}
        <button 
            onClick={toggleTheme}
            style={{
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.2s'
            }}
            title={currentTheme === 'light' ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
        >
            {currentTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div style={{ textAlign: 'right', marginRight: '10px' }}>
            <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {user?.email || 'Admin'}
            </span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Gestor de RH
            </span>
        </div>
        
        <button className="btn-logout" onClick={onLogout} title="Sair do sistema">
            <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;