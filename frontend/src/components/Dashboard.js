import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Biblioteca responsável por criar e baixar o arquivo Excel
import toast from 'react-hot-toast'; // Biblioteca para notificações bonitas (popups)
import { useNavigate } from 'react-router-dom'; // Hook para navegar entre rotas (ex: ir para login)

import { formatCurrency } from '../utils/format'; // Função utilitária para formatar valores em R$
import { 
  LayoutDashboard, PlusCircle, FileSpreadsheet, Printer, X, 
  Users, DollarSign, Calendar, ShieldCheck
} from 'lucide-react'; // Ícones leves e modernos

// --- IMPORTS DOS SEUS COMPONENTES E HOOKS ---
import { useEmployees } from '../hooks/useEmployees'; // Hook customizado que contém toda a lógica de API (backend)
import { useTheme } from '../hooks/useTheme'; // Hook para alternar tema Claro/Escuro

import SmartTable from './SmartTable'; // Tabela inteligente com paginação e ordenação
import ModalCadastro from './ModalCadastro'; // O formulário de adicionar/editar
import ChartsSection from './ChartsSection'; // Seção visual dos gráficos (Barra e Pizza)
import Header from './Header'; // O topo da página com saudação e logout
import DashboardSkeleton from './DashboardSkeleton'; // Tela de carregamento (esqueleto)
import GraficoTurnover from './GraficoTurnover'; // O novo gráfico de rotatividade que criamos

