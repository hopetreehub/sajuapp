import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: '🔮',
      title: '오늘의 운세',
      description: '매일 업데이트되는 정확한 일일 운세',
      link: '/fortune',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: '📜',
      title: '사주 분석',
      description: '생년월일시로 보는 상세한 사주팔자',
      link: '/saju',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '💑',
      title: '궁합 보기',
      description: '연애, 결혼, 사업 파트너 궁합 분석',
      link: '/compatibility',
      color: 'from-pink-500 to-red-500',
    },
    {
      icon: '📅',
      title: '캘린더',
      description: '일정 관리와 길일 확인',
      link: '/calendar',
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: '📝',
      title: '다이어리',
      description: '일상 기록과 감정 추적',
      link: '/diary',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: '⚙️',
      title: '설정',
      description: '앱 환경 설정 및 프로필 관리',
      link: '/settings',
      color: 'from-gray-500 to-gray-600',
    },
  ];

  const todayFortune = {
    date: new Date().toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long', 
    }),
    luckyNumber: Math.floor(Math.random() * 100),
    luckyColor: '보라색',
    direction: '동쪽',
    message: '오늘은 새로운 기회가 찾아올 수 있는 날입니다. 평소보다 적극적인 태도로 임하면 좋은 결과를 얻을 수 있을 것입니다.',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            운명나침반
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            전통 사주명리학과 현대 AI가 만나 당신의 운명을 안내합니다
          </p>
        </div>

        {/* Today's Fortune Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            🌟 오늘의 운세 한눈에 보기
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{todayFortune.date}</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {todayFortune.message}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
                  <span className="text-2xl">🔢</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">행운의 숫자</p>
                  <p className="font-bold text-purple-600 dark:text-purple-400">{todayFortune.luckyNumber}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-pink-100 dark:bg-pink-900/30 rounded-lg p-3">
                  <span className="text-2xl">🎨</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">행운의 색</p>
                  <p className="font-bold text-pink-600 dark:text-pink-400">{todayFortune.luckyColor}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                  <span className="text-2xl">🧭</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">길한 방향</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">{todayFortune.direction}</p>
                </div>
              </div>
            </div>
          </div>
          <Link 
            to="/fortune"
            className="inline-flex items-center mt-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            자세히 보기 →
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.link}
              to={feature.link}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`} />
              <div className="p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                  <span className="text-sm font-medium">바로가기</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold">100만+</p>
              <p className="text-sm opacity-90">누적 사용자</p>
            </div>
            <div>
              <p className="text-3xl font-bold">98%</p>
              <p className="text-sm opacity-90">정확도</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm opacity-90">실시간 서비스</p>
            </div>
            <div>
              <p className="text-3xl font-bold">4.8⭐</p>
              <p className="text-sm opacity-90">사용자 평점</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;