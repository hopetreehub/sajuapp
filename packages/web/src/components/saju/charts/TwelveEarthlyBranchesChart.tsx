import React, { useMemo, useState, useEffect } from 'react';
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
import { TwelveEarthlyBranchesAnalyzer } from '@/utils/twelveEarthlyBranchesAnalyzer';
import { EARTHLY_BRANCHES_INFO, RELATIONSHIP_TYPES } from '@/types/twelveEarthlyBranches';
import { SajuData } from '@/types/saju';
import InterpretationPanel from '@/components/charts/InterpretationPanel';
import { interpretationService, InterpretationResponse } from '@/services/api';
import { ChartStyleUtils, TimeFrameData } from '@/utils/chartStyleUtils';

// Chart.js 컴포넌트 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

interface TwelveEarthlyBranchesChartProps {
  sajuData: SajuData
  height?: number
  className?: string
  showRelationships?: boolean
  showSeasonalBalance?: boolean
}

export const TwelveEarthlyBranchesChart: React.FC<TwelveEarthlyBranchesChartProps> = ({
  sajuData,
  height = 400,
  className = '',
  showRelationships = true,
  showSeasonalBalance = true,
}) => {
  const [viewMode, setViewMode] = useState<'branches' | 'seasonal'>('branches');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크모드 실시간 감지
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);
  
  // 해석 데이터 상태
  const [interpretation, setInterpretation] = useState<InterpretationResponse | null>(null);
  const [interpretationLoading, setInterpretationLoading] = useState(false);
  const [interpretationError, setInterpretationError] = useState<string | null>(null);

  // 12간지 데이터 분석
  const analysis = useMemo(() => {
    return TwelveEarthlyBranchesAnalyzer.performFullAnalysis(sajuData);
  }, [sajuData]);

  // 해석 데이터 로드
  useEffect(() => {
    const loadInterpretation = async () => {
      if (!sajuData) return;
      
      setInterpretationLoading(true);
      setInterpretationError(null);
      
      try {
        const response = await interpretationService.getSpiritualAnalysis(sajuData);
        setInterpretation({ spiritual: response });
      } catch (error) {
        console.error('신살 분석 데이터 로드 실패:', error);
        setInterpretationError('신살 분석 데이터를 불러올 수 없습니다.');
      } finally {
        setInterpretationLoading(false);
      }
    };

    loadInterpretation();
  }, [sajuData]);

  // ChartStyleUtils용 TimeFrameData 생성 (12간지)
  const branchesTimeFrameData = useMemo((): TimeFrameData[] => {
    const data = Object.values(analysis.data);
    
    return [{
      label: '12간지 분포',
      values: data,
      timeFrame: 'base',
    }];
  }, [analysis.data]);
  
  // 12간지 통합 차트 설정 생성
  const branchesChartConfig = useMemo(() => {
    const labels = Object.keys(analysis.data).map(key => {
      const info = EARTHLY_BRANCHES_INFO[key as keyof typeof EARTHLY_BRANCHES_INFO];
      return `${info.koreanName} ${info.animalEmoji}`;
    });
    
    return ChartStyleUtils.createStandardRadarConfig(
      labels,
      branchesTimeFrameData,
      isDarkMode,
      true, // 최대값 강조
    );
  }, [branchesTimeFrameData, isDarkMode]);
  
  const branchesChartData = branchesChartConfig.data;

  // ChartStyleUtils용 TimeFrameData 생성 (계절별)
  const seasonalTimeFrameData = useMemo((): TimeFrameData[] => {
    const { seasonalBalance } = analysis;
    
    return [{
      label: '계절별 균형',
      values: [
        seasonalBalance.spring,
        seasonalBalance.summer,
        seasonalBalance.autumn,
        seasonalBalance.winter,
      ],
      timeFrame: 'base',
    }];
  }, [analysis.seasonalBalance]);
  
  // 계절별 통합 차트 설정 생성
  const seasonalChartConfig = useMemo(() => {
    const labels = ['봄 🌸', '여름 ☀️', '가을 🍂', '겨울 ❄️'];
    
    return ChartStyleUtils.createStandardRadarConfig(
      labels,
      seasonalTimeFrameData,
      isDarkMode,
      true, // 최대값 강조
    );
  }, [seasonalTimeFrameData, isDarkMode]);
  
  const seasonalChartData = seasonalChartConfig.data;

  // 향상된 차트 옵션 (ChartStyleUtils + 기존 옵션 결합)
  const chartOptions: ChartOptions<'radar'> = useMemo(() => {
    const baseOptions = viewMode === 'branches' ? branchesChartConfig.options : seasonalChartConfig.options;
    
    return {
      ...baseOptions,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...baseOptions?.plugins,
        legend: {
          ...baseOptions?.plugins?.legend,
          display: false,
        },
        tooltip: {
          ...baseOptions?.plugins?.tooltip,
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
            ...baseOptions?.plugins?.tooltip?.callbacks,
            label(context) {
              const value = context.parsed.r;
              const percentage = analysis.total > 0 ? 
                ((value / analysis.total) * 100).toFixed(1) : '0.0';
              
              if (viewMode === 'branches') {
                const branchKey = Object.keys(analysis.data)[context.dataIndex];
                const info = EARTHLY_BRANCHES_INFO[branchKey as keyof typeof EARTHLY_BRANCHES_INFO];
                
                return [
                  `${context.label}: ${value}점 (${percentage}%)`,
                  `원소: ${info.element}`,
                  `특성: ${info.characteristics.join(', ')}`,
                ];
              } else {
                return `${context.label}: ${value.toFixed(1)}점`;
              }
            },
          },
        },
      },
      scales: {
        ...baseOptions?.scales,
        r: {
          ...baseOptions?.scales?.r,
          beginAtZero: true,
          min: 0,
          max: viewMode === 'branches' ? Math.max(...Object.values(analysis.data)) * 1.2 : 100,
          ticks: {
            ...baseOptions?.scales?.r?.ticks,
            stepSize: viewMode === 'branches' ? 10 : 20,
            display: false, // 점수 표시 제거
            font: {
              family: 'Noto Sans KR, sans-serif',
              size: 10,
            },
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
          },
          grid: {
            ...baseOptions?.scales?.r?.grid,
            color: isDarkMode 
              ? 'rgba(156, 163, 175, 0.2)' 
              : 'rgba(156, 163, 175, 0.3)',
          },
          angleLines: {
            ...baseOptions?.scales?.r?.angleLines,
            color: isDarkMode
              ? 'rgba(156, 163, 175, 0.2)'
              : 'rgba(156, 163, 175, 0.3)',
          },
          pointLabels: {
            ...baseOptions?.scales?.r?.pointLabels,
            font: {
              family: 'Noto Sans KR, sans-serif',
              size: 11,
              weight: '500',
            },
            color: isDarkMode ? '#E5E7EB' : '#1F2937',
            padding: 10,
          },
        },
      },
      animation: {
        ...baseOptions?.animation,
        duration: 1000,
      },
    };
  }, [viewMode, branchesChartConfig, seasonalChartConfig, analysis.data, analysis.total, isDarkMode]);

  // 조화 상태 평가
  const getHarmonyStatus = () => {
    const score = analysis.overallHarmony;
    if (score >= 80) return { status: '매우 조화', color: 'text-green-600 dark:text-green-400', icon: '🟢' };
    if (score >= 60) return { status: '조화 양호', color: 'text-blue-600 dark:text-blue-400', icon: '🔵' };
    if (score >= 40) return { status: '보통', color: 'text-yellow-600 dark:text-yellow-400', icon: '🟡' };
    return { status: '부조화', color: 'text-red-600 dark:text-red-400', icon: '🔴' };
  };

  const harmonyStatus = getHarmonyStatus();

  // 데이터가 없는 경우
  if (analysis.total === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🐲</div>
          <div className="text-lg font-medium">12간지 데이터가 없습니다</div>
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
            🐲 12간지 상호작용
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            12지지의 분포와 상호 관계 분석
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* 보기 모드 전환 */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode('branches')}
              className={`px-3 py-1 text-xs transition-colors ${
                viewMode === 'branches'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              12간지
            </button>
            <button
              onClick={() => setViewMode('seasonal')}
              className={`px-3 py-1 text-xs transition-colors ${
                viewMode === 'seasonal'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              계절균형
            </button>
          </div>
          
          {/* 조화 상태 */}
          <div className="text-right">
            <div className={`text-sm font-medium ${harmonyStatus.color} flex items-center`}>
              <span className="mr-1">{harmonyStatus.icon}</span>
              {harmonyStatus.status}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              조화도: {analysis.overallHarmony.toFixed(0)}점
            </div>
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="mb-6" style={{ height: height - 250 }}>
        <Radar 
          data={viewMode === 'branches' ? branchesChartData : seasonalChartData} 
          options={chartOptions} 
        />
      </div>

      {/* 주요 특성 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* 주 동물 성격 */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="font-medium text-purple-800 dark:text-purple-200 mb-2">
            {analysis.animalPersonality.primaryAnimal}
          </div>
          <div className="text-purple-700 dark:text-purple-300 text-sm">
            {analysis.animalPersonality.traits.slice(0, 3).join(', ')}
          </div>
        </div>

        {/* 강한 간지 */}
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="font-medium text-green-800 dark:text-green-200 mb-2">
            💪 강한 간지
          </div>
          {analysis.dominant.length > 0 ? (
            <div className="text-green-700 dark:text-green-300 text-sm">
              {analysis.dominant.map(branch => {
                const info = EARTHLY_BRANCHES_INFO[branch];
                return `${info.koreanName}(${info.animal})`;
              }).join(', ')}
            </div>
          ) : (
            <div className="text-green-600 dark:text-green-400 text-sm">
              균형적 분포
            </div>
          )}
        </div>

        {/* 계절 균형 */}
        {showSeasonalBalance && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              🌈 계절 균형
            </div>
            <div className="text-blue-700 dark:text-blue-300 text-sm">
              균형도: {analysis.seasonalBalance.balance.toFixed(0)}점
            </div>
          </div>
        )}
      </div>

      {/* 관계 분석 */}
      {showRelationships && analysis.dominant.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            주요 관계 패턴
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analysis.interactions).slice(0, 3).map(([key, interaction]) => {
              const [branch1, branch2] = key.split('-');
              const relationshipInfo = RELATIONSHIP_TYPES[interaction.relationship.type];
              
              return (
                <div 
                  key={key}
                  className="px-2 py-1 text-xs rounded-full flex items-center space-x-1"
                  style={{ 
                    backgroundColor: `${relationshipInfo.color}20`,
                    color: relationshipInfo.color, 
                  }}
                >
                  <span>{relationshipInfo.icon}</span>
                  <span>
                    {EARTHLY_BRANCHES_INFO[branch1 as keyof typeof EARTHLY_BRANCHES_INFO].koreanName}-
                    {EARTHLY_BRANCHES_INFO[branch2 as keyof typeof EARTHLY_BRANCHES_INFO].koreanName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 해석 패널 추가 */}
      <div className="mt-6">
        <InterpretationPanel
          interpretation={interpretation}
          loading={interpretationLoading}
          error={interpretationError}
          category="spiritual"
        />
      </div>
    </div>
  );
};

export default TwelveEarthlyBranchesChart;