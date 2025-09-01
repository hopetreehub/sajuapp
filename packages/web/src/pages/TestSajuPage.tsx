import React, { useState } from 'react';
import { testSajuCalculation, convertPersonalInfoToSaju } from '@/utils/personalInfoToSaju';
import { SajuCalculator } from '@/utils/sajuCalculator';

const TestSajuPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  
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
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          사주 계산 정확도 테스트
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <button
            onClick={runTest}
            className="mb-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            테스트 실행
          </button>
          
          {testResult && (
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {testResult}
            </pre>
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