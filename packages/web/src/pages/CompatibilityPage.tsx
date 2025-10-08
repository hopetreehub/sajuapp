import React, { useState } from 'react';
import CustomerSelector from '../components/saju/CustomerSelector';
import { Customer } from '../services/customerApi';
import { CompatibilityRadarChart } from '../components/CompatibilityRadarChart';
import { DetailedAnalysisTabs } from '../components/compatibility/DetailedAnalysisTabs';
import { SajuDisplay } from '../components/saju/SajuDisplay';
import {
  calculateAccuratePersonalityScore,
  calculateAccurateLoveScore,
  calculateAccurateWealthScore,
  calculateAccurateHealthScore,
  calculateAccurateFutureScore,
  generateDetailedAdvice,
} from '../utils/compatibilityCalculator';
import { calculateCompleteSaju } from '../utils/accurateSajuCalculator';
// @ts-ignore
import KoreanLunarCalendar from 'korean-lunar-calendar';
import { analyzeRelationship, RelationshipAnalysis } from '../utils/detailedCompatibilityCalculator';
import { analyzePractical, PracticalAnalysis } from '../utils/practicalCompatibilityCalculator';
import { analyzeDepth, analyzeSpecial, DepthAnalysis, SpecialAnalysis } from '../utils/depthSpecialCompatibilityCalculator';
import { EnhancedCompatibilityChart } from '../components/compatibility/EnhancedCompatibilityChart';
import { interpretationService } from '../services/api';

interface CompatibilityResult {
  totalScore: number;
  categories: {
    name: string;
    score: number;
    description: string;
  }[];
  advice: string;
  detailedAnalysis?: {
    relationship: RelationshipAnalysis;
    practical: PracticalAnalysis;
    depth: DepthAnalysis;
    special: SpecialAnalysis;
  };
}

