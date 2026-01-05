import React, { useState, useEffect } from 'react';
import { Trash2, UserPlus, Shield, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';

// --- CONFIGURAÇÃO DE URL ATUALIZADA ---
const API_URL = process.env.REACT_APP_API_URL || "https://people-analytics-api-jba6.onrender.com";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRole, setNewRole] = useState('viewer');

  // --- BUSCAR USUÁRIOS ---
  const fetchUsers = async () => {
    try {
      // Atualizado para usar a URL do Render
      const response = await fetch(`${API_URL}/api/users`);
      if (!response.ok) throw new Error('Erro ao carregar lista');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- ADICIONAR USUÁRIO ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPass) return;

    const toastId = toast.loading('Criando usuário...');
    try {
      // Atualizado para usar a URL do Render
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: newName,
          email: newEmail,
          password: newPass,
          role: newRole
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar');
      }
      
      toast.success("Usuário criado com sucesso!", { id: toastId });
      setNewName(''); setNewEmail(''); setNewPass('');
      fetchUsers(); 
    } catch (err) {
      toast.error(err.message || "Erro: Verifique se o email já existe.", { id: toastId });
    }
  };

  // --- DELETAR USUÁRIO ---
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este usuário?")) return;
    
    const toastId = toast.loading('Removendo...');
    try {
      // Atualizado para usar a URL do Render
      const response = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
      
      if (!response.ok) throw new Error('Erro ao remover');

      toast.success("Usuário removido.", { id: toastId });
      fetchUsers();
    } catch (err) {
      toast.error("Erro ao remover.", { id: toastId });
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: '#ef4444',
      editor: '#f59e0b',
      viewer: '#10b981'
    };
    return (
      <span style={{ 
        padding: '4px 8px', borderRadius: '12px', color: '#fff', 
        fontSize: '0.75rem', fontWeight: 'bold', 
        backgroundColor: colors[role] || '#ccc' 
      }}>
        {role ? role.toUpperCase() : 'N/A'}
      </span>
    );
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Shield size={24} /> Gestão de Acessos
      </h2>

      {/* --- FORMULÁRIO DE CADASTRO --- */}
      <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '15px' }}>Cadastrar Novo Usuário</h3>
        <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
          
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Nome</label>
            <input className="search-input" style={{width: '100%'}} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Maria Silva" required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>E-mail</label>
            <input className="search-input" type="email" style={{width: '100%'}} value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@empresa.com" required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Senha</label>
            <input className="search-input" type="password" style={{width: '100%'}} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="******" required />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Permissão</label>
            <select className="search-input" style={{width: '100%'}} value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="viewer">Visualizador (Apenas vê)</option>
              <option value="editor">Editor (Edita dados)</option>
              <option value="admin">Admin (Total)</option>
            </select>
          </div>

          <button type="submit" className="btn-action btn-add" style={{ height: '42px', justifyContent: 'center' }}>
            <UserPlus size={18} /> Criar Acesso
          </button>
        </form>
      </div>

      {/* --- LISTA DE USUÁRIOS --- */}
      <div className="table-container">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Carregando usuários...</p>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Permissão</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><div style={{display:'flex', gap:'8px', alignItems:'center'}}><User size={16}/> {u.nome}</div></td>
                  <td><div style={{display:'flex', gap:'8px', alignItems:'center'}}><Mail size={16}/> {u.email}</div></td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td>
                    <button className="btn-icon delete" onClick={() => handleDeleteUser(u.id)} title="Remover acesso">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;