// --- SUB-COMPONENTE: CARD DE ESTATÍSTICA ---
// Criamos aqui mesmo pois é pequeno e só usado nesta tela.
// Recebe título, valor, ícone e cor como "props" para ser reutilizável.
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="stat-card" style={{ borderLeft: `5px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
      {/* O fundo do ícone usa a mesma cor, mas com transparência (20 no final é o código hex para transparência) */}
      <div style={{ padding: '10px', background: `${color}20`, borderRadius: '8px', color: color }}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL: DASHBOARD ---
const Dashboard = () => {
  const navigate = useNavigate(); // Inicializa a função de navegação
  
  // --- ESTADOS LOCAIS (A "Memória" da Tela) ---
  const [showModal, setShowModal] = useState(false); // Controla se a janelinha de cadastro está visível
  const [employeeToEdit, setEmployeeToEdit] = useState(null); // Guarda os dados do funcionário sendo editado (ou null se for novo)
  const [selectedDepts, setSelectedDepts] = useState(['TODOS', '', '', '']); // Array complexo para permitir selecionar múltiplos departamentos
  const [searchTerm, setSearchTerm] = useState(''); // Guarda o texto digitado na busca

  // Recupera dados do usuário logado (salvos no navegador durante o Login)
  const user = {
      name: localStorage.getItem('user_name'),
      role: localStorage.getItem('user_role')
  };

  const tableRef = useRef(); // Referência para acessar a tabela diretamente (usado na exportação Excel)
  const { theme, toggleTheme } = useTheme(); // Pega o tema atual e a função de trocar
  
  // --- CONSUMINDO O HOOK DE FUNCIONÁRIOS ---
  // Aqui pegamos tudo pronto do useEmployees: dados, carregamento, erros e funções de ação.
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

  // --- EFEITO: CARREGAR DADOS ---
  // Roda uma única vez quando a tela abre (mount), chamando o backend.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- FUNÇÃO: SALVAR ---
  // Chamada quando o usuário clica em "Salvar" no Modal
  const handleSave = async (data) => {
    // Chama a API e passa um callback para fechar o modal APÓS o sucesso
    const success = await saveEmployee(data, () => {
      setShowModal(false);
      setEmployeeToEdit(null);
    });
    // Se deu tudo certo, recarrega os dados da tela para aparecer o novo funcionário
    if (success) fetchData();
  };

  // --- FUNÇÃO: LOGOUT ---
  const handleLogout = () => {
    localStorage.clear(); // Limpa token e dados do usuário
    window.location.href = '/'; // Força o redirecionamento para a tela de Login
  };

  // --- LÓGICA DE FILTROS (USEMEMO) ---
  // useMemo garante que esse cálculo pesado só rode quando 'selectedDepts' mudar.
  const activeDepts = useMemo(() => selectedDepts.filter(d => d !== ''), [selectedDepts]);
  const showAll = activeDepts[0] === 'TODOS'; // Verifica se o usuário quer ver tudo

  // O Filtro Mestre: Cruza Departamento + Busca por Texto
  const filteredEmployees = useMemo(() => {
    let result = Array.isArray(employees) ? employees : [];
    
    // 1. Filtra por Departamento
    result = result.filter(f => {
      if (showAll) return true; // Se "TODOS", passa ninguém é barrado
      return activeDepts.includes(f.dept); // Senão, só passa quem for dos departamentos escolhidos
    });

    // 2. Filtra pela Busca (Search Bar)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      // Varre todas as propriedades do funcionário procurando o texto
      result = result.filter(item => 
        Object.values(item).some(val => String(val).toLowerCase().includes(lowerTerm))
      );
    }
    return result;
  }, [employees, showAll, activeDepts, searchTerm]);

  // --- PREPARAÇÃO DE DADOS PARA GRÁFICOS ---
  // Transforma os dados brutos do backend no formato que a biblioteca 'Recharts' exige
  const chartData = useMemo(() => {
    if (!dashboardData?.por_departamento) return [];
    const baseData = dashboardData.por_departamento;
    
    return showAll 
      ? baseData.map(d => ({ nome: d.dept, salario: d.salario_medio }))
      : baseData.filter(d => activeDepts.includes(d.dept)).map(d => ({ nome: d.dept, salario: d.salario_medio }));
  }, [dashboardData, showAll, activeDepts]);

  // Prepara dados para o gráfico de Pizza (Agrupa por Cargo)
  const pieData = useMemo(() => {
    if (!filteredEmployees.length) return [];
    
    // Reducer: Percorre a lista contando quantos existem de cada cargo
    const stats = filteredEmployees.reduce((acc, curr) => {
      if (!acc[curr.cargo]) acc[curr.cargo] = { count: 0, dept: curr.dept };
      acc[curr.cargo].count += 1;
      return acc;
    }, {});
    
    // Formata para array
    return Object.keys(stats).map(cargo => ({ name: cargo, value: stats[cargo].count, dept: stats[cargo].dept }));
  }, [filteredEmployees]);

  // Dados para o KPI (Indicador de desempenho no gráfico)
  const kpiProps = useMemo(() => {
    return chartData.length > 0 ? {
      department: chartData[0].nome, 
      salary: chartData[0].salario, 
      referenceLabel: "Média Geral", 
      referenceValue: dashboardData?.media_salarial || 0
    } : null;
  }, [chartData, dashboardData]);

  // --- FUNÇÃO: EXPORTAR EXCEL ---
  const handleExportExcel = () => {
    // Tenta pegar os dados já filtrados e ordenados da tabela
    const dataToExport = tableRef.current?.getFilteredData?.() || filteredEmployees;
    
    // Cria a planilha virtual
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados RH");
    
    // Dispara o download
    XLSX.writeFile(wb, "relatorio_rh.xlsx");
    toast.success("Excel gerado com sucesso!");
  };

  // --- RENDERIZAÇÃO (JSX - O QUE APARECE NA TELA) ---
  return (
    <div className="dashboard-container animate-fade-in">
      
      {/* --- CABEÇALHO E FILTROS (Não aparecem na impressão) --- */}
      <div className="dashboard-controls no-print">
        <Header user={user} onLogout={handleLogout} toggleTheme={toggleTheme} currentTheme={theme} />
        
        <div className="toolbar-row" style={{marginBottom: '20px'}}>
             {/* Grupo de Filtros de Departamento */}
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

                {/* Selects extras para comparação (só aparecem se não estiver em "Visão Geral") */}
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

                {/* Botão limpar filtros */}
                {!showAll && (
                    <button onClick={() => setSelectedDepts(['TODOS', '', '', ''])} className="btn-clear-filter">
                        <X size={16} /> Limpar
                    </button>
                )}
             </div>

            {/* Grupo de Botões de Ação */}
            <div className="actions-group">
                {/* Botão Gerenciar Usuários (Protegido: Só aparece para Admin) */}
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
                
                {/* window.print() abre a janela nativa de impressão do navegador */}
                <button className="btn-action btn-print" onClick={() => window.print()}>
                    <Printer size={18} /> PDF
                </button>
            </div>
        </div>
      </div>

      {/* --- ESTADOS DE CARREGAMENTO E ERRO --- */}
      {loading && !employees.length ? (
        <DashboardSkeleton />
      ) : error && !employees.length ? (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchData} className="btn-action">Tentar Novamente</button>
        </div>
      ) : (
        <>
          {/* --- GRID DE ESTATÍSTICAS (Cards Coloridos) --- */}
          <div className="stats-grid">
            <StatCard title="Total Funcionários" value={filteredEmployees.length} icon={Users} color="#0078d4" />
            <StatCard title="Média Salarial" value={dashboardData ? formatCurrency(dashboardData.media_salarial) : 'R$ 0,00'} icon={DollarSign} color="#107c10" />
            <StatCard title="Média de Idade" value={dashboardData ? `${dashboardData.media_idade} anos` : '0 anos'} icon={Calendar} color="#d13438" />
          </div>

          {/* --- ÁREA DE GRÁFICOS --- */}
          {dashboardData && chartData.length > 0 && (
              <>
                {/* Seção Principal: Barras e Pizza */}
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
                
                {/* Gráfico de Turnover (Separado pois é mais complexo) */}
                <div style={{ marginTop: '20px' }}>
                    <GraficoTurnover data={dashboardData} />
                </div>
              </>
          )}

          {/* --- TABELA DE DADOS --- */}
          <div className="table-container">
            <SmartTable 
                ref={tableRef} // Passa a referência para podermos puxar dados pro Excel
                data={filteredEmployees} // Passa os dados JÁ FILTRADOS
                onEdit={(emp) => { setEmployeeToEdit(emp); setShowModal(true); }} 
                onDelete={deleteEmployee} 
                searchState={{ value: searchTerm, setValue: setSearchTerm }} // Estado da barra de busca
                currentUserRole={user.role} // Para saber se pode mostrar botão de excluir
            />
          </div>
        </>
      )}

      {/* --- MODAL (JANELA DE CADASTRO) --- */}
      {/* Só é renderizado se showModal for true */}
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