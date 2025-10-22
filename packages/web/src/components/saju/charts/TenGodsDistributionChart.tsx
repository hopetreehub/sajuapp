import React, { useMemo, useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { TenGodsAnalyzer } from '@/utils/tenGodsAnalyzer';
import { TEN_GODS_INFO } from '@/types/tenGods';
import { SajuData } from '@/types/saju';
import InterpretationPanel from '@/components/charts/InterpretationPanel';
import { InterpretationResponse, interpretationService } from '@/services/api';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface TenGodsDistributionChartProps {
  sajuData: SajuData
  height?: number
  className?: string
  chartType?: 'bar' | 'doughnut'
  showCategory?: boolean
}

export const TenGodsDistributionChart: React.FC<TenGodsDistributionChartProps> = ({
  sajuData,
  height = 400,
  className = '',
  chartType = 'bar',
  showCategory: _showCategory = false,
}) => {
  const [viewMode, setViewMode] = useState<'individual' | 'category'>('individual');
  
  // 해석 데이터 상태
  const [interpretation, setInterpretation] = useState<InterpretationResponse | null>(null);
  const [interpretationLoading, setInterpretationLoading] = useState(false);
  const [interpretationError, setInterpretationError] = useState<string | null>(null);

  // 십성 데이터 분석
  const analysis = useMemo(() => {
    return TenGodsAnalyzer.performFullAnalysis(sajuData);
  }, [sajuData]);

  // 해석 데이터 로드
  useEffect(() => {
    const loadInterpretation = async () => {
      if (!sajuData) return;
      
      setInterpretationLoading(true);
      setInterpretationError(null);
      
      try {
        const response = await interpretationService.getPersonalityAnalysis(sajuData);
        setInterpretation({ personality: response });
      } catch (error) {
        console.error('성격 분석 데이터 로드 실패:', error);
        setInterpretationError('성격 분석 데이터를 불러올 수 없습니다.');
      } finally {
        setInterpretationLoading(false);
      }
    };

    loadInterpretation();
  }, [sajuData]);

  // 개별 십성 차트 데이터
  const individualChartData = useMemo(() => {
    return TenGodsAnalyzer.generateChartData(analysis.data);
  }, [analysis.data]);

  // 카테고리별 차트 데이터
  const categoryChartData = useMemo(() => {
    return TenGodsAnalyzer.generateCategoryChartData(analysis.data);
  }, [analysis.data]);

  // 바 차트 옵션
  const barOptions: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        titleFont: {
          family: 'Noto Sans KR, sans-serif',
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: 'Noto Sans KR, sans-serif',
          size: 12,
        },
        callbacks: {
          title(context) {
            return context[0].label || '';
          },
          label(context) {
            const value = context.parsed.x as number;
            const percentage = analysis.total > 0 ? 
              ((value / analysis.total) * 100).toFixed(1) : '0.0';
            
            // 십성 정보 추가
            const tenGodKey = Object.keys(analysis.data)[context.dataIndex];
            const info = TEN_GODS_INFO[tenGodKey as keyof typeof TEN_GODS_INFO];
            
            return [
              `점수: ${value}점 (${percentage}%)`,
              `특성: ${info.keywords.join(', ')}`,
              `장점: ${info.positiveTraits.join(', ')}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            family: 'Noto Sans KR, sans-serif',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Noto Sans KR, sans-serif',
            size: 11,
          },
          callback(value) {
            const label = this.getLabelForValue(value as number);
            return label.split('\n')[0]; // 첫 번째 줄만 표시
          },
        },
      },
    },
    animation: {
      duration: 1000,
    },
  }), [analysis.data, analysis.total]);

  // 도넛 차트 옵션
  const doughnutOptions: ChartOptions<'doughnut'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            family: 'Noto Sans KR, sans-serif',
            size: 11,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            if (datasets.length > 0) {
              const dataset = datasets[0];
              return chart.data.labels?.filter((label, index) => {
                const value = dataset.data[index] as number;
                return value > 0;
              }).map((label, originalIndex) => {
                const value = dataset.data[originalIndex] as number;
                const percentage = analysis.total > 0 ?
                  ((value / analysis.total) * 100).toFixed(1) : '0.0';

                const bgColor = Array.isArray(dataset.backgroundColor)
                  ? dataset.backgroundColor[originalIndex] as string
                  : dataset.backgroundColor as string;
                const borderColor = Array.isArray(dataset.borderColor)
                  ? dataset.borderColor[originalIndex] as string
                  : dataset.borderColor as string;

                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: bgColor || '#000',
                  strokeStyle: borderColor || '#000',
                  lineWidth: 2,
                  hidden: false,
                  index: originalIndex,
                };
              }) || [];
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label(context) {
            const value = context.parsed as number;
            const percentage = analysis.total > 0 ? 
              ((value / analysis.total) * 100).toFixed(1) : '0.0';
            return `${context.label}: ${value}점 (${percentage}%)`;
          },
        },
      },
    },
    cutout: '40%',
    animation: {
      animateRotate: true,
      duration: 1000,
    },
  }), [analysis.total]);

  // 균형 상태 평가
  const getBalanceStatus = () => {
    const score = analysis.balance.score;
    if (score >= 80) return { status: '매우 균형', color: 'text-green-600', icon: '🟢' };
    if (score >= 60) return { status: '균형 양호', color: 'text-blue-600', icon: '🔵' };
    if (score >= 40) return { status: '보통', color: 'text-yellow-600', icon: '🟡' };
    return { status: '불균형', color: 'text-red-600', icon: '🔴' };
  };

  const balanceStatus = getBalanceStatus();

  // 데이터가 없는 경우
  if (analysis.total === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-lg font-medium">십성 데이터가 없습니다</div>
          <div className="text-sm">사주 정보를 확인해주세요</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            ⭐ 십성 분포도
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            10가지 십성의 강도와 성격 특성 분석
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* 보기 모드 전환 */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('individual')}
              className={`px-3 py-1 text-xs transition-colors ${
                viewMode === 'individual'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              개별십성
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`px-3 py-1 text-xs transition-colors ${
                viewMode === 'category'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              카테고리
            </button>
          </div>
          
          {/* 균형 상태 */}
          <div className="text-right">
            <div className={`text-sm font-medium ${balanceStatus.color} flex items-center`}>
              <span className="mr-1">{balanceStatus.icon}</span>
              {balanceStatus.status}
            </div>
            <div className="text-xs text-gray-500">
              균형점수: {analysis.balance.score.toFixed(0)}점
            </div>
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="mb-6" style={{ height: height - 200 }}>
        {viewMode === 'individual' ? (
          chartType === 'bar' ? (
            <Bar data={individualChartData} options={barOptions} />
          ) : (
            <Doughnut data={individualChartData} options={doughnutOptions} />
          )
        ) : (
          <Doughnut data={categoryChartData} options={doughnutOptions} />
        )}
      </div>

      {/* 성격 프로필 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* 성격 특성 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            🧠 성격 특성
          </div>
          <div className="text-blue-700 dark:text-blue-300 text-sm">
            {analysis.personality.overall}
          </div>
        </div>

        {/* 강한 십성 */}
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="font-medium text-green-800 dark:text-green-200 mb-2">
            💪 강한 십성
          </div>
          {analysis.dominant.length > 0 ? (
            <div className="text-green-700 dark:text-green-300 text-sm">
              {analysis.dominant.map(tenGod => 
                TEN_GODS_INFO[tenGod].koreanName,
              ).join(', ')}
            </div>
          ) : (
            <div className="text-green-600 dark:text-green-400 text-sm">
              균형적 분포
            </div>
          )}
        </div>

        {/* 추천 분야 */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="font-medium text-purple-800 dark:text-purple-200 mb-2">
            🎯 추천 분야
          </div>
          {analysis.recommendations.career.length > 0 ? (
            <div className="text-purple-700 dark:text-purple-300 text-sm">
              {analysis.recommendations.career[0].field}
            </div>
          ) : (
            <div className="text-purple-600 dark:text-purple-400 text-sm">
              다양한 분야 적합
            </div>
          )}
        </div>
      </div>

      {/* 능력치 바 */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          핵심 능력치
        </div>
        {Object.entries({
          '리더십': analysis.personality.leadership,
          '창의성': analysis.personality.creativity,
          '안정성': analysis.personality.stability,
          '사교성': analysis.personality.sociability,
          '독립성': analysis.personality.independence,
        }).map(([name, value]) => (
          <div key={name} className="flex items-center space-x-3">
            <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
              {name}
            </div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                style={{ width: `${value}%` }}
              />
            </div>
            <div className="w-8 text-xs text-gray-500 text-right">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* 해석 패널 추가 */}
      <div className="mt-6">
        <InterpretationPanel
          interpretation={interpretation}
          loading={interpretationLoading}
          error={interpretationError}
          category="personality"
        />
      </div>
    </div>
  );
};

export default TenGodsDistributionChart;