import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

// === FUNÇÃO DE PROTEÇÃO ===
const safeMoney = (value) => {
  const num = Number(value);
  if (isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const ChartsSection = ({
  chartData,
  chartTitle,
  kpiProps,
  mediaSalarial,
  pieData,
  showAll,
  activeDepts = [],
  currentTheme 
}) => {
  
  const isDark = currentTheme === 'dark';

  if (!Array.isArray(chartData) || chartData.length === 0) return null;

  /* ================= CORES ================= */
  const textColor = isDark ? '#ffffff' : '#1f2937'; 
  const gridColor = isDark ? '#374151' : '#e5e7eb';
  const colorDanger = '#ef4444';

  const getDeptColor = (deptName) => {
    if (!deptName) return isDark ? '#4b5563' : '#cbd5e1';
    const normalized = String(deptName).trim().toUpperCase();
    const colors = {
      'FINANCEIRO':       '#107c10', 
      'COMERCIAL':        '#f59e0b', 
      'RH':               '#8764b8', 
      'RECURSOS HUMANOS': '#8764b8', 
      'TI':               '#0ea5e9', 
      'T.I.':             '#0ea5e9',
      'TECNOLOGIA':       '#0ea5e9',
      'MARKETING':        '#ffb900', 
      'VENDAS':           '#00bcf2', 
      'OPERAÇÕES':        '#d13438', 
      'DIRETORIA':        '#4b4f56', 
    };
    return colors[normalized] || '#0078d4'; 
  };

  /* ================= GRÁFICO 1: BARRAS VERTICAIS ================= */
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end', align: 'top', color: textColor,
        backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
        borderRadius: 4, padding: 4, font: { weight: '700', size: 11 },
        formatter: (value) => safeMoney(value)
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } }
    }
  };

  const barChartData = {
    labels: chartData.map(d => d?.nome || ''),
    datasets: [{
      label: 'Salário Médio',
      data: chartData.map(d => Number(d?.salario) || 0),
      backgroundColor: chartData.map(d => getDeptColor(d?.nome)),
      borderRadius: 6, maxBarThickness: 50, barPercentage: 0.6, categoryPercentage: 0.7
    }]
  };

  const plugins = [{
    id: 'mediaLine',
    beforeDraw: (chart) => {
      try {
        if (!showAll && (!activeDepts || activeDepts.length < 2)) return;
        const { ctx, chartArea: { left, right }, scales: { y } } = chart;
        if (!y) return;
        const yValue = y.getPixelForValue(Number(mediaSalarial) || 0);
        ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = colorDanger; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(left, yValue); ctx.lineTo(right, yValue); ctx.stroke(); ctx.restore();
      } catch (e) { console.error(e); }
    }
  }];

  /* ================= GRÁFICO 2: BARRAS HORIZONTAIS ================= */
  
  const safePieData = Array.isArray(pieData) ? pieData : [];
  const sortedPieData = [...safePieData].sort((a, b) => (Number(b.value)||0) - (Number(a.value)||0));
  
  const itemHeight = 60; 
  const chartHeight = Math.max(300, sortedPieData.length * itemHeight);

  const horizontalBarData = {
    labels: sortedPieData.map(p => p?.name || ''),
    datasets: [{
      label: 'Quantidade',
      data: sortedPieData.map(p => Number(p?.value) || 0),
      backgroundColor: sortedPieData.map(p => getDeptColor(p?.dept)),
      borderRadius: 4, 
      barThickness: 32, 
    }]
  };

  const horizontalOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    responsive: true,
    layout: {
      // CORREÇÃO 1: Aumentei 'left' para 25 para evitar corte no início da palavra
      padding: { right: 60, left: 25, top: 10, bottom: 10 }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { 
          label: (c) => {
            const item = sortedPieData[c.dataIndex];
            return ` ${c.raw} - ${item?.dept || 'Geral'}`;
          }
        },
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
        titleColor: isDark ? '#000' : '#fff',
        bodyColor: isDark ? '#000' : '#fff',
        borderColor: isDark ? '#ccc' : '#333',
        borderWidth: 1,
      },
      datalabels: {
        anchor: 'end', align: 'end', offset: 6, color: textColor,
        font: { weight: '800', size: 12 }, 
        formatter: (value) => value,
        clip: false, 
        clamp: false
      }
    },
    scales: {
      x: {
        beginAtZero: true, 
        grid: { display: false, drawBorder: false },
        ticks: { display: false },
        grace: '10%' 
      },
      y: {
        grid: { display: false, drawBorder: false },
        ticks: { 
          color: textColor, 
          font: { size: 11, weight: '600', lineHeight: 1.2 },
          autoSkip: false,
          padding: 10,
          crossAlign: 'near',
          mirror: false, 
          
          // LÓGICA DE QUEBRA DE LINHA INTELIGENTE (ATUALIZADA)
          callback: function(value) {
            const label = this.getLabelForValue(value);
            
            // CORREÇÃO 2: Limite reduzido para 15 caracteres.
            // Isso garante que "Gerente de Projetos" (19 chars) quebre a linha.
            const limit = 16;

            if (typeof label === 'string' && label.length > limit) {
               const words = label.split(' ');
               const lines = [];
               let currentLine = words[0];

               for (let i = 1; i < words.length; i++) {
                  if (currentLine.length + words[i].length < limit) {
                      currentLine += ' ' + words[i];
                  } else {
                      lines.push(currentLine);
                      currentLine = words[i];
                  }
               }
               lines.push(currentLine);
               
               if (lines.length > 2) return [lines[0], lines[1] + '...'];
               return lines;
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div className="charts-grid-3-columns">
      {/* KPI */}
      {kpiProps && (
        <div className="kpi-modern-card">
          <span className="kpi-subtitle">SALÁRIO MÉDIO</span>
          <h2 className="kpi-title">{kpiProps.department || 'Departamento'}</h2>
          <div className="kpi-big-value">
            {safeMoney(kpiProps.salary)} 
          </div>
          <div className={`kpi-badge ${(Number(kpiProps.salary)||0) >= (Number(kpiProps.referenceValue)||0) ? 'positive' : 'negative'}`}>
            {(Number(kpiProps.salary)||0) >= (Number(kpiProps.referenceValue)||0) ? '▲ Maior' : '▼ Menor'} que a referência
          </div>
          <div className="kpi-footer">
            <small>Comparado com {kpiProps.referenceLabel || 'Ref'}:</small>
            <strong>
              {safeMoney(kpiProps.referenceValue)}
            </strong>
          </div>
        </div>
      )}

      {/* GRÁFICO VERTICAL */}
      <div className="chart-card-middle">
        <h3 className="chart-internal-title">{chartTitle}</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <Bar key={`v-${currentTheme}`} data={barChartData} options={barOptions} plugins={plugins} />
        </div>
      </div>

      {/* GRÁFICO HORIZONTAL */}
      <div className="chart-card-right" style={{ display: 'flex', flexDirection: 'column', height: '380px' }}>
        <h3 className="chart-internal-title">Distribuição por Cargo</h3>
        
        {/* Container com scroll class e height corrigido */}
        <div className="chart-scroll-container" style={{ flex: 1 }}>
          <div style={{ height: `${chartHeight}px`, width: '100%', position: 'relative' }}>
            <Bar key={`h-${currentTheme}`} data={horizontalBarData} options={horizontalOptions} />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ChartsSection;