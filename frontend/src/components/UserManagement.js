import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, UserPlus, Shield, User, AlertCircle, Edit, X, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================================
// BLOCO 1: CONFIGURAÇÃO DA URL DA API (CORRIGIDA)
// ============================================================================
// 1. Pega o domínio do .env (ou usa localhost como fallback)
const ENV_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
// 2. Remove a barra do final se existir (pra evitar duplicidade)
const BASE_URL = ENV_URL.replace(/\/$/, '');
// 3. Monta a URL final da API (Adiciona o /api aqui)
const API_URL = `${BASE_URL}/api`; 

const UserManagement = () => {
    // ============================================================================
    // BLOCO 2: HOOKS E ESTADOS
    // ============================================================================
    const navigate = useNavigate();
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Estados de Controle do Modal
    const [editingUser, setEditingUser] = useState(null); 
    const [isCreating, setIsCreating] = useState(false); // Define se o modal é para NOVO usuário
    const [formData, setFormData] = useState({ nome: '', email: '', role: 'viewer', password: '' });

    const token = localStorage.getItem('token');

    // ============================================================================
    // BLOCO 3: BUSCAR USUÁRIOS (READ)
    // ============================================================================
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            // AGORA A URL ESTÁ CORRETA: .../api/users/
            const response = await fetch(`${API_URL}/users/`, { headers });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    toast.error("Acesso negado ou sessão expirada");
                    navigate('/dashboard'); 
                    return;
                }
                throw new Error('Erro ao carregar lista');
            }
            const data = await response.json();
            setUsers(data);
            setError('');
        } catch (err) {
            console.error("Erro fetchUsers:", err); // Log para ajudar no debug
            setError('Não foi possível carregar os usuários.');
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ============================================================================
    // BLOCO 4: FUNÇÃO PARA CRIAR NOVO (POST)
    // ============================================================================
    const handleCreate = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Criando usuário...");
        try {
            const response = await fetch(`${API_URL}/users/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success("Usuário criado com sucesso!", { id: toastId });
                setIsCreating(false);
                setFormData({ nome: '', email: '', role: 'viewer', password: '' });
                fetchUsers(); // Atualiza a tabela
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Erro ao criar usuário");
            }
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };

    // ============================================================================
    // BLOCO 5: SALVAR EDIÇÃO (UPDATE)
    // ============================================================================
    const handleUpdate = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Atualizando...");
        try {
            const payload = { ...formData };
            // Se a senha estiver vazia na edição, não a enviamos para o backend
            if (!payload.password || payload.password.trim() === '') {
                delete payload.password;
            }

            const response = await fetch(`${API_URL}/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success("Usuário atualizado!", { id: toastId });
                setEditingUser(null);
                fetchUsers();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Falha ao atualizar");
            }
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };

    // ============================================================================
    // BLOCO 6: DELETAR USUÁRIO (DELETE)
    // ============================================================================
    const handleDelete = async (id, email) => {
        if (!window.confirm(`Tem certeza que deseja excluir ${email}?`)) return;
        const toastId = toast.loading("Removendo...");
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                toast.success("Usuário removido!", { id: toastId });
                fetchUsers();
            }
        } catch (err) {
            toast.error("Erro ao remover usuário.", { id: toastId });
        }
    };

    // ============================================================================
    // BLOCO 7: RENDERIZAÇÃO
    // ============================================================================
    return (
        <div className="card animate-fade-in" style={{position: 'relative'}}>
            
            {/* CABEÇALHO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate('/dashboard')} className="btn-icon" style={{background: '#f3f2f1', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer'}}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2 style={{ fontSize: '1.5rem', color: '#333', margin: 0 }}>
                        <Shield size={28} color="#0078d4" /> Gerenciar Usuários
                    </h2>
                </div>

                <button className="btn-primary" onClick={() => {
                    setIsCreating(true);
                    setEditingUser(null);
                    setFormData({ nome: '', email: '', role: 'viewer', password: '' });
                }} style={{display: 'flex', gap: '5px'}}>
                    <UserPlus size={18} /> Novo Usuário
                </button>
            </div>

            {error && <div className="login-error" style={{marginBottom: '15px'}}><AlertCircle size={16}/> {error}</div>}

            {loading ? <p>Carregando...</p> : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th><th>E-mail</th><th>Permissão</th><th>Status</th><th style={{textAlign: 'center'}}>Ações</th>
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
                                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', background: user.role === 'admin' ? '#e3f2fd' : '#f5f5f5', color: user.role === 'admin' ? '#1565c0' : '#616161', fontWeight: 'bold' }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td><span style={{color: user.is_active ? 'green' : 'red', fontWeight: 'bold'}}>{user.is_active ? 'Ativo' : 'Inativo'}</span></td>
                                    <td style={{textAlign: 'center'}}>
                                        <button onClick={() => {
                                            setEditingUser(user);
                                            setIsCreating(false);
                                            setFormData({ nome: user.nome, email: user.email, role: user.role, password: '' });
                                        }} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#0078d4', marginRight: '10px'}}>
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(user.id, user.email)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f'}}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL (PARA CRIAÇÃO OU EDIÇÃO) */}
            {(editingUser || isCreating) && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{width: '400px', maxWidth: '90%', background: 'white', padding: '20px', borderRadius: '8px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                            <h3>{isCreating ? 'Novo Usuário' : 'Editar Usuário'}</h3>
                            <button onClick={() => {setEditingUser(null); setIsCreating(false)}} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={isCreating ? handleCreate : handleUpdate}>
                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label>Nome</label>
                                <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required style={{width: '100%', padding: '8px'}}/>
                            </div>
                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label>E-mail</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{width: '100%', padding: '8px'}}/>
                            </div>
                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label>Permissão</label>
                                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{width: '100%', padding: '8px'}}>
                                    <option value="viewer">Visualizador</option>
                                    <option value="user">Usuário Comum</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div className="form-group" style={{marginBottom: '20px'}}>
                                <label>{isCreating ? 'Senha' : 'Nova Senha (opcional)'}</label>
                                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={isCreating} placeholder="******" style={{width: '100%', padding: '8px'}}/>
                            </div>
                            
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="submit" className="btn-primary" style={{flex: 1}}><Save size={18}/> Salvar</button>
                                <button type="button" onClick={() => {setEditingUser(null); setIsCreating(false)}} className="btn-secondary" style={{flex: 1}}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;