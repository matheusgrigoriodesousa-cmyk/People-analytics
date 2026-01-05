import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook essencial para redirecionamento
import { Trash2, UserPlus, Shield, User, AlertCircle, Edit, X, Save, ArrowLeft } from 'lucide-react'; // Ícones
import toast from 'react-hot-toast'; // Biblioteca de alertas visuais

// ============================================================================
// BLOCO 1: CONFIGURAÇÃO DA URL DA API
// ============================================================================
// Esta lógica garante que funcione tanto localmente quanto na nuvem (Render/Vercel).
// 1. Tenta pegar a variável de ambiente.
// 2. Se não existir, usa a URL fixa do Render.
// 3. Remove barras extras no final para padronizar a construção da URL.
const RAW_URL = process.env.REACT_APP_API_URL || "https://people-analytics-api-jba6.onrender.com/api";
const BASE_URL = RAW_URL.replace(/\/api$/, ''); 
const API_URL = `${BASE_URL}/api`;

const UserManagement = () => {
    // ============================================================================
    // BLOCO 2: HOOKS E ESTADOS (A Memória do Componente)
    // ============================================================================
    const navigate = useNavigate(); // Permite navegar entre páginas (ex: voltar pro Dashboard)
    
    // Estados da Tabela
    const [users, setUsers] = useState([]); // Lista de usuários vinda do banco
    const [loading, setLoading] = useState(false); // Controla o "Carregando..."
    const [error, setError] = useState(''); // Guarda mensagens de erro
    
    // Estados do Modal de Edição
    const [editingUser, setEditingUser] = useState(null); // Se tiver um usuário aqui, o Modal abre. Se null, fecha.
    const [formData, setFormData] = useState({ nome: '', email: '', role: 'viewer', password: '' }); // Dados do formulário

    // Recupera o Token salvo no Login para provar ao backend que somos administradores
    const token = localStorage.getItem('token');

    // ============================================================================
    // BLOCO 3: BUSCAR USUÁRIOS (READ)
    // ============================================================================
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            // Anexa o Token no cabeçalho da requisição (Segurança)
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch(`${API_URL}/users`, { headers });
            
            if (!response.ok) {
                // TRATAMENTO ESPECIAL: Erro 401 significa "Token Vencido" ou "Sem Permissão".
                // Se isso acontecer, chutamos o usuário de volta para o Login.
                if (response.status === 401) {
                    toast.error("Sessão expirada");
                    navigate('/'); // Redireciona para login
                    return;
                }
                throw new Error('Erro ao carregar lista');
            }
            
            const data = await response.json();
            setUsers(data); // Salva os dados no estado para exibir na tabela
            setError('');
        } catch (err) {
            console.error(err);
            setError('Não foi possível carregar os usuários.');
        } finally {
            setLoading(false); // Desliga o loading independente se deu certo ou errado
        }
    }, [token, navigate]);

    // Roda a busca assim que a tela abre (mount)
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ============================================================================
    // BLOCO 4: PREPARAR EDIÇÃO (Abrir Modal)
    // ============================================================================
    // Quando clica no lápis, pegamos os dados daquele usuário e jogamos no formulário
    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({ 
            nome: user.nome, 
            email: user.email, 
            role: user.role,
            password: '' // A senha começa vazia para não expor o hash e só alterar se o usuário digitar algo novo
        });
    };

    // ============================================================================
    // BLOCO 5: SALVAR EDIÇÃO (UPDATE)
    // ============================================================================
    const handleUpdate = async (e) => {
        e.preventDefault();
        const toastId = toast.loading("Atualizando...");

        try {
            // Copia os dados do form
            const payload = { ...formData };
            
            // LÓGICA IMPORTANTE: Se o campo senha estiver vazio, REMOVEMOS ele do envio.
            // Assim, o backend entende que é para MANTER a senha antiga.
            if (!payload.password || payload.password.trim() === '') {
                delete payload.password;
            }

            console.log("Enviando atualização:", payload); 

            // Faz a chamada PUT para o backend atualizar
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
                setEditingUser(null); // Fecha o modal
                fetchUsers(); // Recarrega a lista para mostrar os dados novos
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

    // ============================================================================
    // BLOCO 6: DELETAR USUÁRIO (DELETE)
    // ============================================================================
    const handleDelete = async (id, email) => {
        // Confirmação nativa do navegador para evitar acidentes
        if (!window.confirm(`Tem certeza que deseja excluir ${email}?`)) return;
        
        const toastId = toast.loading("Removendo...");
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success("Usuário removido!", { id: toastId });
                fetchUsers(); // Atualiza a lista removendo o item excluído
            } else {
                throw new Error();
            }
        } catch (err) {
            toast.error("Erro ao remover.", { id: toastId });
        }
    };

    // ============================================================================
    // BLOCO 7: RENDERIZAÇÃO (JSX)
    // ============================================================================
    return (
        <div className="card animate-fade-in" style={{position: 'relative'}}>
            
            {/* --- CABEÇALHO --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* Botão de Voltar (Setinha) */}
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        style={{
                            background: '#f3f2f1', border: 'none', borderRadius: '50%', 
                            width: '40px', height: '40px', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#333'
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

            {/* --- EXIBIÇÃO DE ERROS --- */}
            {error && <div style={{ padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '15px' }}><AlertCircle size={16}/> {error}</div>}

            {/* --- TABELA DE USUÁRIOS --- */}
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
                            {/* Loop (Map) para criar uma linha <tr> para cada usuário */}
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <div style={{background: '#e0e0e0', padding: '5px', borderRadius: '50%'}}><User size={16}/></div>
                                        {user.nome}
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        {/* Badge colorido dependendo se é admin ou não */}
                                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', background: user.role === 'admin' ? '#e3f2fd' : '#f5f5f5', color: user.role === 'admin' ? '#1565c0' : '#616161', fontWeight: 'bold' }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td><span style={{color: user.is_active ? 'green' : 'red', fontWeight: 'bold'}}>{user.is_active ? 'Ativo' : 'Inativo'}</span></td>
                                    
                                    {/* Botões de Ação da Linha */}
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

            {/* --- MODAL DE EDIÇÃO (Pop-up) --- */}
            {/* Só é renderizado se 'editingUser' for verdadeiro (não nulo) */}
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
                        
                        {/* Formulário dentro do Modal */}
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
                            
                            {/* Botões do Modal */}
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