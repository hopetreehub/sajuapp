import React from 'react';
import { InterpretationResponse } from '@/services/api';

interface InterpretationSummaryCardProps {
  interpretation: InterpretationResponse | null
  loading?: boolean
  className?: string
}

const InterpretationSummaryCard: React.FC<InterpretationSummaryCardProps> = ({
  interpretation,
  loading = false,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!interpretation) {
    return null;
  }

  // 주요 정보 추출
  const getKeyInsights = () => {
    const insights = [];
    
    // 일간 정보
    if (interpretation.basic?.dayMaster) {
      insights.push({
        icon: '☀️',
        label: '일간',
        value: interpretation.basic.dayMaster,
        color: 'blue',
      });
    }
    
    // 용신
    if (interpretation.basic?.yongshin) {
      insights.push({
        icon: '⭐',
        label: '용신',
        value: interpretation.basic.yongshin,
        color: 'purple',
      });
    }
    
    // 격국
    if (interpretation.basic?.gyeokguk) {
      insights.push({
        icon: '🎯',
        label: '격국',
        value: interpretation.basic.gyeokguk,
        color: 'green',
      });
    }
    
    // 주요 성격 특성
    if (interpretation.personality?.dominantTraits) {
      const traits = Object.entries(interpretation.personality.dominantTraits)
        .filter(([_, value]) => (value as number) > 70)
        .map(([key]) => key)
        .slice(0, 2)
        .join(', ');
      
      if (traits) {
        insights.push({
          icon: '🧠',
          label: '주요 특성',
          value: traits,
          color: 'indigo',
        });
      }
    }
    
    // 행운의 요소
    if (interpretation.fortune?.luckyElements && interpretation.fortune.luckyElements.length > 0) {
      insights.push({
        icon: '🍀',
        label: '행운 요소',
        value: interpretation.fortune.luckyElements[0],
        color: 'yellow',
      });
    }
    
    // 적합 직업
    if (interpretation.career?.suitableCareers && interpretation.career.suitableCareers.length > 0) {
      insights.push({
        icon: '💼',
        label: '적합 직업',
        value: interpretation.career.suitableCareers[0],
        color: 'cyan',
      });
    }
    
    return insights;
  };

  const insights = getKeyInsights();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          📋 사주 해석 요약
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          5대 고전 통합 분석
        </div>
      </div>

      {/* 기본 요약 */}
      {interpretation.basic?.summary && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {interpretation.basic.summary}
          </p>
        </div>
      )}

      {/* 핵심 정보 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`p-3 bg-${insight.color}-50 dark:bg-${insight.color}-900/20 rounded-lg`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xl">{insight.icon}</span>
              <span className={`text-xs font-medium text-${insight.color}-800 dark:text-${insight.color}-200`}>
                {insight.label}
              </span>
            </div>
            <div className={`text-sm font-semibold text-${insight.color}-700 dark:text-${insight.color}-300`}>
              {insight.value}
            </div>
          </div>
        ))}
      </div>

      {/* 추천 사항 */}
      {interpretation.personality?.recommendations && interpretation.personality.recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            💡 주요 추천사항
          </h4>
          <ul className="space-y-1">
            {interpretation.personality.recommendations.slice(0, 3).map((rec, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                <span className="mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 조후 정보 */}
      {interpretation.johoo && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span>🌡️</span>
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              조후 상태: {interpretation.johoo.season}
            </span>
          </div>
          {interpretation.johoo.seasonalCharacteristics && interpretation.johoo.seasonalCharacteristics.length > 0 && (
            <p className="text-xs text-orange-700 dark:text-orange-300">
              {interpretation.johoo.seasonalCharacteristics[0]}
            </p>
          )}
        </div>
      )}

      {/* 신살 정보 */}
      {interpretation.spiritual && (
        <div className="mt-4 flex space-x-4">
          {interpretation.spiritual.beneficialSpirits && interpretation.spiritual.beneficialSpirits.length > 0 && (
            <div className="flex-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xs font-medium text-green-800 dark:text-green-200 mb-1">
                🌟 길신
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">
                {interpretation.spiritual.beneficialSpirits.slice(0, 2).join(', ')}
              </div>
            </div>
          )}
          {interpretation.spiritual.harmfulSpirits && interpretation.spiritual.harmfulSpirits.length > 0 && (
            <div className="flex-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">
                ⚠️ 흉신
              </div>
              <div className="text-xs text-red-700 dark:text-red-300">
                {interpretation.spiritual.harmfulSpirits.slice(0, 2).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterpretationSummaryCard;