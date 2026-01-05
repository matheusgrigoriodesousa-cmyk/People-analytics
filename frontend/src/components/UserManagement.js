import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, UserPlus, Shield, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// --- CONFIGURAÇÃO DE URL BLINDADA ---
// 1. Pega a URL do .env ou do Render
const RAW_URL = process.env.REACT_APP_API_URL || "https://people-analytics-api-jba6.onrender.com/api";

// 2. SEGURANÇA CONTRA DUPLICAÇÃO:
// Remove qualquer "/api" do final e adiciona apenas UM.
// Isso evita o erro "api/api/users"
const BASE_URL = RAW_URL.replace(/\/api$/, ''); 
const API_URL = `${BASE_URL}/api`;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Busca os usuários
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Log para você conferir no F12 se a URL ficou certa
            console.log(`Buscando usuários em: ${API_URL}/users`);

            // Agora a URL está garantida como "...:8000/api/users"
            const response = await fetch(`${API_URL}/users`, { headers });
            
            if (!response.ok) throw new Error('Erro ao carregar lista de usuários');
            
            const data = await response.json();
            setUsers(data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Não foi possível carregar os usuários.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={28} color="#0078d4" /> Gerenciar Usuários
                </h2>
                <button className="btn-primary" onClick={() => toast('Função criar usuário: Em breve!')} style={{display: 'flex', gap: '5px'}}>
                    <UserPlus size={18} /> Novo Usuário
                </button>
            </div>

            {error && (
                <div style={{ padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '15px', display: 'flex', gap: '10px' }}>
                    <AlertCircle /> {error}
                </div>
            )}

            {loading ? (
                <p>Carregando usuários...</p>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Permissão</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <div style={{background: '#e0e0e0', padding: '5px', borderRadius: '50%'}}><User size={16}/></div>
                                        {user.nome}
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', 
                                            borderRadius: '12px', 
                                            fontSize: '0.8rem',
                                            background: user.role === 'admin' ? '#e3f2fd' : '#f5f5f5',
                                            color: user.role === 'admin' ? '#1565c0' : '#616161',
                                            fontWeight: 'bold'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{color: user.is_active ? 'green' : 'red', fontWeight: 'bold'}}>
                                            {user.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && !error && (
                                <tr>
                                    <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#888'}}>
                                        Nenhum usuário encontrado além de você.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserManagement;