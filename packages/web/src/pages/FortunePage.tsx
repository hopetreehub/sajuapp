import React, { useState, useEffect } from 'react';

interface DailyFortune {
  date: string;
  overallScore: number;
  categories: {
    love: { score: number; description: string };
    career: { score: number; description: string };
    money: { score: number; description: string };
    health: { score: number; description: string };
  };
  luckyItems: {
    number: number;
    color: string;
    direction: string;
    time: string;
  };
  advice: string;
  warning: string;
}

const FortunePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [loading, setLoading] = useState(false);

  // 임시 운세 데이터 생성 (실제로는 API 호출)
  const generateFortune = (): DailyFortune => {
    return {
      date: selectedDate.toISOString().split('T')[0],
      overallScore: Math.floor(Math.random() * 30) + 70,
      categories: {
        love: {
          score: Math.floor(Math.random() * 100),
          description: '새로운 만남의 기회가 있을 수 있습니다. 열린 마음으로 대화를 나누어보세요.',
        },
        career: {
          score: Math.floor(Math.random() * 100),
          description: '업무에서 중요한 성과를 낼 수 있는 날입니다. 집중력을 발휘하세요.',
        },
        money: {
          score: Math.floor(Math.random() * 100),
          description: '재정 관리에 신중을 기하세요. 충동적인 소비는 피하는 것이 좋습니다.',
        },
        health: {
          score: Math.floor(Math.random() * 100),
          description: '충분한 휴식이 필요합니다. 스트레스 관리에 유의하세요.',
        },
      },
      luckyItems: {
        number: Math.floor(Math.random() * 100),
        color: ['빨강', '파랑', '노랑', '초록', '보라'][Math.floor(Math.random() * 5)],
        direction: ['동', '서', '남', '북', '중앙'][Math.floor(Math.random() * 5)],
        time: `${Math.floor(Math.random() * 12) + 1}시`,
      },
      advice: '오늘은 긍정적인 에너지가 충만한 날입니다. 평소 미루어왔던 일을 시작하기에 좋은 시기입니다.',
      warning: '과도한 자신감은 실수를 부를 수 있으니 겸손한 자세를 유지하세요.',
    };
  };

  useEffect(() => {
    setLoading(true);
    // API 호출 시뮬레이션
    setTimeout(() => {
      setFortune(generateFortune());
      setLoading(false);
    }, 500);
  }, [selectedDate]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '😄';
    if (score >= 60) return '🙂';
    if (score >= 40) return '😐';
    return '😔';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🔮 오늘의 운세
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          AI와 전통 사주명리학이 분석한 당신의 하루
        </p>
      </div>

      {/* Date Selector */}
      <div className="flex justify-center mb-8">
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : fortune ? (
        <div className="space-y-6">
          {/* Overall Score Card */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">종합 운세 점수</h2>
              <div className="text-6xl font-bold mb-2">{fortune.overallScore}점</div>
              <div className="text-4xl mb-4">{getScoreEmoji(fortune.overallScore)}</div>
              <p className="text-lg opacity-90">{fortune.advice}</p>
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(fortune.categories).map(([key, value]) => (
              <div key={key} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white capitalize">
                    {key === 'love' && '💕 연애운'}
                    {key === 'career' && '💼 직장운'}
                    {key === 'money' && '💰 금전운'}
                    {key === 'health' && '🏃 건강운'}
                  </h3>
                  <span className={`text-2xl font-bold ${getScoreColor(value.score)}`}>
                    {value.score}점
                  </span>
                </div>
                <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${value.score}%` }}
                  />
                </div>
                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>

          {/* Lucky Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              🍀 오늘의 행운 아이템
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-3xl mb-2 block">🔢</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">행운의 숫자</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {fortune.luckyItems.number}
                </p>
              </div>
              <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <span className="text-3xl mb-2 block">🎨</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">행운의 색</p>
                <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
                  {fortune.luckyItems.color}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-3xl mb-2 block">🧭</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">길한 방향</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {fortune.luckyItems.direction}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-3xl mb-2 block">⏰</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">행운의 시간</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {fortune.luckyItems.time}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Card */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ 오늘의 주의사항
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{fortune.warning}</p>
          </div>

          {/* Share Buttons */}
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              📱 카카오톡 공유
            </button>
            <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              💬 네이버 공유
            </button>
            <button className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              📷 이미지 저장
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FortunePage;