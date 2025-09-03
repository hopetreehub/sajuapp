import React, { useState } from 'react';
import CustomerSelector from '../components/saju/CustomerSelector';
import { Customer } from '../services/customerApi';
import { CompatibilityRadarChart } from '../components/CompatibilityRadarChart';
import {
  calculateAccuratePersonalityScore,
  calculateAccurateLoveScore,
  calculateAccurateWealthScore,
  calculateAccurateHealthScore,
  calculateAccurateFutureScore,
  generateDetailedAdvice
} from '../utils/compatibilityCalculator';

interface CompatibilityResult {
  totalScore: number;
  categories: {
    name: string;
    score: number;
    description: string;
  }[];
  advice: string;
}

export const CompatibilityPage: React.FC = () => {
  const [person1, setPerson1] = useState<Customer | null>(null);
  const [person2, setPerson2] = useState<Customer | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const parseAccurateSaju = (sajuData: string | undefined) => {
    if (!sajuData) {
      console.error('사주 데이터가 없습니다');
      return null;
    }
    
    try {
      const parsed = JSON.parse(sajuData);
      
      // 필수 필드 검증
      const requiredFields = ['year', 'month', 'day', 'time'];
      for (const field of requiredFields) {
        if (!parsed[field] || !parsed[field].gan || !parsed[field].ji) {
          console.error(`사주 데이터가 불완전합니다 - ${field} 필드 누락`);
          return null;
        }
      }
      
      // 오행 균형 데이터 확인
      if (!parsed.ohHaengBalance) {
        console.warn('오행 균형 데이터가 없습니다. 일부 궁합 계산이 제한됩니다.');
      }
      
      console.log('사주 데이터 파싱 성공:', {
        name: parsed.fullSaju,
        year: `${parsed.year.gan}${parsed.year.ji}`,
        month: `${parsed.month.gan}${parsed.month.ji}`,
        day: `${parsed.day.gan}${parsed.day.ji}`,
        time: `${parsed.time.gan}${parsed.time.ji}`,
        ohHaeng: parsed.ohHaengBalance
      });
      
      return parsed;
    } catch (error) {
      console.error('사주 데이터 파싱 오류:', error);
      return null;
    }
  };

  const calculateCompatibility = () => {
    if (!person1 || !person2) return;

    console.log('=== 궁합 계산 시작 ===');
    console.log('첫번째 사람:', person1.name, person1.birth_date, person1.birth_time);
    console.log('두번째 사람:', person2.name, person2.birth_date, person2.birth_time);

    setIsCalculating(true);
    
    // 정확한 사주 데이터 파싱
    const saju1 = parseAccurateSaju(person1.saju_data);
    const saju2 = parseAccurateSaju(person2.saju_data);

    if (!saju1 || !saju2) {
      console.error('사주 데이터 파싱 실패 - 궁합 계산 중단');
      alert('사주 데이터에 문제가 있습니다. 고객 정보를 다시 확인해주세요.');
      setIsCalculating(false);
      return;
    }

    console.log('파싱된 사주 데이터:');
    console.log('- 사주1:', saju1);
    console.log('- 사주2:', saju2);

    // 정확한 만세력 기반 궁합 점수 계산
    setTimeout(() => {
      console.log('궁합 점수 계산 시작...');
      
      const personalityScore = calculateAccuratePersonalityScore(saju1, saju2);
      const loveScore = calculateAccurateLoveScore(saju1, saju2);
      const wealthScore = calculateAccurateWealthScore(saju1, saju2);
      const healthScore = calculateAccurateHealthScore(saju1, saju2);
      const futureScore = calculateAccurateFutureScore(saju1, saju2);
      
      console.log('계산된 궁합 점수:');
      console.log('- 성격 궁합:', personalityScore);
      console.log('- 애정 궁합:', loveScore);
      console.log('- 재물 궁합:', wealthScore);
      console.log('- 건강 궁합:', healthScore);
      console.log('- 미래 궁합:', futureScore);
      
      const categories = [
        { 
          name: '성격 궁합', 
          score: personalityScore, 
          description: '성격과 가치관의 조화 (십신/오행 분석)' 
        },
        { 
          name: '애정 궁합', 
          score: loveScore, 
          description: '감정과 애정 표현의 조화 (지지관계/음양조화)' 
        },
        { 
          name: '재물 궁합', 
          score: wealthScore, 
          description: '경제관념과 재물운의 조화 (재성 분석)' 
        },
        { 
          name: '건강 궁합', 
          score: healthScore, 
          description: '체질과 건강 에너지의 조화 (오행 균형)' 
        },
        { 
          name: '미래 궁합', 
          score: futureScore, 
          description: '인생 방향과 목표의 조화 (삼합/육합)' 
        }
      ];

      const totalScore = Math.round(categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length);
      
      console.log('최종 궁합 점수:', totalScore);
      console.log('=== 궁합 계산 완료 ===');

      setResult({
        totalScore,
        categories,
        advice: generateDetailedAdvice(totalScore, categories)
      });

      setIsCalculating(false);
    }, 1500);
  };


  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">궁합 분석</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">첫 번째 사람</h2>
          <CustomerSelector
            onSelect={setPerson1}
            selectedCustomer={person1}
          />
          {person1 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{person1.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {person1.birth_date} {person1.birth_time} ({person1.lunar_solar === 'lunar' ? '음력' : '양력'})
              </p>
              {person1.saju_data && (() => {
                try {
                  const sajuData = JSON.parse(person1.saju_data);
                  return (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <p>사주: {sajuData.fullSaju || '계산 중...'}</p>
                      {sajuData.ohHaengBalance && (
                        <p className="text-xs mt-1">
                          오행: 목{sajuData.ohHaengBalance.목 || 0} 화{sajuData.ohHaengBalance.화 || 0} 토{sajuData.ohHaengBalance.토 || 0} 금{sajuData.ohHaengBalance.금 || 0} 수{sajuData.ohHaengBalance.수 || 0}
                        </p>
                      )}
                    </div>
                  );
                } catch (e) {
                  return <p className="text-xs text-red-500 mt-1">사주 데이터 오류</p>;
                }
              })()}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">두 번째 사람</h2>
          <CustomerSelector
            onSelect={setPerson2}
            selectedCustomer={person2}
          />
          {person2 && (
            <div className="mt-4 p-4 bg-pink-50 dark:bg-pink-900/30 rounded-lg">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{person2.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {person2.birth_date} {person2.birth_time} ({person2.lunar_solar === 'lunar' ? '음력' : '양력'})
              </p>
              {person2.saju_data && (() => {
                try {
                  const sajuData = JSON.parse(person2.saju_data);
                  return (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <p>사주: {sajuData.fullSaju || '계산 중...'}</p>
                      {sajuData.ohHaengBalance && (
                        <p className="text-xs mt-1">
                          오행: 목{sajuData.ohHaengBalance.목 || 0} 화{sajuData.ohHaengBalance.화 || 0} 토{sajuData.ohHaengBalance.토 || 0} 금{sajuData.ohHaengBalance.금 || 0} 수{sajuData.ohHaengBalance.수 || 0}
                        </p>
                      )}
                    </div>
                  );
                } catch (e) {
                  return <p className="text-xs text-red-500 mt-1">사주 데이터 오류</p>;
                }
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="text-center mb-8">
        <button
          onClick={calculateCompatibility}
          disabled={!person1 || !person2 || isCalculating}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
            person1 && person2 && !isCalculating
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isCalculating ? '분석 중...' : '궁합 분석하기'}
        </button>
      </div>

      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {person1?.name} ♥ {person2?.name} 궁합 결과
            </h2>
            <div className={`text-6xl font-bold ${getScoreColor(result.totalScore)}`}>
              {result.totalScore}점
            </div>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{result.advice}</p>
          </div>

          {/* 레이더 차트 추가 */}
          <div className="mb-8 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">궁합 분석 차트</h3>
            <CompatibilityRadarChart 
              data={{
                categories: result.categories,
                person1Name: person1?.name || '',
                person2Name: person2?.name || ''
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.categories.map((category, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{category.name}</h3>
                  <span className={`font-bold ${getScoreColor(category.score)}`}>
                    {Math.round(category.score)}점
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      category.score >= 80 ? 'bg-green-500' :
                      category.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${category.score}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">💡 궁합 개선 팁</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• 서로의 차이를 인정하고 존중하세요</li>
              <li>• 대화를 통해 서로를 이해하려 노력하세요</li>
              <li>• 공통의 취미나 관심사를 찾아보세요</li>
              <li>• 감사하는 마음을 자주 표현하세요</li>
            </ul>
          </div>
          
          {/* 상세 분석 정보 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                📊 분석 기준
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• 십신(十神) 관계 분석</li>
                <li>• 오행 상생상극 체크</li>
                <li>• 지지 삼합/육합/충 분석</li>
                <li>• 음양 조화도 계산</li>
              </ul>
            </div>
            
            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                🎯 핵심 포인트
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• 일간의 음양 조화</li>
                <li>• 오행 균형 보완 관계</li>
                <li>• 재성/관성 분포</li>
                <li>• 미래 발전 가능성</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};