import React, { useState } from 'react';
import { RelationshipAnalysis } from '@/utils/detailedCompatibilityCalculator';
import { PracticalAnalysis } from '@/utils/practicalCompatibilityCalculator';
import { DepthAnalysis, SpecialAnalysis } from '@/utils/depthSpecialCompatibilityCalculator';

interface DetailedAnalysisTabsProps {
  relationshipAnalysis: RelationshipAnalysis | null;
  practicalAnalysis: PracticalAnalysis | null;
  depthAnalysis: DepthAnalysis | null;
  specialAnalysis: SpecialAnalysis | null;
}

export const DetailedAnalysisTabs: React.FC<DetailedAnalysisTabsProps> = ({ 
  relationshipAnalysis,
  practicalAnalysis,
  depthAnalysis,
  specialAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'relationship' | 'practical' | 'depth' | 'special'>('overview');

  if (!relationshipAnalysis || !practicalAnalysis || !depthAnalysis || !specialAnalysis) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        궁합 분석 결과가 없습니다. 먼저 두 사람을 선택하고 분석하기를 클릭해주세요.
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 30) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      '매우좋음': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      '좋음': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      '보통': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      '주의': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      '위험': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level as keyof typeof colors]}`}>
        {level}
      </span>
    );
  };

  const relationshipItems = [
    { key: 'firstImpression', label: '첫인상 궁합', icon: '👋' },
    { key: 'communication', label: '대화소통 궁합', icon: '💬' },
    { key: 'valueSystem', label: '가치관 궁합', icon: '💎' },
    { key: 'lifePattern', label: '생활패턴 궁합', icon: '🌅' },
    { key: 'conflictResolution', label: '갈등해결 궁합', icon: '🤝' },
    { key: 'emotional', label: '정서적 궁합', icon: '❤️' },
    { key: 'trust', label: '신뢰도 궁합', icon: '🛡️' },
  ];
  
  const practicalItems = [
    { key: 'economic', label: '경제관념 궁합', icon: '💰' },
    { key: 'career', label: '직업운 궁합', icon: '💼' },
    { key: 'residence', label: '주거환경 궁합', icon: '🏠' },
    { key: 'children', label: '자녀운 궁합', icon: '👶' },
    { key: 'inLaw', label: '시댁/처가 궁합', icon: '👨‍👩‍👧‍👦' },
  ];
  
  const depthItems = [
    { key: 'sexual', label: '성적 궁합', icon: '🔥' },
    { key: 'spiritual', label: '정신적 궁합', icon: '🧘' },
    { key: 'hobby', label: '취미 궁합', icon: '🎯' },
    { key: 'retirement', label: '노후 궁합', icon: '🌅' },
  ];
  
  const specialItems = [
    { key: 'noblePerson', label: '귀인운 궁합', icon: '⭐' },
    { key: 'peachBlossom', label: '도화운 궁합', icon: '🌸' },
    { key: 'emptiness', label: '공망 궁합', icon: '🌀' },
    { key: 'sinsal', label: '신살 궁합', icon: '🔮' },
  ];

  return (
    <div className="mt-8">
      {/* 탭 헤더 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            종합 분석
          </button>
          <button
            onClick={() => setActiveTab('relationship')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'relationship'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            관계성 분석 (7개 항목)
          </button>
          <button
            onClick={() => setActiveTab('practical')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'practical'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            현실적 분석 (5개 항목)
          </button>
          <button
            onClick={() => setActiveTab('depth')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'depth'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            심층 분석 (4개 항목)
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'special'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            특수 분석 (4개 항목)
          </button>
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 종합 점수 카드들 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  관계성 종합 분석
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-4xl font-bold ${getScoreColor(relationshipAnalysis.averageScore)}`}>
                      {relationshipAnalysis.averageScore}점
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {relationshipAnalysis.summary}
                    </p>
                  </div>
                  <div className="text-5xl opacity-20">
                    💕
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  현실적 종합 분석
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-4xl font-bold ${getScoreColor(practicalAnalysis.averageScore)}`}>
                      {practicalAnalysis.averageScore}점
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {practicalAnalysis.summary}
                    </p>
                  </div>
                  <div className="text-5xl opacity-20">
                    💍
                  </div>
                </div>
              </div>
            </div>
            
            {/* 심층/특수 종합 점수 카드들 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  심층 종합 분석
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-4xl font-bold ${getScoreColor(depthAnalysis.averageScore)}`}>
                      {depthAnalysis.averageScore}점
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {depthAnalysis.summary}
                    </p>
                  </div>
                  <div className="text-5xl opacity-20">
                    🌊
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  특수 종합 분석
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-4xl font-bold ${getScoreColor(specialAnalysis.averageScore)}`}>
                      {specialAnalysis.averageScore}점
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {specialAnalysis.summary}
                    </p>
                  </div>
                  <div className="text-5xl opacity-20">
                    ✨
                  </div>
                </div>
              </div>
            </div>

            {/* 모든 항목 간략 점수 */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">관계성 분석</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {relationshipItems.map(item => {
                  const score = relationshipAnalysis[item.key as keyof RelationshipAnalysis] as any;
                  if (!score || typeof score.score !== 'number') return null;
                  
                  return (
                    <div key={item.key} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{item.icon}</span>
                        {getLevelBadge(score.level)}
                      </div>
                      <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {item.label}
                      </h4>
                      <div className={`text-xl font-bold mt-1 ${getScoreColor(score.score)}`}>
                        {score.score}점
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-6">현실적 분석</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {practicalItems.map(item => {
                  const score = practicalAnalysis[item.key as keyof PracticalAnalysis] as any;
                  if (!score || typeof score.score !== 'number') return null;
                  
                  return (
                    <div key={item.key} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{item.icon}</span>
                        {getLevelBadge(score.level)}
                      </div>
                      <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {item.label}
                      </h4>
                      <div className={`text-xl font-bold mt-1 ${getScoreColor(score.score)}`}>
                        {score.score}점
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-6">심층 분석</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {depthItems.map(item => {
                  const score = depthAnalysis[item.key as keyof DepthAnalysis] as any;
                  if (!score || typeof score.score !== 'number') return null;
                  
                  return (
                    <div key={item.key} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{item.icon}</span>
                        {getLevelBadge(score.level)}
                      </div>
                      <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {item.label}
                      </h4>
                      <div className={`text-xl font-bold mt-1 ${getScoreColor(score.score)}`}>
                        {score.score}점
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-6">특수 분석</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {specialItems.map(item => {
                  const score = specialAnalysis[item.key as keyof SpecialAnalysis] as any;
                  if (!score || typeof score.score !== 'number') return null;
                  
                  return (
                    <div key={item.key} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{item.icon}</span>
                        {getLevelBadge(score.level)}
                      </div>
                      <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {item.label}
                      </h4>
                      <div className={`text-xl font-bold mt-1 ${getScoreColor(score.score)}`}>
                        {score.score}점
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'relationship' && (
          <div className="space-y-6">
            {relationshipItems.map(item => {
              const analysis = relationshipAnalysis[item.key as keyof RelationshipAnalysis] as any;
              if (!analysis || typeof analysis.score !== 'number') return null;

              return (
                <div key={item.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{item.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {item.label}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getLevelBadge(analysis.level)}
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                          {analysis.score}점
                        </span>
                      </div>
                    </div>

                    {/* 설명 */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {analysis.description}
                    </p>

                    {/* 점수 바 */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          analysis.score >= 85 ? 'bg-green-500' :
                          analysis.score >= 70 ? 'bg-blue-500' :
                          analysis.score >= 50 ? 'bg-yellow-500' :
                          analysis.score >= 30 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${analysis.score}%` }}
                      />
                    </div>

                    {/* 긍정/부정 요인 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {analysis.factors.positive.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                            ✅ 긍정 요인
                          </h4>
                          <ul className="space-y-1">
                            {analysis.factors.positive.map((factor: string, idx: number) => (
                              <li key={idx} className="text-sm text-green-700 dark:text-green-300">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.factors.negative.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                            ⚠️ 주의 요인
                          </h4>
                          <ul className="space-y-1">
                            {analysis.factors.negative.map((factor: string, idx: number) => (
                              <li key={idx} className="text-sm text-red-700 dark:text-red-300">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {activeTab === 'practical' && (
          <div className="space-y-6">
            {practicalItems.map(item => {
              const analysis = practicalAnalysis[item.key as keyof PracticalAnalysis] as any;
              if (!analysis || typeof analysis.score !== 'number') return null;

              return (
                <div key={item.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{item.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {item.label}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getLevelBadge(analysis.level)}
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                          {analysis.score}점
                        </span>
                      </div>
                    </div>

                    {/* 설명 */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {analysis.description}
                    </p>

                    {/* 점수 바 */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          analysis.score >= 85 ? 'bg-green-500' :
                          analysis.score >= 70 ? 'bg-blue-500' :
                          analysis.score >= 50 ? 'bg-yellow-500' :
                          analysis.score >= 30 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${analysis.score}%` }}
                      />
                    </div>

                    {/* 긍정/부정 요인 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {analysis.factors.positive.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                            ✅ 긍정 요인
                          </h4>
                          <ul className="space-y-1">
                            {analysis.factors.positive.map((factor: string, idx: number) => (
                              <li key={idx} className="text-sm text-green-700 dark:text-green-300">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.factors.negative.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                            ⚠️ 주의 요인
                          </h4>
                          <ul className="space-y-1">
                            {analysis.factors.negative.map((factor: string, idx: number) => (
                              <li key={idx} className="text-sm text-red-700 dark:text-red-300">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {activeTab === 'depth' && (
          <div className="space-y-6">
            {depthItems.map(item => {
              const analysis = depthAnalysis[item.key as keyof DepthAnalysis] as any;
              if (!analysis || typeof analysis.score !== 'number') return null;

              return (
                <div key={item.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{item.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {item.label}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getLevelBadge(analysis.level)}
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                          {analysis.score}점
                        </span>
                      </div>
                    </div>

                    {/* 설명 */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {analysis.description}
                    </p>

                    {/* 점수 바 */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          analysis.score >= 85 ? 'bg-green-500' :
                          analysis.score >= 70 ? 'bg-blue-500' :
                          analysis.score >= 50 ? 'bg-yellow-500' :
                          analysis.score >= 30 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${analysis.score}%` }}
                      />
                    </div>

                    {/* 긍정/부정 요인 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {analysis.factors.positive.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                            ✅ 긍정 요인
                          </h4>
                          <ul className="space-y-1">
                            {analysis.factors.positive.map((factor: string, idx: number) => (
                              <li key={idx} className="text-sm text-green-700 dark:text-green-300">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.factors.negative.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                            ⚠️ 주의 요인
                          </h4>
                          <ul className="space-y-1">
                            {analysis.factors.negative.map((factor: string, idx: number) => (
                              <li key={idx} className="text-sm text-red-700 dark:text-red-300">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {activeTab === 'special' && (
          <div className="space-y-6">
            {specialItems.map(item => {
              const analysis = specialAnalysis[item.key as keyof SpecialAnalysis] as any;
              if (!analysis || typeof analysis.score !== 'number') return null;

              return (
                <div key={item.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{item.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {item.label}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getLevelBadge(analysis.level)}
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                          {analysis.score}점
                        </span>
                      </div>
                    </div>

                    {/* 설명 */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {analysis.description}
                    </p>

                    {/* 점수 바 */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          analysis.score >= 85 ? 'bg-green-500' :
                          analysis.score >= 70 ? 'bg-blue-500' :
                          analysis.score >= 50 ? 'bg-yellow-500' :
                          analysis.score >= 30 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${analysis.score}%` }}
                      />
                    </div>

                    {/* 긍정/부정 요인 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {analysis.factors.positive.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                            ✅ 긍정 요인
                          </h4>
                          <ul className="space-y-1">
                            {analysis.factors.positive.map((factor: string, idx: number) => (
                              <li key={idx} className="text-sm text-green-700 dark:text-green-300">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.factors.negative.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                            ⚠️ 주의 요인
                          </h4>
                          <ul className="space-y-1">
                            {analysis.factors.negative.map((factor: string, idx: number) => (
                              <li key={idx} className="text-sm text-red-700 dark:text-red-300">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};