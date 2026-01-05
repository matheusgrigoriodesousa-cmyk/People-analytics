import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import '../App.css';
import { 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-react';

// ============================================================================
// BLOCO 1: DEFINIÇÃO DO COMPONENTE COM 'forwardRef'
// ============================================================================
// Usamos 'forwardRef' para permitir que o componente PAI (Dashboard.js) acesse
// funções internas deste componente (como pegar os dados filtrados para exportar Excel).
const SmartTable = forwardRef(({ data, onEdit, onDelete, searchState, currentUserRole }, ref) => {
  
  // ============================================================================
  // BLOCO 2: ESTADOS LOCAIS (A "Memória" da Tabela)
  // ============================================================================
  const [internalSearchTerm, setInternalSearchTerm] = useState(''); // Busca local (caso não venha do pai)
  const [currentPage, setCurrentPage] = useState(1);   // Página atual
  const [itemsPerPage, setItemsPerPage] = useState(5); // Quantos itens mostrar por vez
  
  // Configuração de Ordenação: qual coluna (key) e qual direção ('asc' ou 'desc')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // ============================================================================
  // BLOCO 3: LÓGICA DE ORDENAÇÃO (Click no Cabeçalho)
  // ============================================================================
  const requestSort = (key) => {
    let direction = 'asc';
    // Se clicar na mesma coluna que já está ordenada, inverte a direção
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Decide qual termo de busca usar: o que veio do Pai (searchState) ou o Local
  const searchTerm = searchState ? searchState.value : internalSearchTerm;

  // ============================================================================
  // BLOCO 4: O "MOTOR" DE PROCESSAMENTO (useMemo)
  // ============================================================================
  // Esta é a parte mais importante. O useMemo garante que essa lógica pesada
  // só rode quando os dados, a busca ou a ordenação mudarem.
  const processedData = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];
    let filtered = [...safeData]; // Cria uma cópia para não mexer no original

    // 1. FILTRAGEM: Verifica se o texto da busca existe em ALGUM valor da linha
    if (!searchState && searchTerm) {
      filtered = filtered.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // 2. ORDENAÇÃO: Se houver uma coluna selecionada, reordena o array
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } 

    return filtered; // Retorna a lista pronta (Filtrada e Ordenada)
  }, [data, searchTerm, sortConfig, searchState]);

  // ============================================================================
  // BLOCO 5: EXPONDO DADOS PARA O PAI (Excel)
  // ============================================================================
  // Aqui dizemos: "Pai, se você chamar tableRef.current.getFilteredData(), 
  // eu te devolvo os dados já processados (filtrados)". Isso é usado para gerar o Excel.
  useImperativeHandle(ref, () => ({
    getFilteredData: () => processedData
  }));

  // ============================================================================
  // BLOCO 6: CÁLCULO DE PAGINAÇÃO
  // ============================================================================
  // Divide a lista processada em "fatias" para exibir apenas a página atual.
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = processedData.slice(startIndex, startIndex + itemsPerPage);

  // Helper para desenhar a setinha ao lado do título da coluna
  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // ============================================================================
  // BLOCO 7: RENDERIZAÇÃO - CONTROLES SUPERIORES
  // ============================================================================
  return (
    <div className="smart-table-wrapper">
      <div className="table-controls">
        {/* Campo de Busca */}
        <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Buscar em toda a tabela..." 
              className="search-input"
              style={{ paddingLeft: '35px' }}
              value={searchTerm}
              onChange={(e) => { 
                // Atualiza o estado do Pai ou o Local, dependendo de quem controla
                if (searchState) {
                  searchState.setValue(e.target.value);
                } else {
                  setInternalSearchTerm(e.target.value);
                }
                setCurrentPage(1); // Volta pra página 1 ao pesquisar
              }}
            />
        </div>
        
        {/* Seletor de Itens por Página */}
        <div className="result-count">
            <span style={{ marginRight: '10px', color: '#666' }}>Itens por pág:</span>
            <select 
                value={itemsPerPage} 
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
            </select>
        </div>
      </div>

      {/* ============================================================================
          BLOCO 8: CABEÇALHO DA TABELA (CLICÁVEL)
      ============================================================================ */}
      <table className="custom-table">
        <thead>
          <tr>
            {/* Cada TH tem um onClick para ordenar por aquela coluna */}
            <th onClick={() => requestSort('nome')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    NOME {getSortIcon('nome')}
                </div>
            </th>
            <th onClick={() => requestSort('dept')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    DEPTO {getSortIcon('dept')}
                </div>
            </th>
            <th onClick={() => requestSort('cargo')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    CARGO {getSortIcon('cargo')}
                </div>
            </th>
            <th onClick={() => requestSort('salario')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    SALÁRIO {getSortIcon('salario')}
                </div>
            </th>
            
            {/* SEGURANÇA: Coluna Ações só aparece se NÃO for 'viewer' */}
            {currentUserRole !== 'viewer' && <th>AÇÕES</th>}
          </tr>
        </thead>
        
        {/* ============================================================================
            BLOCO 9: CORPO DA TABELA (DADOS)
        ============================================================================ */}
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((emp) => (
              <tr key={emp.id || Math.random()}>
                <td style={{ fontWeight: 600 }}>{emp.nome}</td>
                <td>
                    <span className="status-badge" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                        {emp.dept}
                    </span>
                </td>
                <td>{emp.cargo}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {/* Formatação bonita de moeda R$ */}
                    R$ {Number(emp.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                
                {/* SEGURANÇA: Botões Editar/Excluir só aparecem se NÃO for 'viewer' */}
                {currentUserRole !== 'viewer' && (
                  <td>
                    <button className="btn-icon edit" onClick={() => onEdit(emp)} title="Editar">
                      <Pencil size={18} />
                    </button>
                    <button className="btn-icon delete" onClick={() => onDelete(emp.id)} title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            // Caso a busca não encontre nada
            <tr>
              <td colSpan={currentUserRole !== 'viewer' ? "5" : "4"} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                Nenhum resultado encontrado para "{searchTerm}".
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ============================================================================
          BLOCO 10: RODAPÉ (PAGINAÇÃO)
      ============================================================================ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '0 10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>
              Mostrando <strong>{currentData.length}</strong> de <strong>{processedData.length}</strong> resultados
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {/* Botão Página Anterior */}
              <button 
                className="btn-icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.3 : 1 }}
              >
                  <ChevronLeft size={20} />
              </button>
              
              <span style={{ margin: '0 10px', fontWeight: 600, fontSize: '0.9rem' }}>
                  Página {currentPage} de {totalPages || 1}
              </span>

              {/* Botão Próxima Página */}
              <button 
                className="btn-icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{ opacity: currentPage === totalPages || totalPages === 0 ? 0.3 : 1 }}
              >
                  <ChevronRight size={20} />
              </button>
          </div>
      </div>
    </div>
  );
});

export default SmartTable;