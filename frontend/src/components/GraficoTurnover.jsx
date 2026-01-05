import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../hooks/useTheme';

const GraficoTurnover = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 🎨 CORES AJUSTADAS PARA CONTRASTE
  const textColor = isDark ? '#e5e7eb' : '#1f2937';
  const gridColor = isDark ? '#2d3748' : '#e5e7eb';

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 🔥 controla altura manualmente
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#111827' : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridColor,
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          font: { size: 11 }
        },
        grid: {
          color: gridColor,
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: textColor,
          font: { size: 11 }
        },
        grid: {
          color: gridColor,
          drawBorder: false
        }
      }
    }
  };

  const data = {
    labels: ['Jan', 'Fev', 'Mar'],
    datasets: [
      {
        label: 'Turnover',
        data: [12, 19, 3],
        backgroundColor: '#f59e0b', // âmbar forte (não some no light)
        hoverBackgroundColor: '#d97706',
        borderRadius: 6,
        maxBarThickness: 42,
        barPercentage: 0.45,
        categoryPercentage: 0.6
      }
    ]
  };

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default GraficoTurnover;
