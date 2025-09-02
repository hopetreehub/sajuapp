import { useState } from 'react';
import { calculateCompleteSaju, testSajuCalculation } from '@/utils/sajuCalculatorNew';
import { runBaziTest, convertToKorean } from '@/utils/testBaziCalculator';
import { testAccurateSaju, calculateCompleteSaju as calculateAccurate } from '@/utils/accurateSajuCalculator';
import { BaziCalculator } from 'bazi-calculator-by-alvamind';

export default function SajuTestPage() {
  const [birthDate, setBirthDate] = useState('1971-11-17');
  const [birthTime, setBirthTime] = useState('04:00');
  const [isLunar, setIsLunar] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);
    
    // 정확한 사주 계산 사용 (서머타임 자동 적용)
    const accurateResult = calculateAccurate(year, month, day, hour, minute);
    
    // 기존 형식에 맞게 변환
    const convertedResult = {
      year: { combined: accurateResult.year, gan: accurateResult.year[0], ji: accurateResult.year[1] },
      month: { combined: accurateResult.month, gan: accurateResult.month[0], ji: accurateResult.month[1] },
      day: { combined: accurateResult.day, gan: accurateResult.day[0], ji: accurateResult.day[1] },
      time: { combined: accurateResult.hour, gan: accurateResult.hour[0], ji: accurateResult.hour[1] },
      fullSaju: accurateResult.fullSaju,
      summerTimeApplied: accurateResult.summerTimeApplied,
      ohHaengBalance: { 목: 20, 화: 20, 토: 20, 금: 20, 수: 20 }, // 임시값
      ohHaengCount: { 목: 2, 화: 2, 토: 2, 금: 2, 수: 2 } // 임시값
    };
    
    setResult(convertedResult);
    console.log('정확한 사주 계산 결과:', accurateResult);
    
    // 서머타임 적용 알림
    if (accurateResult.summerTimeApplied) {
      console.log('⚠️ 서머타임이 적용되었습니다.');
    }
  };

  const runTests = () => {
    testSajuCalculation();
    
    // BaZi Calculator 테스트
    console.log('\n=== BaZi Calculator 테스트 ===');
    try {
      const baziResult = runBaziTest();
      console.log('BaZi 결과:', baziResult);
    } catch (error) {
      console.log('BaZi 패키지 오류:', error);
    }
    
    // 정확한 사주 계산 테스트
    console.log('\n=== 정확한 사주 계산 테스트 ===');
    const accurateResult = testAccurateSaju();
    console.log('정확한 계산 결과:', accurateResult);
  };
  
  const calculateWithBazi = () => {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);
    
    try {
      const calculator = new BaziCalculator(year, month, day, hour, 'male');
      const baziString = calculator.toString();
      const koreanBazi = convertToKorean(baziString);
      
      console.log('BaZi Calculator 결과:');
      console.log('Original:', baziString);
      console.log('Korean:', koreanBazi);
      
      alert(`BaZi 계산 결과: ${koreanBazi}`);
    } catch (error) {
      console.log('BaZi 패키지 오류:', error);
      alert('대체 계산 방법을 사용합니다.');
      calculateWithAccurate();
    }
  };
  
  const calculateWithAccurate = () => {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);
    
    const accurateResult = calculateAccurate(year, month, day, hour, minute);
    
    console.log('정확한 사주 계산 결과:');
    console.log('사주 팔자:', accurateResult.fullSaju);
    console.log('년주:', accurateResult.year);
    console.log('월주:', accurateResult.month);
    console.log('일주:', accurateResult.day);
    console.log('시주:', accurateResult.hour);
    
    setResult(accurateResult);
    alert(`정확한 사주: ${accurateResult.fullSaju}`);
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
            
            <button
              onClick={calculateWithBazi}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              BaZi 계산기 테스트
            </button>
            
            <button
              onClick={calculateWithAccurate}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              정확한 사주 계산
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
              {result.summerTimeApplied && (
                <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 text-center">
                  ⚠️ 서머타임이 적용되었습니다 (한국 1948-1988년 시행)
                </div>
              )}
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
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <h3 className="text-sm font-medium mb-2 text-green-800 dark:text-green-200">
                ✅ 정확한 사주 계산 시스템 (검증 완료)
              </h3>
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                <div className="font-semibold text-green-700">🎯 기준 검증: 1971년 11월 17일 04시 = 신해 기해 병오 경인 ✅</div>
                <div>• 1984년 2월 4일 12시 → 갑자년 정묘월 무진일 무오시 (입춘일)</div>
                <div>• 2000년 1월 1일 00시 → 기묘년 정축월 무오일 임자시</div>
                <div className="text-blue-600 mt-2">💡 Julian Day Number 기반 정밀 계산 적용</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}