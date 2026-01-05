import React from 'react';
import { Bar } from 'react-chartjs-2'; // Importa o tipo de gráfico "Barra" da biblioteca Chart.js
import { useTheme } from '../hooks/useTheme'; // Importa nosso Hook customizado para detectar o tema (Dark/Light)

const GraficoTurnover = () => {
  // 1. DETECTAR O TEMA ATUAL
  const { theme } = useTheme(); 
  const isDark = theme === 'dark'; // Variável booleana (true/false) para facilitar a lógica abaixo

  // 2. PALETA DE CORES DINÂMICA
  // Se for Dark Mode, usa cinza claro para texto (#e5e7eb). Se for Light, usa cinza escuro (#1f2937).
  const textColor = isDark ? '#e5e7eb' : '#1f2937';
  // A grade do fundo precisa ser sutil: cinza escuro no Dark, cinza claro no Light.
  const gridColor = isDark ? '#2d3748' : '#e5e7eb';

  // 3. CONFIGURAÇÕES VISUAIS DO GRÁFICO (OPTIONS)
  const options = {
    responsive: true, // O gráfico se adapta à largura da tela
    maintainAspectRatio: false, // 🔥 IMPORTANTE: Permite que a gente defina a altura manualmente na div pai
    
    plugins: {
      legend: {
        labels: {
          color: textColor, // Cor da legenda se adapta ao tema
          font: {
            size: 12,
            weight: '600' // Negrito na legenda
          }
        }
      },
      tooltip: {
        // O balãozinho que aparece ao passar o mouse
        backgroundColor: isDark ? '#111827' : '#ffffff', // Fundo do tooltip
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridColor, // Borda sutil no tooltip
        borderWidth: 1
      }
    },
    
    // Configuração dos Eixos X (Horizontal) e Y (Vertical)
    scales: {
      x: {
        ticks: {
          color: textColor, // Cor dos meses (Jan, Fev...)
          font: { size: 11 }
        },
        grid: {
          color: gridColor, // Cor das linhas verticais de fundo
          drawBorder: false // Remove a linha grossa da borda
        }
      },
      y: {
        ticks: {
          color: textColor, // Cor dos números (0, 5, 10...)
          font: { size: 11 }
        },
        grid: {
          color: gridColor, // Cor das linhas horizontais de fundo
          drawBorder: false
        }
      }
    }
  };

  // 4. DADOS DO GRÁFICO (DATA)
  // Por enquanto está fixo (Hardcoded). No futuro, pode vir via "props".
  const data = {
    labels: ['Jan', 'Fev', 'Mar'], // O que aparece embaixo das barras
    datasets: [
      {
        label: 'Turnover', // Nome da série
        data: [12, 19, 3], // Os valores das barras
        backgroundColor: '#f59e0b', // Cor Âmbar (Laranja/Amarelo forte) - Bom contraste em ambos os temas
        hoverBackgroundColor: '#d97706', // Cor ao passar o mouse (mais escuro)
        borderRadius: 6, // Arredonda a ponta da barra (visual moderno)
        maxBarThickness: 42, // Largura máxima para não ficar gigante em telas grandes
        barPercentage: 0.45, // Espessura relativa da barra
        categoryPercentage: 0.6
      }
    ]
  };

  // 5. RENDERIZAÇÃO
  // Envolvemos o gráfico numa div com altura fixa (260px) para ele não "sumir" ou "estourar"
  return (
    <div style={{ height: '260px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default GraficoTurnover;