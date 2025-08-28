import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { SixAreaScores } from '@/types/saju';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface SixAreaChartProps {
  scores: SixAreaScores;
  birthDate?: string;
}

const SixAreaChart: React.FC<SixAreaChartProps> = ({ scores, birthDate }) => {
  // 다크모드 실시간 감지
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // 초기 다크모드 상태 확인
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // MutationObserver로 다크모드 변경 감지
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // 최고점 찾기 로직
  const scoreValues = [
    scores.foundation,
    scores.thinking,
    scores.relationship,
    scores.action,
    scores.luck,
    scores.environment
  ];
  const maxScore = Math.max(...scoreValues);
  const maxScoreIndexes = scoreValues.map((score, index) => score === maxScore ? index : -1).filter(index => index !== -1);
  
  const data = {
    labels: ['근본', '사고', '인연', '행동', '행운', '환경'],
    datasets: [
      {
        label: '사주 분석 점수',
        data: scoreValues,
        backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.4)' : 'rgba(102, 126, 234, 0.2)',
        borderColor: isDarkMode ? 'rgb(96, 165, 250)' : 'rgba(102, 126, 234, 1)',
        // 최고점은 금색으로, 일반점은 기본 색상으로
        pointBackgroundColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? '#fbbf24' : '#f59e0b'  // 금색 (최고점)
            : isDarkMode ? 'rgb(96, 165, 250)' : 'rgba(102, 126, 234, 1)'  // 기본 색상
        ),
        pointBorderColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? '#ffffff' : '#ffffff'  // 최고점 테두리
            : isDarkMode ? '#ffffff' : '#fff'     // 기본 테두리
        ),
        // 최고점은 더 큰 반지름으로
        pointRadius: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? 10 : 8   // 최고점 크기
            : isDarkMode ? 6 : 5    // 일반점 크기
        ),
        pointHoverRadius: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? 12 : 10  // 최고점 호버 크기
            : isDarkMode ? 8 : 7    // 일반점 호버 크기
        ),
        pointHoverBackgroundColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? '#fbbf24' : '#f59e0b'  // 최고점 호버 색상
            : isDarkMode ? '#ffffff' : '#fff'     // 일반점 호버 색상
        ),
        pointHoverBorderColor: scoreValues.map((_, index) => 
          maxScoreIndexes.includes(index) 
            ? isDarkMode ? '#ffffff' : '#ffffff'  // 최고점 호버 테두리
            : isDarkMode ? 'rgb(96, 165, 250)' : 'rgba(102, 126, 234, 1)'  // 일반점 호버 테두리
        ),
        borderWidth: isDarkMode ? 5 : 3
      }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.parsed.r}점`;
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: isDarkMode ? 'rgba(203, 213, 225, 0.6)' : 'rgba(0, 0, 0, 0.1)'
        },
        grid: {
          color: isDarkMode ? 'rgba(203, 213, 225, 0.5)' : 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: isDarkMode ? 16 : 15,
            weight: 'bold'
          },
          color: isDarkMode ? '#f8fafc' : '#2c3e50'
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 10,
          color: isDarkMode ? '#cbd5e1' : '#7f8c8d',
          backdropColor: 'transparent',
          font: {
            size: isDarkMode ? 12 : 11,
            weight: isDarkMode ? 'bold' : 'normal'
          }
        }
      }
    }
  };

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const averageScore = (totalScore / 6).toFixed(1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">
        사주 6대 영역 종합 분석
      </h2>
      
      {birthDate && (
        <div className="text-center text-gray-600 dark:text-gray-400 mb-6">
          <p className="text-sm">{birthDate}</p>
        </div>
      )}

      <div className="relative h-96 mb-6">
        <Radar data={data} options={options} />
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(scores).map(([key, value], index) => {
          const labels = ['근본', '사고', '인연', '행동', '행운', '환경'];
          const descriptions = [
            '태생적 기질과 잠재력',
            '사고방식과 창의력',
            '대인관계와 사회성',
            '실행력과 추진력',
            '운세와 기회 포착',
            '환경 적응과 변화'
          ];
          const emojis = ['🌱', '🧠', '❤️', '⚡', '🍀', '🌍'];
          
          return (
            <div
              key={key}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 text-center"
            >
              <div className="text-2xl mb-1">{emojis[index]}</div>
              <h3 className="text-sm font-semibold">{labels[index]}</h3>
              <div className="text-2xl font-bold my-2">{value}</div>
              <p className="text-xs opacity-90">{descriptions[index]}</p>
            </div>
          );
        })}
      </div>

      {/* Total Score */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold mb-3">종합 운명 지수</h3>
        <div className="text-4xl font-bold mb-2">{totalScore}/600</div>
        <div className="text-lg">
          평균 {averageScore}점 - 
          {Number(averageScore) >= 80 ? ' 매우 우수한 사주' :
           Number(averageScore) >= 60 ? ' 양호한 사주' :
           Number(averageScore) >= 40 ? ' 평범한 사주' : ' 노력이 필요한 사주'}
        </div>
      </div>
    </div>
  );
};

export default SixAreaChart;