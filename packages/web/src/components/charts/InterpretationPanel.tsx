import React, { useState, useEffect } from 'react';
import { InterpretationResponse } from '../../services/api';

interface InterpretationPanelProps {
  interpretation: InterpretationResponse | null;
  loading?: boolean;
  error?: string | null;
  category?: 'basic' | 'personality' | 'fortune' | 'career' | 'relationship' | 'health' | 'spiritual' | 'johoo';
  showTabs?: boolean;
  fullHeight?: boolean;
}

const InterpretationPanel: React.FC<InterpretationPanelProps> = ({
  interpretation,
  loading = false,
  error = null,
  category = 'basic'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'basic' | 'personality' | 'fortune' | 'career' | 'relationship' | 'health'>(
    category === 'spiritual' || category === 'johoo' ? 'basic' : category
  );

  useEffect(() => {
    if (category === 'spiritual' || category === 'johoo') {
      setActiveTab('basic');
    } else {
      setActiveTab(category);
    }
  }, [category]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">해석 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <span className="mr-2">⚠️</span>
          <span>해석 데이터를 불러올 수 없습니다: {error}</span>
        </div>
      </div>
    );
  }

  if (!interpretation) {
    return null;
  }

  const tabs = [
    { id: 'basic', label: '기본 분석', icon: Info },
    { id: 'personality', label: '성격', icon: Sparkles },
    { id: 'fortune', label: '운세', icon: Sparkles },
    { id: 'career', label: '직업', icon: Briefcase },
    { id: 'relationship', label: '인연', icon: Users },
    { id: 'health', label: '건강', icon: Activity }
  ];

  const renderBasicAnalysis = () => {
    const basic = interpretation.basic;
    const johoo = interpretation.johoo;
    const spiritual = interpretation.spiritual;
    
    if (!basic) return <p className="text-gray-500">기본 분석 데이터가 없습니다.</p>;

    return (
      <div className="space-y-4">
        {/* 기본 정보 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">사주 기본 분석</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">일간:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{basic.dayMaster}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">강약:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {basic.dayMasterStrength === 'strong' ? '강함' : 
                 basic.dayMasterStrength === 'weak' ? '약함' : '중간'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">용신:</span>
              <span className="ml-2 font-medium text-indigo-600 dark:text-indigo-400">{basic.yongshin}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">격국:</span>
              <span className="ml-2 font-medium text-indigo-600 dark:text-indigo-400">{basic.gyeokguk}</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{basic.summary}</p>
        </div>

        {/* 조후 분석 */}
        {johoo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">조후 분석 (계절 조화)</h4>
            <div className="text-sm space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                출생 계절: <span className="font-medium">{johoo.season === 'spring' ? '봄' : 
                                                          johoo.season === 'summer' ? '여름' :
                                                          johoo.season === 'autumn' ? '가을' : '겨울'}</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {johoo.seasonalCharacteristics?.map((char, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs">
                    {char}
                  </span>
                ))}
              </div>
              {johoo.recommendations && johoo.recommendations.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">추천사항:</p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {johoo.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 신살 분석 */}
        {spiritual && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">신살 분석</h4>
            <div className="text-sm space-y-3">
              {spiritual.beneficialSpirits && spiritual.beneficialSpirits.length > 0 && (
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400 mb-1">길신 (吉神)</p>
                  <div className="flex flex-wrap gap-2">
                    {spiritual.beneficialSpirits.map((spirit, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                        ✨ {spirit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {spiritual.harmfulSpirits && spiritual.harmfulSpirits.length > 0 && (
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400 mb-1">흉신 (凶神)</p>
                  <div className="flex flex-wrap gap-2">
                    {spiritual.harmfulSpirits.map((spirit, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs">
                        ⚠️ {spirit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPersonalityAnalysis = () => {
    const personality = interpretation.personality;
    if (!personality) return <p className="text-gray-500">성격 분석 데이터가 없습니다.</p>;

    return (
      <div className="space-y-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">성격 특성</h4>
          
          {personality.strengths && personality.strengths.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">강점</p>
              <div className="flex flex-wrap gap-2">
                {personality.strengths.map((strength, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          )}

          {personality.weaknesses && personality.weaknesses.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-2">보완점</p>
              <div className="flex flex-wrap gap-2">
                {personality.weaknesses.map((weakness, idx) => (
                  <span key={idx} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs">
                    {weakness}
                  </span>
                ))}
              </div>
            </div>
          )}

          {personality.developmentAreas && personality.developmentAreas.length > 0 && (
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">발전 방향</p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {personality.developmentAreas.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFortuneAnalysis = () => {
    const fortune = interpretation.fortune;
    if (!fortune) return <p className="text-gray-500">운세 분석 데이터가 없습니다.</p>;

    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">올해 운세</h4>
          
          {fortune.luckyElements && fortune.luckyElements.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">행운 요소</p>
              <div className="flex flex-wrap gap-2">
                {fortune.luckyElements.map((element, idx) => (
                  <span key={idx} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
                    🍀 {element}
                  </span>
                ))}
              </div>
            </div>
          )}

          {fortune.cautionPeriods && fortune.cautionPeriods.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">주의 시기</p>
              <div className="flex flex-wrap gap-2">
                {fortune.cautionPeriods.map((period, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs">
                    ⚠️ {period}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCareerGuidance = () => {
    const career = interpretation.career;
    if (!career) return <p className="text-gray-500">직업 지도 데이터가 없습니다.</p>;

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">직업 적성</h4>
          
          {career.suitableCareers && career.suitableCareers.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">적합한 직업</p>
              <div className="flex flex-wrap gap-2">
                {career.suitableCareers.map((job, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                    {job}
                  </span>
                ))}
              </div>
            </div>
          )}

          {career.workEnvironment && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">추천 근무 환경</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{career.workEnvironment}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRelationshipAnalysis = () => {
    const relationship = interpretation.relationship;
    if (!relationship) return <p className="text-gray-500">관계 분석 데이터가 없습니다.</p>;

    return (
      <div className="space-y-4">
        <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">인간관계</h4>
          
          {relationship.relationshipPattern && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {relationship.relationshipPattern}
            </p>
          )}

          {relationship.advice && relationship.advice.length > 0 && (
            <div>
              <p className="text-sm font-medium text-pink-700 dark:text-pink-400 mb-2">관계 조언</p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {relationship.advice.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHealthGuidance = () => {
    const health = interpretation.health;
    if (!health) return <p className="text-gray-500">건강 지도 데이터가 없습니다.</p>;

    return (
      <div className="space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">건강 관리</h4>
          
          {health.vulnerabilities && health.vulnerabilities.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-2">주의할 건강 부위</p>
              <div className="flex flex-wrap gap-2">
                {health.vulnerabilities.map((vuln, idx) => (
                  <span key={idx} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs">
                    {vuln}
                  </span>
                ))}
              </div>
            </div>
          )}

          {health.lifestyle && health.lifestyle.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">추천 생활습관</p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {health.lifestyle.map((habit, idx) => (
                  <li key={idx}>{habit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicAnalysis();
      case 'personality':
        return renderPersonalityAnalysis();
      case 'fortune':
        return renderFortuneAnalysis();
      case 'career':
        return renderCareerGuidance();
      case 'relationship':
        return renderRelationshipAnalysis();
      case 'health':
        return renderHealthGuidance();
      default:
        return renderBasicAnalysis();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">✨</span>
            사주 해석 분석
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <span>{isExpanded ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* 탭 메뉴 */}
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 콘텐츠 */}
          <div className="p-6">
            {renderContent()}
          </div>
        </>
      )}
    </div>
  );
};

export default InterpretationPanel;