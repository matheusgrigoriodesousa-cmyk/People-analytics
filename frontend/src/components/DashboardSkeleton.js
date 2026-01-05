import React from 'react';
import '../App.css'; 

const DashboardSkeleton = () => {
  return (
    <div className="dashboard-container">
      {/* 1. Header Falso */}
      <div className="dashboard-controls" style={{ height: '80px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="skeleton-box" style={{ width: '200px', height: '30px' }}></div>
        <div className="skeleton-box" style={{ width: '100%', maxWidth: '300px', height: '40px', marginLeft: 'auto' }}></div>
      </div>

      {/* 2. Cards Falsos (Stats) */}
      <div className="stats-grid">
         {[1, 2, 3].map((i) => (
            <div key={i} className="stat-card" style={{ height: '140px' }}>
                <div className="skeleton-box" style={{ width: '50%', height: '15px', marginBottom: '20px' }}></div>
                <div className="skeleton-box" style={{ width: '70%', height: '40px' }}></div>
            </div>
         ))}
      </div>

      {/* 3. Área de Gráficos Falsa */}
      <div className="charts-grid-3-columns" style={{ minHeight: '350px' }}>
         <div className="kpi-modern-card">
             <div className="skeleton-box" style={{ width: '100%', height: '100%' }}></div>
         </div>
         <div className="chart-card-middle">
             <div className="skeleton-box" style={{ width: '100%', height: '100%' }}></div>
         </div>
         <div className="chart-card-right">
             <div className="skeleton-box" style={{ width: '100%', height: '100%' }}></div>
         </div>
      </div>

      {/* 4. Tabela Falsa */}
      <div className="table-container">
         <div className="skeleton-box" style={{ width: '250px', height: '25px', marginBottom: '20px' }}></div>
         {/* Linhas da tabela */}
         {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="skeleton-box" style={{ width: '100%', height: '40px', marginBottom: '10px', opacity: 0.5 }}></div>
         ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;