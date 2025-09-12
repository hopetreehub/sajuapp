import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useTheme } from '@/contexts/ThemeContext';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

interface ChartData {
  relationship: any;
  practical: any;
  depth: any;
  special: any;
}

interface EnhancedCompatibilityChartProps {
  data: ChartData;
}

export const EnhancedCompatibilityChart: React.FC<EnhancedCompatibilityChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 모든 20개 항목 데이터 수집
  const allLabels: string[] = [];
  const allScores: number[] = [];

  // 관계성 분석 (7개)
  const relationshipItems = [
    { key: 'firstImpression', label: '첫인상' },
    { key: 'communication', label: '대화소통' },
    { key: 'valueSystem', label: '가치관' },
    { key: 'lifePattern', label: '생활패턴' },
    { key: 'conflictResolution', label: '갈등해결' },
    { key: 'emotional', label: '정서적' },
    { key: 'trust', label: '신뢰도' },
  ];

  // 현실적 분석 (5개)
  const practicalItems = [
    { key: 'economic', label: '경제관념' },
    { key: 'career', label: '직업운' },
    { key: 'residence', label: '주거환경' },
    { key: 'children', label: '자녀운' },
    { key: 'inLaw', label: '시댁/처가' },
  ];

  // 심층 분석 (4개)
  const depthItems = [
    { key: 'sexual', label: '성적' },
    { key: 'spiritual', label: '정신적' },
    { key: 'hobby', label: '취미' },
    { key: 'retirement', label: '노후' },
  ];

  // 특수 분석 (4개)
  const specialItems = [
    { key: 'noblePerson', label: '귀인운' },
    { key: 'peachBlossom', label: '도화운' },
    { key: 'emptiness', label: '공망' },
    { key: 'sinsal', label: '신살' },
  ];

  // 데이터 수집
  if (data.relationship) {
    relationshipItems.forEach(item => {
      const score = data.relationship[item.key];
      if (score && typeof score.score === 'number') {
        allLabels.push(item.label);
        allScores.push(score.score);
      }
    });
  }

  if (data.practical) {
    practicalItems.forEach(item => {
      const score = data.practical[item.key];
      if (score && typeof score.score === 'number') {
        allLabels.push(item.label);
        allScores.push(score.score);
      }
    });
  }

  if (data.depth) {
    depthItems.forEach(item => {
      const score = data.depth[item.key];
      if (score && typeof score.score === 'number') {
        allLabels.push(item.label);
        allScores.push(score.score);
      }
    });
  }

  if (data.special) {
    specialItems.forEach(item => {
      const score = data.special[item.key];
      if (score && typeof score.score === 'number') {
        allLabels.push(item.label);
        allScores.push(score.score);
      }
    });
  }

  const chartData = {
    labels: allLabels,
    datasets: [
      {
        label: '종합 궁합 점수',
        data: allScores,
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
    ],
  };

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          color: isDark ? '#9CA3AF' : '#4B5563',
          backdropColor: 'transparent',
          font: {
            size: 10,
          },
        },
        grid: {
          color: isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(107, 114, 128, 0.2)',
          circular: true,
        },
        angleLines: {
          color: isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(107, 114, 128, 0.2)',
        },
        pointLabels: {
          color: isDark ? '#D1D5DB' : '#374151',
          font: {
            size: 11,
            weight: 500,
          },
          padding: 15,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: isDark ? '#D1D5DB' : '#374151',
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#F3F4F6' : '#111827',
        bodyColor: isDark ? '#D1D5DB' : '#4B5563',
        borderColor: isDark ? '#4B5563' : '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const score = context.parsed.r;
            let level = '매우좋음';
            if (score < 30) level = '위험';
            else if (score < 50) level = '주의';
            else if (score < 70) level = '보통';
            else if (score < 85) level = '좋음';
            
            return `${context.label}: ${score}점 (${level})`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'point',
    },
  };

  return (
    <div className="w-full h-[600px] p-4">
      <Radar data={chartData} options={options} />
    </div>
  );
};