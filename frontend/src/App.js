import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

import { formatCurrency } from './utils/format';
import { 
  LayoutDashboard, PlusCircle, FileSpreadsheet, Printer, X, 
  Users, DollarSign, Calendar, ShieldCheck, ArrowLeft
} from 'lucide-react';

import { useEmployees } from './hooks/useEmployees'; 
import { useTheme } from './hooks/useTheme'; 

import Login from './components/Login';
import SmartTable from './components/SmartTable';
import ModalCadastro from './components/ModalCadastro';
import ChartsSection from './components/ChartsSection';
import Header from './components/Header'; 
import DashboardSkeleton from './components/DashboardSkeleton';
import UserManagement from './components/UserManagement';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="stat-card" style={{ borderLeft: `5px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
      <div style={{ padding: '10px', background: `${color}20`, borderRadius: '8px', color: color }}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [selectedDepts, setSelectedDepts] = useState(['TODOS', '', '', '']);
  const [searchTerm, setSearchTerm] = useState('');

  // ESTADO DA TELA ATUAL: 'dashboard' ou 'users'
  const [currentView, setCurrentView] = useState('dashboard');

  const tableRef = useRef();
  const { theme, toggleTheme } = useTheme();
  const { employees, dashboardData, departments, loading, error, fetchData, saveEmployee, deleteEmployee } = useEmployees();

  // Persistência de Login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('user_name');
    const userRole = localStorage.getItem('user_role');

    if (token && userName) {
      setUser({ name: userName, role: userRole, token: token });
      fetchData();
    }
  }, [fetchData]);

  useEffect(() => {
    if (user && !employees.length) fetchData();
  }, [user, fetchData, employees.length]);

  const handleSave = async (data) => {
      await saveEmployee(data, () => {
          setShowModal(false);
          setEmployeeToEdit(null);
      });
  };

  const handleLogout = () => {
     localStorage.clear();
     setUser(null);
     setCurrentView('dashboard');
  };

  const activeDepts = useMemo(() => selectedDepts.filter(d => d !== ''), [selectedDepts]);
  const showAll = activeDepts[0] === 'TODOS';

  const filteredEmployees = useMemo(() => {
    let result = employees.filter(f => {
      if (showAll) return true;
      return activeDepts.includes(f.dept);
    });
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(lowerTerm)));
    }
    return result;
  }, [employees, showAll, activeDepts, searchTerm]);

  const chartData = useMemo(() => {
      if (!dashboardData || !dashboardData.por_departamento) return [];
      if (showAll) {
          return dashboardData.por_departamento.map(d => ({ nome: d.dept, salario: d.salario_medio }));
      } else {
          return dashboardData.por_departamento
            .filter(d => activeDepts.includes(d.dept))
            .map(d => ({ nome: d.dept, salario: d.salario_medio }));
      }
  }, [dashboardData, showAll, activeDepts]);

  const pieData = useMemo(() => {
      const stats = filteredEmployees.reduce((acc, curr) => {
          if (!acc[curr.cargo]) acc[curr.cargo] = { count: 0, dept: curr.dept };
          acc[curr.cargo].count += 1;
          return acc;
      }, {});
      return Object.keys(stats).map(cargo => ({ name: cargo, value: stats[cargo].count, dept: stats[cargo].dept }));
  }, [filteredEmployees]); 

  const kpiProps = useMemo(() => {
      return chartData.length > 0 ? {
          department: chartData[0].nome, 
          salary: chartData[0].salario, 
          referenceLabel: "Média Geral", 
          referenceValue: dashboardData?.media_salarial || 0
      } : null;
  }, [chartData, dashboardData]);

  let dynamicTitle = showAll ? "Média Salarial: Todos os Departamentos" : activeDepts.length === 1 ? `Análise Individual: ${activeDepts[0]}` : `Comparativo entre ${activeDepts.length} Departamentos`;

  const handleExportExcel = () => {
    let dataToExport = filteredEmployees; 
    if (tableRef.current && tableRef.current.getFilteredData) {
        dataToExport = tableRef.current.getFilteredData();
    }
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados RH");
    XLSX.writeFile(wb, "relatorio_rh.xlsx");
    toast.success("Excel gerado com sucesso!");
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#333' } }} />

      <div className="dashboard-controls no-print">
        <Header user={user} onLogout={handleLogout} toggleTheme={toggleTheme} currentTheme={theme} />
        
        {/* --- BARRA DE NAVEGAÇÃO SUPERIOR --- */}
        <div className="toolbar-row" style={{marginBottom: '20px'}}>
           
           {/* BOTÃO VOLTAR (Só aparece se estiver na gestão de usuários) */}
           {currentView === 'users' ? (
              <button 
                className="btn-action" 
                onClick={() => setCurrentView('dashboard')}
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
              >
                <ArrowLeft size={18} /> Voltar ao Dashboard
              </button>
           ) : (
             /* --- FILTROS COMPLETOS --- */
             <div className="filters-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                
                {/* 1. SELEÇÃO PRINCIPAL */}
                <div style={{ position: 'relative' }}>
                    <LayoutDashboard size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)', zIndex: 1 }} />
                    <select 
                        style={{ paddingLeft: '35px' }} 
                        value={selectedDepts[0]} 
                        onChange={e => setSelectedDepts(e.target.value === 'TODOS' ? ['TODOS', '','',''] : [e.target.value, '','',''])}
                    >
                        <option value="TODOS">Visão Geral</option>
                        <hr/>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {/* 2. CAMPOS DE COMPARAÇÃO */}
                {!showAll && [1, 2, 3].map((index) => (
                    <select 
                        key={index} 
                        className="select-separator"
                        value={selectedDepts[index]} 
                        onChange={e => {
                            const newDepts = [...selectedDepts];
                            newDepts[index] = e.target.value;
                            setSelectedDepts(newDepts);
                        }}
                    >
                        <option value="">+ Comparar...</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                ))}

                {/* 3. BOTÃO LIMPAR */}
                {!showAll && (
                    <button onClick={() => setSelectedDepts(['TODOS', '', '', ''])} className="btn-clear-filter" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <X size={16} /> Limpar
                    </button>
                )}
             </div>
           )}

            <div className="actions-group">
                {/* BOTÃO EXCLUSIVO PARA ADMIN: Gerenciar Usuários */}
                {user.role === 'admin' && currentView === 'dashboard' && (
                  <button 
                    className="btn-action" 
                    onClick={() => setCurrentView('users')}
                    style={{ background: '#4f46e5', color: 'white' }}
                  >
                     <ShieldCheck size={18} /> Gerenciar Usuários
                  </button>
                )}

                {/* Botões Normais (Só no Dashboard) */}
                {currentView === 'dashboard' && (
                  <>
                    {/* [MUDANÇA 1] SÓ MOSTRA O BOTÃO 'NOVO' SE NÃO FOR VISUALIZADOR */}
                    {user.role !== 'viewer' && (
                        <button className="btn-action btn-add" onClick={() => { setEmployeeToEdit(null); setShowModal(true); }}>
                            <PlusCircle size={18} /> Novo Func.
                        </button>
                    )}

                    <button className="btn-action btn-excel" onClick={handleExportExcel}>
                        <FileSpreadsheet size={18} /> Excel
                    </button>
                    <button className="btn-action btn-print" onClick={() => window.print()}>
                        <Printer size={18} /> PDF
                    </button>
                  </>
                )}
            </div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL (RENDERIZAÇÃO CONDICIONAL) --- */}
      
      {currentView === 'users' ? (
        // TELA DE GESTÃO DE USUÁRIOS
        <UserManagement />
      ) : (
        // TELA DE DASHBOARD (PADRÃO)
        <>
          {loading && !employees.length ? <DashboardSkeleton /> : error && !employees.length ? <div className="error-msg">{error}</div> : (
            <>
              <div className="stats-grid">
                <StatCard title="Total Funcionários" value={filteredEmployees.length} icon={Users} color="#0078d4" />
                <StatCard title="Média Salarial" value={dashboardData ? formatCurrency(dashboardData.media_salarial) : '...'} icon={DollarSign} color="#107c10" />
                <StatCard title="Média de Idade" value={dashboardData ? `${dashboardData.media_idade} anos` : '...'} icon={Calendar} color="#d13438" />
              </div>

              {dashboardData && chartData.length > 0 && (
                  <ChartsSection chartData={chartData} chartTitle={dynamicTitle} kpiProps={kpiProps} pieData={pieData} showAll={showAll} activeDepts={activeDepts} mediaSalarial={dashboardData.media_salarial} currentTheme={theme} />
              )}

              <div className="table-container">
                {/* [MUDANÇA 2] Passando currentUserRole para a tabela esconder os ícones */}
                <SmartTable 
                    ref={tableRef} 
                    data={filteredEmployees} 
                    onEdit={(emp) => { setEmployeeToEdit(emp); setShowModal(true); }} 
                    onDelete={deleteEmployee} 
                    searchState={{ value: searchTerm, setValue: setSearchTerm }} 
                    currentUserRole={user.role} 
                />
              </div>
            </>
          )}
        </>
      )}

      {showModal && (
        <ModalCadastro onClose={() => setShowModal(false)} onSave={handleSave} departments={departments} employeeToEdit={employeeToEdit} />
      )}
    </div>
  );
}

export default App;