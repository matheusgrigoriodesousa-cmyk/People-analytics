import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // Verifica se existe um token salvo no navegador
    const token = localStorage.getItem('token');

    // Se NÃO tiver token, manda o usuário de volta para o Login (/)
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Se tiver token, deixa o usuário entrar na página que ele queria (children)
    return children;
};

export default PrivateRoute;