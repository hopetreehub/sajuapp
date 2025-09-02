import { useState } from 'react';
import { calculateCompleteSaju, testSajuCalculation } from '@/utils/sajuCalculatorNew';

export default function SajuTestPage() {
  const [birthDate, setBirthDate] = useState('1971-11-17');
  const [birthTime, setBirthTime] = useState('04:00');
  const [isLunar, setIsLunar] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);
    
    const sajuResult = calculateCompleteSaju(year, month, day, hour, minute, isLunar);
    setResult(sajuResult);
    
    console.log('계산 결과:', sajuResult);
  };

  const runTests = () => {
    testSajuCalculation();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          🔮 정확한 사주 계산 테스트
        </h1>

        {/* 입력 폼 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            생년월일시 입력
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                생년월일
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                생시
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isLunar}
                onChange={(e) => setIsLunar(e.target.checked)}
                className="mr-2"
              />
              음력
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCalculate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              사주 계산
            </button>
            
            <button
              onClick={runTests}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              테스트 실행 (콘솔 확인)
            </button>
          </div>
        </div>

        {/* 결과 표시 */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              사주 계산 결과
            </h2>

            {/* 사주 팔자 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
                사주 팔자
              </h3>
              <div className="text-2xl font-bold text-center p-4 bg-gray-100 dark:bg-gray-700 rounded">
                {result.fullSaju}
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">년주</div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                  {result.year.combined}
                </div>
                <div className="text-xs mt-1">
                  천간: {result.year.gan} | 지지: {result.year.ji}
                </div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">월주</div>
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {result.month.combined}
                </div>
                <div className="text-xs mt-1">
                  천간: {result.month.gan} | 지지: {result.month.ji}
                </div>
              </div>
              
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">일주</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {result.day.combined}
                </div>
                <div className="text-xs mt-1">
                  천간: {result.day.gan} | 지지: {result.day.ji}
                </div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">시주</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {result.time.combined}
                </div>
                <div className="text-xs mt-1">
                  천간: {result.time.gan} | 지지: {result.time.ji}
                </div>
              </div>
            </div>

            {/* 오행 분포 */}
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
                오행 분포
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(result.ohHaengBalance).map(([element, percentage]) => (
                  <div key={element} className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <div className="text-sm font-medium">{element}</div>
                    <div className="text-lg font-bold">{percentage}%</div>
                    <div className="text-xs text-gray-500">
                      ({result.ohHaengCount[element]}개)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 테스트 케이스 */}
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <h3 className="text-sm font-medium mb-2 text-yellow-800 dark:text-yellow-200">
                검증용 테스트 케이스
              </h3>
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                <div>1971년 11월 17일 04시 → 신해년 기해월 ?일 ?시</div>
                <div>1984년 2월 4일 12시 → 갑자년 병인월 (입춘일)</div>
                <div>2000년 1월 1일 00시 → 기묘년 병자월 무오일 임자시</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}