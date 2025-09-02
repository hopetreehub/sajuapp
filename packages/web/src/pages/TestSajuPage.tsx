import React, { useState } from 'react';
import { testSajuCalculation, convertPersonalInfoToSaju } from '@/utils/personalInfoToSaju';
import { SajuCalculator } from '@/utils/sajuCalculator';
import { getDailyFortuneModifier, getLuckyItemsByDate } from '@/utils/dailyFortune';
import { calculateEnhancedLuckyNumber } from '@/utils/sajuRelations';

const TestSajuPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [fortuneTestResult, setFortuneTestResult] = useState<string>('');
  
  const runTest = () => {
    console.clear();
    console.log('=== 사주 계산 테스트 시작 ===');
    
    // 테스트 1: 1971년 11월 17일 04시
    const test1 = convertPersonalInfoToSaju({
      birthDate: '1971-11-17',
      birthTime: '04:00',
      calendarType: 'solar',
      gender: 'male',
      birthPlace: ''
    });
    
    const result1 = test1?.fullSaju === '신해 기해 병오 경인' ? '✅ 정확' : '❌ 오류';
    
    // 테스트 2: 1976년 9월 16일 09시 40분
    const test2 = convertPersonalInfoToSaju({
      birthDate: '1976-09-16',
      birthTime: '09:40',
      calendarType: 'solar',
      gender: 'male',
      birthPlace: ''
    });
    
    const result2 = test2?.fullSaju === '병진 정유 신미 계사' ? '✅ 정확' : '❌ 오류';
    
    const resultText = `
테스트 1: 1971년 11월 17일 04시
결과: ${test1?.fullSaju}
기대값: 신해 기해 병오 경인
검증: ${result1}

테스트 2: 1976년 9월 16일 09시 40분
결과: ${test2?.fullSaju}
기대값: 병진 정유 신미 계사
검증: ${result2}
    `;
    
    setTestResult(resultText);
    
    // 콘솔에도 자세한 정보 출력
    SajuCalculator.testReferenceCases();
    testSajuCalculation();
  };
  
  const runFortuneTest = () => {
    console.clear();
    console.log('=== 운세 점수 변동성 테스트 ===');
    
    // 테스트용 사주 데이터
    const testSaju = convertPersonalInfoToSaju({
      birthDate: '1990-05-15',
      birthTime: '14:30',
      calendarType: 'solar',
      gender: 'male',
      birthPlace: ''
    });
    
    if (!testSaju) {
      setFortuneTestResult('사주 데이터 생성 실패');
      return;
    }
    
    // 7일간의 운세 변동 테스트
    const results = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const testDate = new Date(today);
      testDate.setDate(today.getDate() + i);
      
      const moneyModifier = getDailyFortuneModifier(testDate, testSaju, '금전운');
      const loveModifier = getDailyFortuneModifier(testDate, testSaju, '연애운');
      const workModifier = getDailyFortuneModifier(testDate, testSaju, '직장운');
      const healthModifier = getDailyFortuneModifier(testDate, testSaju, '건강운');
      
      const luckyItems = getLuckyItemsByDate(testDate, testSaju);
      const luckyNumber = calculateEnhancedLuckyNumber(testDate, testSaju);
      
      // 기본 점수 50 + 보정값
      const moneyScore = Math.min(100, Math.max(10, 50 + moneyModifier));
      const loveScore = Math.min(100, Math.max(10, 50 + loveModifier));
      const workScore = Math.min(100, Math.max(10, 50 + workModifier));
      const healthScore = Math.min(100, Math.max(10, 50 + healthModifier));
      
      results.push(`
${testDate.getMonth() + 1}월 ${testDate.getDate()}일 (${luckyItems.일진})
행운의 숫자: ${luckyNumber}
금전운: ${moneyScore}점 (보정: ${moneyModifier > 0 ? '+' : ''}${moneyModifier})
연애운: ${loveScore}점 (보정: ${loveModifier > 0 ? '+' : ''}${loveModifier})
직장운: ${workScore}점 (보정: ${workModifier > 0 ? '+' : ''}${workModifier})
건강운: ${healthScore}점 (보정: ${healthModifier > 0 ? '+' : ''}${healthModifier})
행운의 색: ${luckyItems.색상}
행운의 방향: ${luckyItems.방향}
      `);
    }
    
    setFortuneTestResult(results.join('\n' + '='.repeat(40)));
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          사주 계산 정확도 테스트
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={runTest}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              사주 계산 테스트
            </button>
            <button
              onClick={runFortuneTest}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              운세 변동성 테스트
            </button>
          </div>
          
          {testResult && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                사주 계산 결과
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {testResult}
              </pre>
            </div>
          )}
          
          {fortuneTestResult && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                운세 변동성 테스트 결과
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-x-auto">
                {fortuneTestResult}
              </pre>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              💡 테스트 설명
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              콘솔(F12)을 열어서 자세한 계산 과정을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSajuPage;