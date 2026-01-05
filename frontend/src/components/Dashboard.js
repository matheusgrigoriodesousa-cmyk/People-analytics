import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { formatCurrency } from '../utils/format';
import { 
  LayoutDashboard, PlusCircle, FileSpreadsheet, Printer, X, 
  Users, DollarSign, Calendar, ShieldCheck
} from 'lucide-react';

import { useEmployees } from '../hooks/useEmployees'; 
import { useTheme } from '../hooks/useTheme'; 

// --- SEUS COMPONENTES (Incluindo o Turnover) ---
import SmartTable from './SmartTable';
import ModalCadastro from './ModalCadastro';
import ChartsSection from './ChartsSection'; // Verifique se o nome do arquivo é ChartsSection ou ChatsSection
import Header from './Header'; 
import DashboardSkeleton from './DashboardSkeleton';
import GraficoTurnover from './GraficoTurnover'; // <--- NOVO COMPONENTE

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [selectedDepts, setSelectedDepts] = useState(['TODOS', '', '', '']);
  const [searchTerm, setSearchTerm] = useState('');

  const user = {
      name: localStorage.getItem('user_name'),
      role: localStorage.getItem('user_role')
  };

  const tableRef = useRef();
  const { theme, toggleTheme } = useTheme();
  
  const { 
    employees, 
    dashboardData, 
    departments, 
    loading, 
    error, 
    fetchData, 
    saveEmployee, 
    deleteEmployee 
  } = useEmployees();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (data) => {
    const success = await saveEmployee(data, () => {
      setShowModal(false);
      setEmployeeToEdit(null);
    });
    if (success) fetchData();
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // --- FILTROS ---
  const activeDepts = useMemo(() => selectedDepts.filter(d => d !== ''), [selectedDepts]);
  const showAll = activeDepts[0] === 'TODOS';

  const filteredEmployees = useMemo(() => {
    let result = Array.isArray(employees) ? employees : [];
    
    result = result.filter(f => {
      if (showAll) return true;
      return activeDepts.includes(f.dept);
    });

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(val => String(val).toLowerCase().includes(lowerTerm))
      );
    }
    return result;
  }, [employees, showAll, activeDepts, searchTerm]);

  // --- DADOS DOS GRÁFICOS ---
  const chartData = useMemo(() => {
    if (!dashboardData?.por_departamento) return [];
    const baseData = dashboardData.por_departamento;
    
    return showAll 
      ? baseData.map(d => ({ nome: d.dept, salario: d.salario_medio }))
      : baseData.filter(d => activeDepts.includes(d.dept)).map(d => ({ nome: d.dept, salario: d.salario_medio }));
  }, [dashboardData, showAll, activeDepts]);

  const pieData = useMemo(() => {
    if (!filteredEmployees.length) return [];
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

  const handleExportExcel = () => {
    const dataToExport = tableRef.current?.getFilteredData?.() || filteredEmployees;
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados RH");
    XLSX.writeFile(wb, "relatorio_rh.xlsx");
    toast.success("Excel gerado com sucesso!");
  };

  return (
    <div className="dashboard-container animate-fade-in">
      
      <div className="dashboard-controls no-print">
        <Header user={user} onLogout={handleLogout} toggleTheme={toggleTheme} currentTheme={theme} />
        
        <div className="toolbar-row" style={{marginBottom: '20px'}}>
             <div className="filters-group">
                <div style={{ position: 'relative' }}>
                    <LayoutDashboard size={16} className="select-icon" />
                    <select 
                        value={selectedDepts[0]} 
                        onChange={e => setSelectedDepts(e.target.value === 'TODOS' ? ['TODOS', '','',''] : [e.target.value, '','',''])}
                        style={{ paddingLeft: '35px' }}
                    >
                        <option value="TODOS">Visão Geral</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {!showAll && [1, 2, 3].map((index) => (
                    <select 
                        key={index} 
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

                {!showAll && (
                    <button onClick={() => setSelectedDepts(['TODOS', '', '', ''])} className="btn-clear-filter">
                        <X size={16} /> Limpar
                    </button>
                )}
             </div>

            <div className="actions-group">
                {user.role === 'admin' && (
                  <button className="btn-action btn-admin" onClick={() => navigate('/users')}>
                      <ShieldCheck size={18} /> Gerenciar Usuários
                  </button>
                )}

                <button className="btn-action btn-add" onClick={() => { setEmployeeToEdit(null); setShowModal(true); }}>
                    <PlusCircle size={18} /> Novo Func.
                </button>
                
                <button className="btn-action btn-excel" onClick={handleExportExcel}>
                    <FileSpreadsheet size={18} /> Excel
                </button>
                <button className="btn-action btn-print" onClick={() => window.print()}>
                    <Printer size={18} /> PDF
                </button>
            </div>
        </div>
      </div>

      {loading && !employees.length ? (
        <DashboardSkeleton />
      ) : error && !employees.length ? (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchData} className="btn-action">Tentar Novamente</button>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard title="Total Funcionários" value={filteredEmployees.length} icon={Users} color="#0078d4" />
            <StatCard title="Média Salarial" value={dashboardData ? formatCurrency(dashboardData.media_salarial) : 'R$ 0,00'} icon={DollarSign} color="#107c10" />
            <StatCard title="Média de Idade" value={dashboardData ? `${dashboardData.media_idade} anos` : '0 anos'} icon={Calendar} color="#d13438" />
          </div>

          {/* ÁREA DE GRÁFICOS */}
          {dashboardData && chartData.length > 0 && (
              <>
                <ChartsSection 
                    chartData={chartData} 
                    chartTitle={showAll ? "Média Salarial: Geral" : "Comparativo de Departamentos"} 
                    kpiProps={kpiProps} 
                    pieData={pieData} 
                    showAll={showAll} 
                    activeDepts={activeDepts} 
                    mediaSalarial={dashboardData.media_salarial} 
                    currentTheme={theme} 
                />
                
                {/* --- AQUI ESTÁ O SEU GRÁFICO DE TURNOVER --- */}
                <div style={{ marginTop: '20px' }}>
                    <GraficoTurnover data={dashboardData} />
                </div>
              </>
          )}

          <div className="table-container">
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

      {showModal && (
        <ModalCadastro 
          onClose={() => { setShowModal(false); setEmployeeToEdit(null); }} 
          onSave={handleSave} 
          departments={departments} 
          employeeToEdit={employeeToEdit} 
        />
      )}
    </div>
  );
};

export default Dashboard;