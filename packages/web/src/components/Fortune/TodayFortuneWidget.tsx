import React, { useState, useEffect } from 'react';

interface FortuneCategory {
  icon: string;
  label: string;
  score: number;
  stars: number;
}

interface DailyFortune {
  totalScore: number;
  message: string;
  categories: FortuneCategory[];
  luckyItems: {
    color: string;
    number: number;
    direction: string;
  };
  advice: string;
}

const TodayFortuneWidget: React.FC = () => {
  const [fortune, setFortune] = useState<DailyFortune>({
    totalScore: 85,
    message: "오늘은 새로운 기회가 찾아올 수 있는 날입니다.",
    categories: [
      { icon: '💰', label: '금전운', score: 85, stars: 4 },
      { icon: '❤️', label: '연애운', score: 72, stars: 3 },
      { icon: '💼', label: '직장운', score: 90, stars: 5 },
      { icon: '🏃', label: '건강운', score: 68, stars: 3 },
    ],
    luckyItems: {
      color: '파란색',
      number: 7,
      direction: '동쪽',
    },
    advice: "새로운 도전을 두려워하지 마세요. 오늘은 당신의 능력을 발휘할 좋은 기회입니다."
  });

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < count ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <span className="mr-2">🔮</span>
        오늘의 운세
      </h3>
      
      {/* 종합 점수 */}
      <div className="text-center mb-6 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
          {fortune.totalScore}점
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {fortune.message}
        </div>
      </div>
      
      {/* 카테고리별 운세 */}
      <div className="space-y-3 mb-6">
        {fortune.categories.map((category, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-xl">{category.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {category.label}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs">
                {renderStars(category.stars)}
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {category.score}점
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* 행운 아이템 */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          🍀 행운 아이템
        </h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">색상</div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {fortune.luckyItems.color}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">숫자</div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {fortune.luckyItems.number}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">방향</div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {fortune.luckyItems.direction}
            </div>
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