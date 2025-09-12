import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { CompatibilityAnalysisResult } from '@/types/compatibility';
import { ChartStyleUtils, TimeFrameData, DEFAULT_ENHANCED_OPTIONS } from '@/utils/chartStyleUtils';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

interface CompatibilityRadarChartProps {
  compatibilityResult: CompatibilityAnalysisResult;
  className?: string;
  height?: number;
}

const CompatibilityRadarChart: React.FC<CompatibilityRadarChartProps> = ({
  compatibilityResult,
  className = '',
  height = 400,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크모드 감지
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

  // 궁합 분석 결과를 레이더 차트 데이터로 변환
  const chartData = useMemo(() => {
    const { components } = compatibilityResult;
    
    // 카테고리별 라벨 정의
    const labels = [
      '일간궁합', '용신관계', '지지조화', '대운매칭', 
      '성격궁합', '나이균형', 'AI예측', '통계보정', '현대요소',
    ];

    // 각 시간대별 데이터 (궁합은 현재 기준이므로 동일한 데이터 사용)
    const timeFrameDatasets: TimeFrameData[] = [
      {
        label: '궁합 분석',
        values: [
          components.ilganCompatibility,
          components.yongsinRelation,
          components.jijiHarmony,
          components.daeunMatching,
          components.personalityFit,
          components.ageBalance,
          components.aiPrediction,
          components.statisticalAdjust,
          components.modernFactors,
        ],
        timeFrame: 'base',
      },
    ];

    // 차트 설정 생성
    return ChartStyleUtils.createCompatibilityRadarConfig(
      labels,
      timeFrameDatasets,
      {
        ...DEFAULT_ENHANCED_OPTIONS,
        maxPointStyle: {
          ...DEFAULT_ENHANCED_OPTIONS.maxPointStyle,
          backgroundColor: ChartStyleUtils.getGradeColor(compatibilityResult.grade),
          borderColor: ChartStyleUtils.getGradeColor(compatibilityResult.grade),
        },
      },
      isDarkMode,
    );
  }, [compatibilityResult, isDarkMode]);

  // 차트 옵션 커스터마이징
  const enhancedOptions = useMemo(() => {
    return {
      ...chartData.options,
      plugins: {
        ...chartData.options?.plugins,
        legend: {
          ...chartData.options?.plugins?.legend,
          display: false, // 궁합 차트는 단일 데이터셋이므로 범례 숨김
        },
        tooltip: {
          ...chartData.options?.plugins?.tooltip,
          callbacks: {
            title(context: any) {
              return `${context[0].label} 분석`;
            },
            label(context: any) {
              const maxScore = getMaxScoreForCategory(context.label);
              const percentage = Math.round((context.parsed.r / maxScore) * 100);
              return `점수: ${Math.round(context.parsed.r * 10) / 10}/${maxScore}점 (${percentage}%)`;
            },
            afterBody(context: any) {
              const category = context[0].label;
              return getCategoryDescription(category);
            },
          },
        },
      },
      scales: {
        ...chartData.options?.scales,
        r: {
          ...chartData.options?.scales?.r,
          max: getMaxValue(),
          ticks: {
            ...chartData.options?.scales?.r?.ticks,
            callback(value: any) {
              return `${value}점`;
            },
          },
        },
      },
    };
  }, [chartData, compatibilityResult]);

  // 카테고리별 최대 점수 반환
  function getMaxScoreForCategory(category: string): number {
    const maxScores: { [key: string]: number } = {
      '일간궁합': 20, '용신관계': 15, '지지조화': 15, '대운매칭': 12,
      '성격궁합': 10, '나이균형': 8, 'AI예측': 10, '통계보정': 5, '현대요소': 5,
    };
    return maxScores[category] || 10;
  }

  // 차트의 최대값 계산
  function getMaxValue(): number {
    return Math.max(...Object.values(compatibilityResult.components)) + 5;
  }

  // 카테고리별 설명 반환
  function getCategoryDescription(category: string): string {
    const descriptions: { [key: string]: string } = {
      '일간궁합': '태어난 일의 천간 상생상극 관계',
      '용신관계': '서로에게 필요한 오행 보완 정도',
      '지지조화': '띠의 삼합, 육합, 육충 관계',
      '대운매칭': '현재 인생 시기의 조화도',
      '성격궁합': '오행으로 본 성격 매칭도',
      '나이균형': '나이 차이의 적절성',
      'AI예측': 'AI 모델 기반 성공 예측',
      '통계보정': '통계 데이터 기반 보정',
      '현대요소': '현대 사회 요인 반영',
    };
    return descriptions[category] || '';
  }

  return (
    <div className={`compatibility-radar-chart ${className}`}>
      {/* 차트 제목과 총점 */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            궁합 분석 차트
          </h3>
          <div 
            className="px-4 py-2 rounded-full text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: ChartStyleUtils.getGradeColor(compatibilityResult.grade) }}
          >
            {compatibilityResult.totalScore}점 ({compatibilityResult.grade}등급)
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {compatibilityResult.gradeInfo.description}
        </p>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          💖 결혼 성공률: {Math.round(compatibilityResult.prediction.marriageSuccessRate)}% | 
          🤝 갈등 해결력: {getConflictResolutionText(compatibilityResult.prediction.conflictResolution)} |
          ⭐ 장기 만족도: {Math.round(compatibilityResult.prediction.longTermSatisfaction)}점
        </div>
      </div>

      {/* 레이더 차트 */}
      <div style={{ height: `${height}px` }} className="relative">
        <Radar data={chartData.data} options={enhancedOptions} />
      </div>

      {/* 핵심 통찰 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
          🔮 핵심 통찰
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {compatibilityResult.analysis.keyInsight}
        </p>
      </div>

      {/* 상세 분석 */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 강점 */}
        {compatibilityResult.analysis.strengths.length > 0 && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">
              ✅ 강점
            </h5>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              {compatibilityResult.analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 주의사항 */}
        {compatibilityResult.analysis.challenges.length > 0 && (
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h5 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
              ⚠️ 주의사항
            </h5>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              {compatibilityResult.analysis.challenges.map((challenge, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 조언 */}
      {compatibilityResult.analysis.advice.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            💡 전문가 조언
          </h5>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            {compatibilityResult.analysis.advice.map((advice, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{advice}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  function getConflictResolutionText(level: 'high' | 'medium' | 'low'): string {
    switch (level) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '보통';
    }
  }
};

export default CompatibilityRadarChart;