import React, { useState, useEffect } from 'react';
import PersonalityAnalysisChart from '@/components/saju/charts/PersonalityAnalysisChart';
import ChartNavigation from '@/components/common/ChartNavigation';
import { PersonalityTraits } from '@/types/saju';
import { CHART_DESIGN_SYSTEM } from '@/constants/chartDesignSystem';

const PersonalityAnalysisPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [personalityTraits, setPersonalityTraits] = useState<PersonalityTraits | null>(null);
  const [personalInfo, setPersonalInfo] = useState<any>(null);

  useEffect(() => {
    // 개인정보 불러오기
    const loadPersonalInfo = () => {
      const saved = localStorage.getItem('sajuapp-personal-info');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPersonalInfo(parsed);
          // 개인정보가 있으면 성향 분석 생성
          generatePersonalityTraits(parsed);
        } catch (error) {
          console.error('Failed to parse personal info:', error);
          generateDefaultTraits();
        }
      } else {
        // 개인정보가 없어도 기본 성향으로 표시
        generateDefaultTraits();
      }
    };

    loadPersonalInfo();
  }, []);

  // 성향 분석 생성 (개인정보 기반)
  const generatePersonalityTraits = (info: any) => {
    setLoading(true);
    
    // 시뮬레이션: 실제로는 개인정보와 사주 정보 기반으로 계산
    setTimeout(() => {
      // 생년월일과 성별을 기반으로 성향 특성 반영
      const birthDate = new Date(info.birthDate);
      const year = birthDate.getFullYear();
      const month = birthDate.getMonth() + 1;
      const day = birthDate.getDate();
      const gender = info.gender;
      
      // 간단한 알고리즘으로 개인별 특성 반영
      const yearSeed = (year % 100) / 100;
      const monthSeed = month / 12;
      const daySeed = day / 31;
      const genderModifier = gender === 'female' ? 1.1 : 0.9;
      
      const traits: PersonalityTraits = {
        emotion: Math.floor(40 + (yearSeed * 30 + monthSeed * 20) * genderModifier),
        logic: Math.floor(45 + (daySeed * 25 + (1 - yearSeed) * 20) * (2 - genderModifier)),
        artistic: Math.floor(35 + (monthSeed * 35 + yearSeed * 15) * genderModifier),
        rational: Math.floor(50 + ((1 - monthSeed) * 25 + daySeed * 15) * (2 - genderModifier)),
        character: Math.floor(55 + (yearSeed + monthSeed + daySeed) * 15),
        intelligence: Math.floor(50 + ((1 - daySeed) * 20 + monthSeed * 20)),
        learning: Math.floor(45 + (yearSeed * 25 + (1 - monthSeed) * 20))
      };
      
      setPersonalityTraits(traits);
      setLoading(false);
    }, 1500);
  };

  // 기본 성향 분석 생성
  const generateDefaultTraits = () => {
    setLoading(true);
    
    setTimeout(() => {
      const traits: PersonalityTraits = {
        emotion: 62,      // 감성
        logic: 58,        // 논리성
        artistic: 55,     // 예술성
        rational: 65,     // 이성
        character: 72,    // 인성
        intelligence: 68, // 지성
        learning: 61      // 학습성
      };
      
      setPersonalityTraits(traits);
      setLoading(false);
    }, 1000);
  };

  const formatBirthDate = () => {
    if (!personalInfo) return null;
    
    const { birthDate, birthTime, calendarType } = personalInfo;
    if (!birthDate) return null;
    
    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}년 ${month}월 ${day}일 ${birthTime || '00:00'} (${calendarType === 'lunar' ? '음력' : '양력'})`;
  };

  // 성향별 설명
  const traitDescriptions = {
    emotion: '감정을 중시하고 타인의 마음을 잘 이해하는 정도를 나타냅니다.',
    logic: '논리적 사고와 체계적 분석을 통해 문제를 해결하는 능력을 나타냅니다.',
    artistic: '창의성과 예술적 감각, 아름다움을 추구하는 성향을 나타냅니다.',
    rational: '감정보다는 이성을 우선시하여 객관적으로 판단하는 성향을 나타냅니다.',
    character: '도덕성, 인격, 타인에 대한 배려심과 인간성을 나타냅니다.',
    intelligence: '지적 능력과 복잡한 개념을 이해하고 활용하는 능력을 나타냅니다.',
    learning: '새로운 지식과 기술을 습득하려는 의지와 학습 능력을 나타냅니다.'
  };

  return (
    <div className={CHART_DESIGN_SYSTEM.LAYOUT.pageContainer}>
      <div className={CHART_DESIGN_SYSTEM.LAYOUT.contentContainer}>
        {/* 페이지 헤더 - 통일된 디자인 */}
        <div className={CHART_DESIGN_SYSTEM.LAYOUT.header.container}>
          <h1 className={CHART_DESIGN_SYSTEM.LAYOUT.header.title}>
            🧠 7대 성향 분석
          </h1>
          <p className={CHART_DESIGN_SYSTEM.LAYOUT.header.subtitle}>
            당신의 개성과 성격 특성을 7가지 영역으로 분석합니다
          </p>
        </div>

        {/* 자동 네비게이션 */}
        <ChartNavigation showCenter={true} />

        {loading ? (
          <div className={CHART_DESIGN_SYSTEM.LOADING.container}>
            <div className={CHART_DESIGN_SYSTEM.LOADING.wrapper}>
              <div className={CHART_DESIGN_SYSTEM.LOADING.spinner}></div>
              <p className={CHART_DESIGN_SYSTEM.LOADING.text}>성향을 분석하고 있습니다...</p>
            </div>
          </div>
        ) : personalityTraits ? (
          <>
            {/* 성향 분석 차트 */}
            <div className="mb-8">
              <PersonalityAnalysisChart 
                traits={personalityTraits}
                birthDate={formatBirthDate() || undefined}
              />
            </div>

            {/* 성향별 상세 설명 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                📖 성향 영역별 설명
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(traitDescriptions).map(([key, description]) => (
                  <div key={key} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-200">
                        {key === 'emotion' && '💖 감성'}
                        {key === 'logic' && '🔍 논리성'}
                        {key === 'artistic' && '🎨 예술성'}
                        {key === 'rational' && '🧠 이성'}
                        {key === 'character' && '🌟 인성'}
                        {key === 'intelligence' && '📚 지성'}
                        {key === 'learning' && '📖 학습성'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 성향 활용 가이드 */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                💡 성향 활용 가이드
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    🎯 강점 활용
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    높은 점수의 성향을 활용하여 개인의 장점을 극대화하세요.
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                    ⚖️ 균형 발전
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    상반되는 성향 간의 균형을 맞춰 더 완성된 인격을 만들어가세요.
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    🌱 약점 보완
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    낮은 점수의 영역을 의식적으로 개발하여 성장하세요.
                  </p>
                </div>
              </div>
            </div>

            {/* 개인정보 안내 */}
            {!personalInfo && (
              <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                  💡 더 정확한 분석을 위해 설정에서 개인정보를 입력해주세요.
                  <button
                    onClick={() => window.location.href = '/settings'}
                    className="ml-2 underline hover:no-underline"
                  >
                    설정으로 이동
                  </button>
                </p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PersonalityAnalysisPage;