export const CompatibilityPage: React.FC = () => {
  const [person1, setPerson1] = useState<Customer | null>(null);
  const [person2, setPerson2] = useState<Customer | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [saju1, setSaju1] = useState<any>(null);
  const [saju2, setSaju2] = useState<any>(null);

  // 고객 선택 시 정확한 사주 데이터 계산 (로컬 계산 우선)
  const calculateSajuForCustomer = async (customer: Customer) => {
    if (!customer.birth_date || !customer.birth_time) return null;

    // 임시: API가 구버전이므로 로컬 계산 직접 사용
    try {
      let [year, month, day] = customer.birth_date.split('-').map(Number);
      const [hour, minute] = customer.birth_time.split(':').map(Number);

      // 음력 → 양력 변환
      if (customer.lunar_solar === 'lunar') {
        const calendar = new KoreanLunarCalendar();
        calendar.setLunarDate(year, month, day, false);
        // @ts-ignore
        const solarDate = calendar.getSolarCalendar();
        year = solarDate.year;
        month = solarDate.month;
        day = solarDate.day;
      }

      // 전역 설정에서 진태양시 옵션 읽기
      const savedInfo = localStorage.getItem('personalInfo');
      const useTrueSolarTime = savedInfo ? JSON.parse(savedInfo).useTrueSolarTime : false;

      const sajuResult = calculateCompleteSaju(year, month, day, hour, minute || 0, undefined, useTrueSolarTime);

      // 오행 균형 계산 (간단 버전)
      const ohHaengBalance = { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 };

      return {
        year: { gan: sajuResult.year[0], ji: sajuResult.year[1] },
        month: { gan: sajuResult.month[0], ji: sajuResult.month[1] },
        day: { gan: sajuResult.day[0], ji: sajuResult.day[1] },
        time: { gan: sajuResult.hour[0], ji: sajuResult.hour[1] },
        fullSaju: sajuResult.fullSaju,
        ohHaengBalance,
        dayMaster: sajuResult.day[0],
      };
    } catch (error) {
      console.error('로컬 사주 계산 오류:', error);
      return null;
    }

    /* 임시 비활성화: API가 구버전
    try {

      const sajuData = {
        birth_date: customer.birth_date,
        birth_time: customer.birth_time,
        lunar_solar: customer.lunar_solar,
      };

      // 정확한 사주 계산 API 호출
      const result = await interpretationService.getComprehensiveInterpretation(sajuData);

      if (!result || !result.basic) {
        throw new Error('사주 계산 API 호출 실패');
      }

      const { basic } = result;

      // API 응답을 호환 가능한 형태로 변환
      const sajuString = basic.sajuString || '계산 실패';
      const [yearPart, monthPart, dayPart, timePart] = sajuString.split(' ');

      return {
        year: { gan: yearPart[0], ji: yearPart[1] },
        month: { gan: monthPart[0], ji: monthPart[1] },
        day: { gan: dayPart[0], ji: dayPart[1] },
        time: { gan: timePart[0], ji: timePart[1] },
        fullSaju: sajuString,
        ohHaengBalance: basic.ohHaengBalance || { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 },
        dayMaster: basic.dayMaster,
        interpretation: basic.summary,
      };
    } catch (error) {
      console.error('정확한 사주 계산 오류:', error);
      // 실패 시 accurateSajuCalculator로 폴백
      try {
        let [year, month, day] = customer.birth_date.split('-').map(Number);
        const [hour, minute] = customer.birth_time.split(':').map(Number);

        // 음력 → 양력 변환
        if (customer.lunar_solar === 'lunar') {
          const calendar = new KoreanLunarCalendar();
          calendar.setLunarDate(year, month, day, false);
          // @ts-ignore
          const solarDate = calendar.getSolarCalendar();
          year = solarDate.year;
          month = solarDate.month;
          day = solarDate.day;
        }

        const sajuResult = calculateCompleteSaju(year, month, day, hour, minute || 0);

        // 오행 균형 계산 (간단 버전)
        const ohHaengBalance = { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 };

        return {
          year: { gan: sajuResult.year[0], ji: sajuResult.year[1] },
          month: { gan: sajuResult.month[0], ji: sajuResult.month[1] },
          day: { gan: sajuResult.day[0], ji: sajuResult.day[1] },
          time: { gan: sajuResult.hour[0], ji: sajuResult.hour[1] },
          fullSaju: sajuResult.fullSaju,
          ohHaengBalance,
          dayMaster: sajuResult.day[0],
        };
      } catch (fallbackError) {
        console.error('폴백 사주 계산도 실패:', fallbackError);
        return null;
      }
    }
    */
  };

  const parseAccurateSaju = async (customer: Customer | null) => {
    if (!customer) {
      console.error('고객 데이터가 없습니다');
      return null;
    }

    // 임시: DB에 저장된 사주는 구버전일 수 있으므로 항상 새로 계산
    // customer.saju_data 무시하고 직접 계산
    return await calculateSajuForCustomer(customer);

    /* 임시 비활성화: DB 사주 데이터 사용
    // 먼저 customer.saju_data가 있는지 확인
    if (customer.saju_data) {
      try {
        const parsed = typeof customer.saju_data === 'string'
          ? JSON.parse(customer.saju_data)
          : customer.saju_data;

        // 필수 필드 검증
        const requiredFields = ['year', 'month', 'day', 'time'];
        let isValid = true;
        for (const field of requiredFields) {
          if (!parsed[field] || !parsed[field].gan || !parsed[field].ji) {
            console.error(`사주 데이터가 불완전합니다 - ${field} 필드 누락`);
            isValid = false;
            break;
          }
        }

        if (isValid) {

          return parsed;
        }
      } catch (error) {
        console.error('사주 데이터 파싱 오류:', error);
      }
    }

    // saju_data가 없거나 불완전하면 정확한 API로 계산

    return await calculateSajuForCustomer(customer);
    */
  };

  const calculateCompatibility = async () => {
    if (!person1 || !person2) return;


    setIsCalculating(true);

    try {
      // 정확한 사주 데이터 파싱 (API 사용)

      const calculatedSaju1 = await parseAccurateSaju(person1);
      const calculatedSaju2 = await parseAccurateSaju(person2);

      if (!calculatedSaju1 || !calculatedSaju2) {
        console.error('사주 데이터 파싱 실패 - 궁합 계산 중단');
        alert('정확한 사주 데이터를 계산할 수 없습니다. 고객 정보를 다시 확인해주세요.');
        setIsCalculating(false);
        return;
      }

      // 사주 데이터 state에 저장
      setSaju1(calculatedSaju1);
      setSaju2(calculatedSaju2);


      // 정확한 만세력 기반 궁합 점수 계산
      setTimeout(() => {

        const personalityScore = calculateAccuratePersonalityScore(calculatedSaju1, calculatedSaju2);
        const loveScore = calculateAccurateLoveScore(calculatedSaju1, calculatedSaju2);
        const wealthScore = calculateAccurateWealthScore(calculatedSaju1, calculatedSaju2);
        const healthScore = calculateAccurateHealthScore(calculatedSaju1, calculatedSaju2);
        const futureScore = calculateAccurateFutureScore(calculatedSaju1, calculatedSaju2);


        const categories = [
          {
            name: '성격 궁합',
            score: personalityScore,
            description: '성격과 가치관의 조화 (십신/오행 분석)',
          },
          {
            name: '애정 궁합',
            score: loveScore,
            description: '감정과 애정 표현의 조화 (지지관계/음양조화)',
          },
          {
            name: '재물 궁합',
            score: wealthScore,
            description: '경제관념과 재물운의 조화 (재성 분석)',
          },
          {
            name: '건강 궁합',
            score: healthScore,
            description: '체질과 건강 에너지의 조화 (오행 균형)',
          },
          {
            name: '미래 궁합',
            score: futureScore,
            description: '인생 방향과 목표의 조화 (삼합/육합)',
          },
        ];

        const totalScore = Math.round(categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length);

        // 상세 관계성 분석

        const relationshipAnalysis = analyzeRelationship(calculatedSaju1, calculatedSaju2);

        // 현실적 분석

        const practicalAnalysis = analyzePractical(calculatedSaju1, calculatedSaju2);

        // 심층 분석

        const depthAnalysis = analyzeDepth(calculatedSaju1, calculatedSaju2);

        // 특수 분석

        const specialAnalysis = analyzeSpecial(calculatedSaju1, calculatedSaju2);

        setResult({
          totalScore,
          categories,
          advice: generateDetailedAdvice(totalScore, categories),
          detailedAnalysis: {
            relationship: relationshipAnalysis,
            practical: practicalAnalysis,
            depth: depthAnalysis,
            special: specialAnalysis,
          },
        });

        setIsCalculating(false);
      }, 1000);
    } catch (error) {
      console.error('궁합 계산 중 오류 발생:', error);
      alert('궁합 계산 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsCalculating(false);
    }
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
              <div className="mt-3">
                <SajuDisplay
                  sajuString={saju1?.fullSaju}
                  size="small"
                  className="bg-white dark:bg-gray-800 rounded-lg p-3"
                />
              </div>
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
              <div className="mt-3">
                <SajuDisplay
                  sajuString={saju2?.fullSaju}
                  size="small"
                  className="bg-white dark:bg-gray-800 rounded-lg p-3"
                />
              </div>
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

            {/* 사주 비교 표시 */}
            {(saju1?.fullSaju || saju2?.fullSaju) && (
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-pink-50 dark:from-blue-900/20 dark:to-pink-900/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">사주팔자 비교</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-base font-medium mb-2 text-blue-800 dark:text-blue-200">{person1?.name}</h4>
                    <SajuDisplay
                      sajuString={saju1?.fullSaju}
                      size="medium"
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-2 text-pink-800 dark:text-pink-200">{person2?.name}</h4>
                    <SajuDisplay
                      sajuString={saju2?.fullSaju}
                      size="medium"
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

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
                person2Name: person2?.name || '',
              }}
            />
          </div>
          
          {/* 20개 항목 종합 차트 */}
          {result.detailedAnalysis && (
            <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">
                🌟 20개 항목 종합 궁합 차트
              </h3>
              <EnhancedCompatibilityChart 
                data={{
                  relationship: result.detailedAnalysis.relationship,
                  practical: result.detailedAnalysis.practical,
                  depth: result.detailedAnalysis.depth,
                  special: result.detailedAnalysis.special,
                }}
              />
            </div>
          )}

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

          {/* 상세 분석 탭 */}
          {result.detailedAnalysis && (
            <DetailedAnalysisTabs 
              relationshipAnalysis={result.detailedAnalysis.relationship}
              practicalAnalysis={result.detailedAnalysis.practical}
              depthAnalysis={result.detailedAnalysis.depth}
              specialAnalysis={result.detailedAnalysis.special}
            />
          )}
        </div>
      )}
    </div>
  );
};