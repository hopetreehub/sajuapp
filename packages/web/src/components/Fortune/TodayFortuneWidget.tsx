import React, { useState, useEffect } from 'react';
import { 
  calculateTimeBasedScore, 
  SajuData, 
  generateSampleSajuData 
} from '@/utils/sajuScoreCalculator';
import { 
  getLuckyItemsByDate, 
  getDailyFortuneModifier,
  generateDailyFortuneMessage,
  getDailyPillar
} from '@/utils/dailyFortune';

interface FortuneCategory {
  icon: string;
  label: string;
  score: number;
  color: string;
}

interface DailyFortune {
  totalScore: number;
  message: string;
  categories: FortuneCategory[];
  luckyItems: {
    색상: string;
    숫자: number;
    방향: string;
    시간대: string;
    음식: string;
    활동: string;
    보석: string;
    일진: string;
  };
  advice: string;
}

interface TodayFortuneWidgetProps {
  sajuData?: SajuData | null;
  customerName?: string;
  selectedDate?: Date;
}

// 막대그래프 컴포넌트
const BarChart: React.FC<{ categories: FortuneCategory[] }> = ({ categories }) => {
  return (
    <div className="space-y-2">
      {categories.map((category, index) => (
        <div key={index} className="flex items-center space-x-3">
          <span className="text-lg w-6">{category.icon}</span>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-12">
            {category.label}
          </span>
          <div className="flex-1 flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ 
                  width: `${category.score}%`,
                  backgroundColor: category.color
                }}
              >
                <span className="text-xs text-white font-semibold">
                  {category.score}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TodayFortuneWidget: React.FC<TodayFortuneWidgetProps> = ({ sajuData, customerName, selectedDate }) => {
  // 사주 데이터가 없으면 샘플 데이터 사용
  const activeSajuData = sajuData || generateSampleSajuData();
  
  // 선택된 날짜 또는 오늘 날짜
  const targetDate = selectedDate || new Date();
  const isToday = targetDate.toDateString() === new Date().toDateString();
  
  // 오늘의 일진 정보
  const dailyPillar = getDailyPillar(targetDate);
  
  // 카테고리별 점수 계산 (날짜 보정 포함)
  const calculateCategoryScores = (saju: SajuData, date: Date) => {
    const categories = [
      { 
        icon: '💰', 
        label: '금전', 
        baseName: '금전운',
        color: '#f59e0b' // amber
      },
      { 
        icon: '❤️', 
        label: '연애', 
        baseName: '연애운',
        color: '#ef4444' // red
      },
      { 
        icon: '💼', 
        label: '직장', 
        baseName: '직장운',
        color: '#3b82f6' // blue
      },
      { 
        icon: '🏃', 
        label: '건강', 
        baseName: '건강운',
        color: '#10b981' // emerald
      },
    ];
    
    return categories.map(cat => {
      const baseScore = calculateTimeBasedScore(cat.baseName, saju, 'today', date);
      const modifier = getDailyFortuneModifier(date, saju, cat.baseName);
      const finalScore = Math.min(100, Math.max(0, baseScore + modifier));
      
      return {
        icon: cat.icon,
        label: cat.label,
        score: finalScore,
        color: cat.color
      };
    });
  };
  
  const [fortune, setFortune] = useState<DailyFortune>({
    totalScore: 85,
    message: "오늘은 새로운 기회가 찾아올 수 있는 날입니다.",
    categories: [],
    luckyItems: {
      색상: '파란색',
      숫자: 7,
      방향: '동쪽',
      시간대: '09-11시',
      음식: '샐러드',
      활동: '산책',
      보석: '사파이어',
      일진: '갑자'
    },
    advice: "새로운 도전을 두려워하지 마세요."
  });
  
  // 사주 데이터 또는 날짜 변경 시 운세 재계산
  useEffect(() => {
    const categories = calculateCategoryScores(activeSajuData, targetDate);
    const totalScore = Math.round(categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length);
    const message = generateDailyFortuneMessage(targetDate, activeSajuData);
    const luckyItems = getLuckyItemsByDate(targetDate, activeSajuData);
    
    // 조언 생성
    const advice = totalScore >= 70 
      ? "오늘은 적극적으로 활동하기 좋은 날입니다. 기회를 놓치지 마세요."
      : totalScore >= 50
      ? "차분히 일상을 유지하며 내일을 준비하는 시간을 가져보세요."
      : "오늘은 무리하지 말고 휴식을 취하는 것이 좋겠습니다.";
    
    setFortune({
      totalScore,
      message,
      categories,
      luckyItems: {
        색상: luckyItems.색상,
        숫자: luckyItems.숫자,
        방향: luckyItems.방향,
        시간대: luckyItems.시간대,
        음식: luckyItems.음식,
        활동: luckyItems.활동,
        보석: luckyItems.보석,
        일진: luckyItems.일진
      },
      advice
    });
  }, [sajuData, selectedDate]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
        <span className="flex items-center">
          <span className="mr-2">🔮</span>
          {isToday ? '오늘의 운세' : `${targetDate.getMonth() + 1}월 ${targetDate.getDate()}일 운세`}
        </span>
        <span className="text-sm font-normal text-purple-600 dark:text-purple-400">
          {fortune.luckyItems.일진}일
        </span>
      </h3>
      
      {/* 고객 이름 표시 */}
      {customerName ? (
        <div className="text-sm text-purple-600 dark:text-purple-400 mb-2 text-center">
          {customerName === '나' ? '나의 운세' : `${customerName}님의 운세`}
        </div>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
          기본 운세 (설정에서 생년월일시를 입력하면 개인 운세를 확인할 수 있습니다)
        </div>
      )}
      
      {/* 종합 점수 및 메시지 */}
      <div className="text-center mb-6 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
          {fortune.totalScore}점
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {fortune.message}
        </div>
      </div>
      
      {/* 카테고리별 운세 - 막대그래프 */}
      <div className="mb-6 p-4 bg-white/40 dark:bg-gray-800/40 rounded-lg">
        <BarChart categories={fortune.categories} />
      </div>
      
      {/* 행운 아이템 - 확장된 버전 */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          🍀 오늘의 행운 아이템
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">🎨</span>
            <span className="text-xs text-gray-600 dark:text-gray-300">색상:</span>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
              {fortune.luckyItems.색상}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">🔢</span>
            <span className="text-xs text-gray-600 dark:text-gray-300">숫자:</span>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
              {fortune.luckyItems.숫자}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">🧭</span>
            <span className="text-xs text-gray-600 dark:text-gray-300">방향:</span>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
              {fortune.luckyItems.방향}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">⏰</span>
            <span className="text-xs text-gray-600 dark:text-gray-300">시간:</span>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
              {fortune.luckyItems.시간대}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">🍽️</span>
            <span className="text-xs text-gray-600 dark:text-gray-300">음식:</span>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
              {fortune.luckyItems.음식}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">🏃</span>
            <span className="text-xs text-gray-600 dark:text-gray-300">활동:</span>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
              {fortune.luckyItems.활동}
            </span>
          </div>
        </div>
        
        {/* 보석은 별도 표시 */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">💎</span>
            <span className="text-xs text-gray-600 dark:text-gray-300">오늘의 보석:</span>
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {fortune.luckyItems.보석}
            </span>
          </div>
        </div>
      </div>

      {/* 오늘의 조언 */}
      <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          💡 오늘의 조언
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {fortune.advice}
        </p>
      </div>

      {/* 자세히 보기 버튼 */}
      <button 
        onClick={() => window.location.href = '/fortune'}
        className="w-full mt-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
      >
        자세히 보기 →
      </button>
    </div>
  );
};

export default TodayFortuneWidget;