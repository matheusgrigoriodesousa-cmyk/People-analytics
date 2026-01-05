import { useState, useEffect } from 'react';

export const useTheme = () => {
  // 1. Verifica se já existe preferência salva ou usa a do sistema operacional
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Verifica se o PC do usuário já está em modo escuro
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    // 2. Aplica o atributo no HTML (tag <html> ou <body>)
    document.documentElement.setAttribute('data-theme', theme);
    
    // 3. Salva no LocalStorage para persistir
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};