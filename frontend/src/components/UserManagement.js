import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- IMPORTANTE PARA NAVEGAÇÃO
import { Trash2, UserPlus, Shield, User, AlertCircle, Edit, X, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const RAW_URL = process.env.REACT_APP_API_URL || "https://people-analytics-api-jba6.onrender.com/api";
const BASE_URL = RAW_URL.replace(/\/api$/, ''); 
const API_URL = `${BASE_URL}/api`;

const UserManagement = () => {
    const navigate = useNavigate(); // Hook para navegar entre páginas
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Estados para Edição
    const [editingUser, setEditingUser] = useState(null); 
    const [formData, setFormData] = useState({ nome: '', email: '', role: 'viewer', password: '' });

    const token = localStorage.getItem('token');

    // --- BUSCAR USUÁRIOS ---
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(`${API_URL}/users`, { headers });
            
            if (!response.ok) {
                // Se der erro 401 (token expirado), manda pro login
                if (response.status === 401) {
                    toast.error("Sessão expirada");
                    navigate('/');
                    return;
                }
                throw new Error('Erro ao carregar lista');
            }
            
            const data = await response.json();
            setUsers(data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Não foi possível carregar os usuários.');
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- PREPARAR EDIÇÃO ---
    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({ 
            nome: user.nome, 
            email: user.email, 
            role: user.role,
            password: '' 
        });
    };

    // --- SALVAR EDIÇÃO ---
    const handleUpdate = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Atualizando...");

        try {
            // Limpa a senha se estiver vazia para não enviar string vazia pro banco
            const payload = { ...formData };
            if (!payload.password || payload.password.trim() === '') {
                delete payload.password;
            }

            console.log("Enviando atualização:", payload); // Para depuração

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
                console.error("Erro backend:", errorData);
                throw new Error(errorData.detail || "Falha ao atualizar");
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro ao atualizar. Verifique se o backend subiu.", { id: toastId });
        }
    };

    // --- DELETAR ---
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
            } else {
                throw new Error();
            }
        } catch (err) {
            toast.error("Erro ao remover.", { id: toastId });
        }
    };

    return (
        <div className="card animate-fade-in" style={{position: 'relative'}}>
            
            {/* --- CABEÇALHO COM BOTÃO VOLTAR --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* BOTÃO VOLTAR AQUI */}
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        style={{
                            background: '#f3f2f1', 
                            border: 'none', 
                            borderRadius: '50%', 
                            width: '40px', 
                            height: '40px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#333'
                        }}
                        title="Voltar para o Dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    
                    <h2 style={{ fontSize: '1.5rem', color: '#333', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                        <Shield size={28} color="#0078d4" /> Gerenciar Usuários
                    </h2>
                </div>

                <button className="btn-primary" onClick={() => toast('Use a tela de Registro para novos')} style={{display: 'flex', gap: '5px'}}>
                    <UserPlus size={18} /> Novo Usuário
                </button>
            </div>

            {/* --- LISTA DE ERROS --- */}
            {error && <div style={{ padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '15px' }}><AlertCircle size={16}/> {error}</div>}

            {/* --- TABELA --- */}
            {loading ? <p>Carregando...</p> : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Permissão</th>
                                <th>Status</th>
                                <th style={{textAlign: 'center'}}>Ações</th>
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
                                        <button onClick={() => handleEditClick(user)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#0078d4', padding: '5px', marginRight: '10px'}} title="Editar">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(user.id, user.email)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', padding: '5px'}} title="Excluir">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- MODAL DE EDIÇÃO --- */}
            {editingUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{width: '400px', maxWidth: '90%', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                            <h3>Editar Usuário</h3>
                            <button onClick={() => setEditingUser(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label style={{display: 'block', marginBottom: '5px'}}>Nome</label>
                                <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}/>
                            </div>
                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label style={{display: 'block', marginBottom: '5px'}}>E-mail</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}/>
                            </div>
                            <div className="form-group" style={{marginBottom: '15px'}}>
                                <label style={{display: 'block', marginBottom: '5px'}}>Permissão</label>
                                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}>
                                    <option value="viewer">Visualizador</option>
                                    <option value="user">Usuário Comum</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div className="form-group" style={{marginBottom: '20px'}}>
                                <label style={{display: 'block', marginBottom: '5px'}}>Nova Senha <small>(Deixe em branco para manter)</small></label>
                                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="******" style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}/>
                            </div>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="submit" className="btn-primary" style={{flex: 1, display: 'flex', justifyContent: 'center', gap: '5px', padding: '10px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                                    <Save size={18}/> Salvar
                                </button>
                                <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary" style={{flex: 1, padding: '10px', background: '#f3f2f1', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;