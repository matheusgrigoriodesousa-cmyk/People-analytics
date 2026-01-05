import React from 'react'; // Importa o núcleo do React (necessário para o JSX funcionar)
import ReactDOM from 'react-dom/client'; // Importa a biblioteca que conecta o React ao navegador (DOM)
import './index.css'; // Importa o CSS global (estilos que valem para o site todo)
import App from './App'; // Importa o componente principal (o "Pai" de todas as telas)

// 1. Busca no HTML (public/index.html) a div com id="root"
// 2. ReactDOM.createRoot: Cria uma "Raiz React" dentro dessa div.
// A partir de agora, o React gerencia tudo o que acontece dentro desse elemento.
const root = ReactDOM.createRoot(document.getElementById('root'));

// O comando .render() é quem efetivamente "desenha" os componentes na tela
root.render(
  // React.StrictMode: É um componente invisível que ajuda no desenvolvimento.
  // Ele verifica se você está usando práticas antigas ou inseguras e avisa no console.
  // (Nota: Em desenvolvimento, ele faz os useEffects rodarem 2x para testar bugs)
  <React.StrictMode>
    <App /> {/* Renderiza o seu App.js, que contém as Rotas, Login e Dashboard */}
  </React.StrictMode>
);