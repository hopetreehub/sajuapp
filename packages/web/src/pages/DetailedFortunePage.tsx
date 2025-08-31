import React, { useState, useEffect } from 'react';
import SeventeenFortuneChart from '@/components/saju/charts/SeventeenFortuneChart';
import ChartNavigation from '@/components/Common/ChartNavigation';
import { SeventeenFortuneScores, SajuBirthInfo } from '@/types/saju';
import { CHART_DESIGN_SYSTEM } from '@/constants/chartDesignSystem';
import { calculateSajuData } from '@/utils/sajuDataCalculator';

const DetailedFortunePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [fortuneScores, setFortuneScores] = useState<SeventeenFortuneScores | null>(null);
  const [personalInfo, setPersonalInfo] = useState<SajuBirthInfo | null>(null);

  useEffect(() => {
    // 개인정보 불러오기
    const loadPersonalInfo = () => {
      const saved = localStorage.getItem('sajuapp-personal-info');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // SettingsPage 형식을 SajuBirthInfo 형식으로 변환
          if (parsed.birthDate && parsed.birthTime) {
            const date = new Date(parsed.birthDate);
            const [hour, minute] = parsed.birthTime.split(':').map(Number);
            
            const sajuBirthInfo: SajuBirthInfo = {
              year: date.getFullYear(),
              month: date.getMonth() + 1,
              day: date.getDate(),
              hour: hour || 0,
              minute: minute || 0,
              isLunar: parsed.calendarType === 'lunar',
              gender: parsed.gender as 'male' | 'female' | undefined
            };
            
            setPersonalInfo(sajuBirthInfo);
          } else {
            generateDefaultScores();
          }
        } catch (error) {
          console.error('Failed to parse personal info:', error);
          generateDefaultScores();
        }
      } else {
        // 개인정보가 없어도 기본 점수로 표시
        generateDefaultScores();
      }
    };

    loadPersonalInfo();
  }, []);

  // personalInfo가 설정되면 운세 점수 생성
  useEffect(() => {
    if (personalInfo) {
      generateFortuneScores();
    }
  }, [personalInfo]);

  // 운세 점수 생성 (개인정보 기반)
  const generateFortuneScores = () => {
    if (!personalInfo) {
      generateDefaultScores();
      return;
    }
    
    setLoading(true);
    
    // 실제 사주 데이터로 계산
    setTimeout(() => {
      try {
        const sajuData = calculateSajuData(personalInfo);
        // seventeenFortunes가 있으면 사용, 없으면 기본값 생성
        const scores = sajuData.seventeenFortunes || generateSeventeenFortunesFromSaju(sajuData);
        
        setFortuneScores(scores);
        setLoading(false);
      } catch (error) {
        console.error('사주 계산 오류:', error);
        generateDefaultScores();
      }
    }, 1500);
  };
  
  // 사주 데이터로부터 17대 운세 점수 생성
  const generateSeventeenFortunesFromSaju = (sajuData: any): SeventeenFortuneScores => {
    // 오행과 십성 데이터를 기반으로 17대 운세 점수 계산
    const fiveElements = sajuData.fiveElements;
    const tenGods = sajuData.tenGods;
    const sixAreas = sajuData.sixAreas;
    
    return {
      health: Math.min(100, Math.max(0, fiveElements.water * 0.7 + fiveElements.wood * 0.3)),
      marriage: Math.min(100, Math.max(0, tenGods.jeongjae * 0.5 + tenGods.pyeonjae * 0.3 + sixAreas.relationship * 0.2)),
      power: Math.min(100, Math.max(0, tenGods.jeonggwan * 0.5 + tenGods.pyeongwan * 0.3 + fiveElements.metal * 0.2)),
      fame: Math.min(100, Math.max(0, tenGods.siksin * 0.4 + sixAreas.luck * 0.3 + fiveElements.fire * 0.3)),
      accident: Math.min(100, Math.max(0, 100 - (tenGods.geopjae * 0.5 + tenGods.sanggwan * 0.5))), // 낮을수록 좋음
      business: Math.min(100, Math.max(0, tenGods.jeongjae * 0.4 + sixAreas.action * 0.3 + fiveElements.earth * 0.3)),
      movement: Math.min(100, Math.max(0, sixAreas.action * 0.5 + fiveElements.wood * 0.3 + tenGods.pyeongin * 0.2)),
      separation: Math.min(100, Math.max(0, 100 - (sixAreas.relationship * 0.5 + tenGods.jeongin * 0.5))), // 낮을수록 좋음
      relationship: Math.min(100, Math.max(0, sixAreas.relationship * 0.6 + tenGods.jeongin * 0.4)),
      children: Math.min(100, Math.max(0, tenGods.siksin * 0.5 + sixAreas.foundation * 0.3 + fiveElements.water * 0.2)),
      talent: Math.min(100, Math.max(0, tenGods.siksin * 0.4 + sixAreas.thinking * 0.4 + fiveElements.fire * 0.2)),
      wealth: Math.min(100, Math.max(0, tenGods.jeongjae * 0.4 + tenGods.pyeonjae * 0.4 + fiveElements.metal * 0.2)),
      ancestor: Math.min(100, Math.max(0, sixAreas.foundation * 0.5 + sixAreas.environment * 0.3 + fiveElements.earth * 0.2)),
      career: Math.min(100, Math.max(0, tenGods.jeonggwan * 0.4 + sixAreas.action * 0.4 + fiveElements.water * 0.2)),
      family: Math.min(100, Math.max(0, sixAreas.foundation * 0.4 + sixAreas.relationship * 0.4 + tenGods.jeongin * 0.2)),
      study: Math.min(100, Math.max(0, sixAreas.thinking * 0.5 + tenGods.jeongin * 0.3 + fiveElements.water * 0.2)),
      fortune: Math.min(100, Math.max(0, sixAreas.luck * 0.6 + (fiveElements.wood + fiveElements.fire) * 0.2))
    };
  };

  // 기본 점수 생성
  const generateDefaultScores = () => {
    setLoading(true);
    
    setTimeout(() => {
      const scores: SeventeenFortuneScores = {
        health: 62,
        marriage: 55,
        power: 48,
        fame: 58,
        accident: 35, // 낮을수록 좋음
        business: 65,
        movement: 52,
        separation: 40, // 낮을수록 좋음
        relationship: 68,
        children: 60,
        talent: 63,
        wealth: 58,
        ancestor: 61,
        career: 62,
        family: 67,
        study: 59,
        fortune: 65
      };
      
      setFortuneScores(scores);
      setLoading(false);
    }, 1000);
  };

  const formatBirthDate = () => {
    if (!personalInfo) return null;
    
    const { year, month, day, hour, minute, isLunar } = personalInfo;
    if (!year || !month || !day) return null;
    
    return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute || 0}분 (${isLunar ? '음력' : '양력'})`;
  };

  // 운세별 설명
  const fortuneDescriptions = {
    health: '신체적, 정신적 건강과 체력, 질병 회복력을 나타냅니다.',
    marriage: '배우자와의 만남, 결혼 생활의 행복도를 나타냅니다.',
    power: '사회적 지위, 권한, 영향력 획득 가능성을 나타냅니다.',
    fame: '사회적 인정, 명성, 평판을 나타냅니다.',
    accident: '사고나 위험 발생 가능성을 나타냅니다. (낮을수록 안전)',
    business: '사업 성공, 확장, 수익성을 나타냅니다.',
    movement: '이사, 이직, 여행 등 변화의 운을 나타냅니다.',
    separation: '이별, 헤어짐의 가능성을 나타냅니다. (낮을수록 좋음)',
    relationship: '대인관계, 인맥, 새로운 만남을 나타냅니다.',
    children: '자녀의 건강, 성공, 관계를 나타냅니다.',
    talent: '재능 발현, 능력 개발, 창의성을 나타냅니다.',
    wealth: '금전운, 재산 증식, 경제적 안정을 나타냅니다.',
    ancestor: '조상의 덕, 가문의 운, 유산을 나타냅니다.',
    career: '직장 생활, 승진, 업무 성과를 나타냅니다.',
    family: '가정 화목, 가족 관계, 집안 분위기를 나타냅니다.',
    study: '학업 성취, 시험 운, 지식 습득을 나타냅니다.',
    fortune: '전반적인 행운과 좋은 기회를 나타냅니다.'
  };

  return (
    <div className={CHART_DESIGN_SYSTEM.LAYOUT.pageContainer}>
      <div className={CHART_DESIGN_SYSTEM.LAYOUT.contentContainer}>
        {/* 페이지 헤더 - 통일된 디자인 */}
        <div className={CHART_DESIGN_SYSTEM.LAYOUT.header.container}>
          <h1 className={CHART_DESIGN_SYSTEM.LAYOUT.header.title}>
            🔮 17대 세부운세 분석
          </h1>
          <p className={CHART_DESIGN_SYSTEM.LAYOUT.header.subtitle}>
            당신의 인생 전반에 걸친 세부적인 운세를 분석합니다
          </p>
        </div>

        {/* 자동 네비게이션 */}
        <ChartNavigation showCenter={true} />

        {loading ? (
          <div className={CHART_DESIGN_SYSTEM.LOADING.container}>
            <div className={CHART_DESIGN_SYSTEM.LOADING.wrapper}>
              <div className={CHART_DESIGN_SYSTEM.LOADING.spinner}></div>
              <p className={CHART_DESIGN_SYSTEM.LOADING.text}>운세를 분석하고 있습니다...</p>
            </div>
          </div>
        ) : fortuneScores ? (
          <>
            {/* 17대 운세 차트 */}
            <div className="mb-8">
              <SeventeenFortuneChart 
                scores={fortuneScores}
                birthDate={formatBirthDate() || undefined}
              />
            </div>

            {/* 운세별 상세 설명 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                📖 운세 항목별 설명
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(fortuneDescriptions).map(([key, description]) => (
                  <div key={key} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-200">
                        {key === 'health' && '건강운'}
                        {key === 'marriage' && '결혼운'}
                        {key === 'power' && '권력운'}
                        {key === 'fame' && '명예운'}
                        {key === 'accident' && '사고운'}
                        {key === 'business' && '사업운'}
                        {key === 'movement' && '이동운'}
                        {key === 'separation' && '이별운'}
                        {key === 'relationship' && '인연운'}
                        {key === 'children' && '자식운'}
                        {key === 'talent' && '재능운'}
                        {key === 'wealth' && '재물운'}
                        {key === 'ancestor' && '조상운'}
                        {key === 'career' && '직업운'}
                        {key === 'family' && '집안운'}
                        {key === 'study' && '학업운'}
                        {key === 'fortune' && '행운운'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
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

export default DetailedFortunePage;