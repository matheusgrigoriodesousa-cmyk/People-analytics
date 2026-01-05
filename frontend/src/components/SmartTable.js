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

// 1. Recebemos 'currentUserRole' nas props
const SmartTable = forwardRef(({ data, onEdit, onDelete, searchState, currentUserRole }, ref) => {
  
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Lógica de Ordenação
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const searchTerm = searchState ? searchState.value : internalSearchTerm;

  // Lógica de Processamento (Filtro + Busca + Sort)
  const processedData = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];
    let filtered = [...safeData];

    // Filtra pela busca (se não for busca externa)
    if (!searchState && searchTerm) {
      filtered = filtered.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Ordena
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

    return filtered;
  }, [data, searchTerm, sortConfig, searchState]);

  // Expomos os dados filtrados para quem usar a ref (App.js)
  useImperativeHandle(ref, () => ({
    getFilteredData: () => processedData
  }));

  // Paginação
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = processedData.slice(startIndex, startIndex + itemsPerPage);

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div className="smart-table-wrapper">
      {/* Controles da Tabela */}
      <div className="table-controls">
        <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Buscar em toda a tabela..." 
              className="search-input"
              style={{ paddingLeft: '35px' }}
              value={searchTerm}
              onChange={(e) => { 
                if (searchState) {
                  searchState.setValue(e.target.value);
                } else {
                  setInternalSearchTerm(e.target.value);
                }
                setCurrentPage(1); 
              }}
            />
        </div>
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

      {/* Tabela */}
      <table className="custom-table">
        <thead>
          <tr>
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
            
            {/* 2. SÓ MOSTRA O TÍTULO 'AÇÕES' SE NÃO FOR VIEWER */}
            {currentUserRole !== 'viewer' && <th>AÇÕES</th>}
          </tr>
        </thead>
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
                    R$ {Number(emp.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                
                {/* 3. SÓ MOSTRA OS BOTÕES SE NÃO FOR VIEWER */}
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
            <tr>
              {/* Ajustamos o colspan para cobrir a coluna de ações se ela não existir */}
              <td colSpan={currentUserRole !== 'viewer' ? "5" : "4"} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                Nenhum resultado encontrado para "{searchTerm}".
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginação */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '0 10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>
              Mostrando <strong>{currentData.length}</strong> de <strong>{processedData.length}</strong> resultados
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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