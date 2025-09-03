import React, { useEffect, useRef, useContext } from 'react';
import Chart from 'chart.js/auto';
import { ThemeContext } from '@/contexts/ThemeContext';

interface CompatibilityRadarChartProps {
  data: {
    categories: {
      name: string;
      score: number;
    }[];
    person1Name: string;
    person2Name: string;
  };
}

export const CompatibilityRadarChart: React.FC<CompatibilityRadarChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!chartRef.current || !data) return;

    // 이전 차트 인스턴스 제거
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = data.categories.map(cat => cat.name);
    const scores = data.categories.map(cat => cat.score);

    // 이상적인 궁합 점수 (비교용)
    const idealScores = data.categories.map(() => 100);

    // 다크모드에 따른 색상 설정
    const textColor = isDark ? 'rgba(229, 231, 235, 1)' : 'rgba(31, 41, 55, 1)';
    const gridColor = isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(0, 0, 0, 0.1)';

    chartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: `${data.person1Name} ♥ ${data.person2Name}`,
            data: scores,
            backgroundColor: 'rgba(147, 51, 234, 0.2)',
            borderColor: 'rgba(147, 51, 234, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(147, 51, 234, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(147, 51, 234, 1)',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: '이상적 궁합',
            data: idealScores,
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
            pointHoverRadius: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 12,
              },
              padding: 20,
              usePointStyle: true,
              color: textColor,
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.r || context.parsed.y;
                return `${label}: ${Math.round(value)}점`;
              }
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              font: {
                size: 10,
              },
              color: textColor,
              callback: function(value) {
                return value + '점';
              }
            },
            pointLabels: {
              font: {
                size: 13,
                weight: 'bold',
              },
              color: textColor,
              callback: function(value, index) {
                const score = scores[index];
                return `${value}\n(${Math.round(score)}점)`;
              }
            },
            grid: {
              color: gridColor,
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, isDark, theme]);

  return (
    <div className="w-full h-[400px] p-4">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};