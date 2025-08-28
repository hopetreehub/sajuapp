import React, { useState, useEffect } from 'react';
import SeventeenFortuneChart from '@/components/saju/charts/SeventeenFortuneChart';
import { SeventeenFortuneScores } from '@/types/saju';
import { useNavigate } from 'react-router-dom';

const DetailedFortunePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fortuneScores, setFortuneScores] = useState<SeventeenFortuneScores | null>(null);
  const [personalInfo, setPersonalInfo] = useState<any>(null);

  useEffect(() => {
    // 개인정보 불러오기
    const loadPersonalInfo = () => {
      const saved = localStorage.getItem('sajuapp-personal-info');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPersonalInfo(parsed);
          // 개인정보가 있으면 운세 점수 생성
          generateFortuneScores();
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

  // 운세 점수 생성 (개인정보 기반)
  const generateFortuneScores = () => {
    setLoading(true);
    
    // 시뮬레이션: 실제로는 개인정보 기반으로 계산
    setTimeout(() => {
      const scores: SeventeenFortuneScores = {
        health: Math.floor(Math.random() * 30) + 45,       // 45-75
        marriage: Math.floor(Math.random() * 35) + 40,     // 40-75
        power: Math.floor(Math.random() * 25) + 35,        // 35-60
        fame: Math.floor(Math.random() * 30) + 45,         // 45-75
        accident: Math.floor(Math.random() * 30) + 25,     // 25-55 (낮을수록 좋음)
        business: Math.floor(Math.random() * 35) + 50,     // 50-85
        movement: Math.floor(Math.random() * 30) + 40,     // 40-70
        separation: Math.floor(Math.random() * 25) + 30,   // 30-55 (낮을수록 좋음)
        relationship: Math.floor(Math.random() * 35) + 55, // 55-90
        children: Math.floor(Math.random() * 30) + 45,     // 45-75
        talent: Math.floor(Math.random() * 35) + 50,       // 50-85
        wealth: Math.floor(Math.random() * 35) + 45,       // 45-80
        ancestor: Math.floor(Math.random() * 25) + 50,     // 50-75
        career: Math.floor(Math.random() * 30) + 50,       // 50-80
        family: Math.floor(Math.random() * 30) + 55,       // 55-85
        study: Math.floor(Math.random() * 35) + 45,        // 45-80
        fortune: Math.floor(Math.random() * 30) + 50       // 50-80
      };
      
      setFortuneScores(scores);
      setLoading(false);
    }, 1500);
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
    
    const { birthDate, birthTime, calendarType } = personalInfo;
    if (!birthDate) return null;
    
    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}년 ${month}월 ${day}일 ${birthTime || '00:00'} (${calendarType === 'lunar' ? '음력' : '양력'})`;
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🔮 17대 세부운세 분석
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            당신의 인생 전반에 걸친 세부적인 운세를 분석합니다
          </p>
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button
            onClick={() => navigate('/saju')}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            ← 6대 영역 분석
          </button>
          <button
            onClick={() => navigate('/saju/personality')}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            🧠 성향 분석
          </button>
          <button
            onClick={() => navigate('/fortune')}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            오늘의 운세 →
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
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
                    onClick={() => navigate('/settings')}
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