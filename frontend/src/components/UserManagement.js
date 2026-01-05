import React, { useState, useEffect } from 'react';
import { Trash2, UserPlus, Shield, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRole, setNewRole] = useState('viewer');

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPass) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: newName,
          email: newEmail,
          password: newPass,
          role: newRole
        })
      });

      if (!response.ok) throw new Error('Erro ao criar');
      
      toast.success("Usuário criado com sucesso!");
      setNewName(''); setNewEmail(''); setNewPass('');
      fetchUsers(); // Recarrega a lista
    } catch (err) {
      toast.error("Erro: Verifique se o email já existe.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Tem certeza que deseja remover este usuário?")) return;
    
    try {
      await fetch(`http://127.0.0.1:8000/api/users/${id}`, { method: 'DELETE' });
      toast.success("Usuário removido.");
      fetchUsers();
    } catch (err) {
      toast.error("Erro ao remover.");
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: '#ef4444',   // Vermelho
      editor: '#f59e0b',  // Laranja
      viewer: '#10b981'   // Verde
    };
    return (
      <span style={{ 
        padding: '4px 8px', borderRadius: '12px', color: '#fff', 
        fontSize: '0.75rem', fontWeight: 'bold', 
        backgroundColor: colors[role] || '#ccc' 
      }}>
        {role.toUpperCase()}
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;