/**
 * 자미두수(紫微斗數) 메인 페이지
 *
 * 송나라 시대부터 전해지는 중국 전통 운명 분석 시스템
 * 14주성과 12궁위를 기반으로 정밀한 운세 분석 제공
 *
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { calculateZiweiChart } from '@/utils/ziweiCalculator';
import type { ZiweiChart, Palace } from '@/types/ziwei';
import type { Customer } from '@/services/customerApi';
import CustomerSelector from '@/components/saju/CustomerSelector';
import ZiweiChartView from '@/components/ziwei/ZiweiChartView';
import ZiweiPalaceDetail from '@/components/ziwei/ZiweiPalaceDetail';
import ZiweiAIChat from '@/components/ziwei/ZiweiAIChat';
import ZiweiBeginnerGuide from '@/components/ziwei/ZiweiBeginnerGuide';
import QuestionSelector from '@/components/tarot/QuestionSelector';
import { ZIWEI_QUESTIONS } from '@/utils/ziweiQuestions';

export default function ZiweiPage() {
  // 상태 관리
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedAIQuestion, setSelectedAIQuestion] = useState<string>('');

  // 고객 선택 관련 상태
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [appliedCustomer, setAppliedCustomer] = useState<Customer | null>(null);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  // 고객 선택 변경 감지
  useEffect(() => {
    setHasUnappliedChanges(selectedCustomer?.id !== appliedCustomer?.id);
  }, [selectedCustomer, appliedCustomer]);

  // 차트 계산 (적용된 고객 정보 사용)
  useEffect(() => {
    if (!appliedCustomer) {
      setChart(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 생년월일시 파싱
      const birthDate = appliedCustomer.birth_date.split('-').map(Number); // [YYYY, MM, DD]
      const birthTime = appliedCustomer.birth_time
        ? appliedCustomer.birth_time.split(':').map(Number) // [HH, MM]
        : [12, 0]; // 기본값: 정오

      const newChart = calculateZiweiChart({
        year: birthDate[0],
        month: birthDate[1],
        day: birthDate[2],
        hour: birthTime[0],
        minute: birthTime[1],
        lunar: appliedCustomer.lunar_solar === 'lunar',
        gender: appliedCustomer.gender,
      });

      setChart(newChart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [appliedCustomer]);

  // 고객 적용 핸들러
  const handleApplyCustomer = () => {
    setAppliedCustomer(selectedCustomer);
    setHasUnappliedChanges(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400">
              ⭐ 자미두수
            </h1>
            <button
              onClick={() => setShowGuide(true)}
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-2"
            >
              <span>📖</span>
              <span>초보자 가이드</span>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            紫微斗數 - 14주성과 12궁위로 보는 정밀 운명 분석
          </p>
        </header>

        {/* 고객 선택 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <CustomerSelector
                selectedCustomer={selectedCustomer}
                onSelect={setSelectedCustomer}
                showAddButton={true}
              />
              {selectedCustomer && (
                <button
                  onClick={handleApplyCustomer}
                  disabled={!hasUnappliedChanges}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    hasUnappliedChanges
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl animate-pulse'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {hasUnappliedChanges ? '✨ 적용하기' : '✓ 적용됨'}
                </button>
              )}
            </div>
            {appliedCustomer && (
              <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                💡 현재 <strong>{appliedCustomer.name}</strong>님 (
                {appliedCustomer.birth_date} {appliedCustomer.birth_time})의 명반(命盤)을
                분석 중입니다
              </div>
            )}
            {selectedCustomer && hasUnappliedChanges && (
              <div className="mt-4 text-sm text-center text-orange-600 dark:text-orange-400 font-medium">
                ⚠️ <strong>{selectedCustomer.name}</strong>님으로 변경하려면 "적용하기" 버튼을 클릭하세요
              </div>
            )}
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">명반(命盤) 계산 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
              차트 계산 실패
            </h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 고객 미선택 상태 */}
        {!loading && !chart && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-6">🔮</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              고객을 선택해주세요
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              위의 "고객 선택하기" 버튼을 클릭하여<br />
              명반(命盤) 분석을 시작하세요
            </p>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200">14주성</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    자미성계 6성 + 천부성계 8성의 별자리 배치
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏛️</span>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200">12궁위</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    명궁, 부부궁, 재백궁 등 인생 12개 영역 분석
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200">대운·유년운</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    10년 단위 대운과 1년 단위 유년운 예측
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 차트 표시 (구현 예정) */}
        {!loading && chart && (
          <div className="space-y-8">
            {/* 기본 정보 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                📊 기본 명반 정보
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    납음오행 국수
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {chart.bureau}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    명궁(命宮)
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {chart.lifePalaceBranch}
                  </div>
                </div>
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    신궁(身宮)
                  </div>
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                    {chart.bodyPalaceBranch}
                  </div>
                </div>
              </div>
            </div>

            {/* 종합 운세 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                🌟 종합 운세
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`text-6xl font-bold ${
                      chart.overallFortune.score >= 80 ? 'text-green-500' :
                      chart.overallFortune.score >= 60 ? 'text-blue-500' :
                      chart.overallFortune.score >= 40 ? 'text-yellow-500' :
                      chart.overallFortune.score >= 20 ? 'text-orange-500' :
                      'text-red-500'
                    }`}>
                      {chart.overallFortune.score}
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        종합 점수
                      </div>
                      <div className="text-xl font-bold text-gray-700 dark:text-gray-200">
                        {chart.overallFortune.level === 'excellent' ? '대길 🌟' :
                         chart.overallFortune.level === 'good' ? '길 ✨' :
                         chart.overallFortune.level === 'neutral' ? '평 ⚖️' :
                         chart.overallFortune.level === 'bad' ? '흉 ⚠️' :
                         '대흉 ❌'}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {chart.overallFortune.summary}
                  </p>
                </div>

                <div className="space-y-4">
                  {chart.overallFortune.strengths.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                        ✅ 강점
                      </h3>
                      <ul className="space-y-1">
                        {chart.overallFortune.strengths.map((strength, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 dark:text-gray-300 pl-4 relative before:content-['•'] before:absolute before:left-0"
                          >
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {chart.overallFortune.weaknesses.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                        ⚠️ 약점
                      </h3>
                      <ul className="space-y-1">
                        {chart.overallFortune.weaknesses.map((weakness, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 dark:text-gray-300 pl-4 relative before:content-['•'] before:absolute before:left-0"
                          >
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 주요 특성 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                💎 주요 특성
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 성격 */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                    <span>🎭</span>
                    <span>성격</span>
                  </h3>
                  <ul className="space-y-2">
                    {chart.characteristics.personality.map((trait, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                        • {trait}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 직업 */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                    <span>💼</span>
                    <span>직업</span>
                  </h3>
                  <ul className="space-y-2">
                    {chart.characteristics.career.map((trait, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                        • {trait}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 재물 */}
                <div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                    <span>💰</span>
                    <span>재물</span>
                  </h3>
                  <ul className="space-y-2">
                    {chart.characteristics.wealth.map((trait, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                        • {trait}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 건강 */}
                <div>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                    <span>❤️</span>
                    <span>건강</span>
                  </h3>
                  <ul className="space-y-2">
                    {chart.characteristics.health.map((trait, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                        • {trait}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 인간관계 */}
                <div>
                  <h3 className="text-lg font-semibold text-pink-600 dark:text-pink-400 mb-3 flex items-center gap-2">
                    <span>👥</span>
                    <span>인간관계</span>
                  </h3>
                  <ul className="space-y-2">
                    {chart.characteristics.relationships.map((trait, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                        • {trait}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 대운/유년운 섹션 (NEW!) */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 유년운 (올해 운세) */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl shadow-lg p-6 border border-orange-200 dark:border-orange-800">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span>📅</span>
                  <span>올해 운세 (流年運)</span>
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {chart.yearlyFortune.year}년 ({chart.yearlyFortune.age}세)
                    </div>
                    <div className={`text-3xl font-bold ${
                      chart.yearlyFortune.luckyScore >= 80 ? 'text-green-600' :
                      chart.yearlyFortune.luckyScore >= 60 ? 'text-blue-600' :
                      chart.yearlyFortune.luckyScore >= 40 ? 'text-yellow-600' :
                      chart.yearlyFortune.luckyScore >= 20 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {chart.yearlyFortune.luckyScore}점
                    </div>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      주관 궁위: <strong className="text-orange-600 dark:text-orange-400">{chart.yearlyFortune.palace}</strong> ({chart.yearlyFortune.branch})
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {chart.yearlyFortune.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {chart.yearlyFortune.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 대운 (10년 운세) */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl shadow-lg p-6 border border-purple-200 dark:border-purple-800">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span>🌊</span>
                  <span>현재 대운 (大運)</span>
                </h2>
                {(() => {
                  const currentFortune = chart.majorFortunes.find(
                    f => chart.yearlyFortune.age >= f.startAge && chart.yearlyFortune.age <= f.endAge,
                  );
                  return currentFortune ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {currentFortune.startAge}세 ~ {currentFortune.endAge}세
                        </div>
                        <div className={`text-3xl font-bold ${
                          currentFortune.luckyScore >= 80 ? 'text-green-600' :
                          currentFortune.luckyScore >= 60 ? 'text-blue-600' :
                          currentFortune.luckyScore >= 40 ? 'text-yellow-600' :
                          currentFortune.luckyScore >= 20 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {currentFortune.luckyScore}점
                        </div>
                      </div>
                      <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          주관 궁위: <strong className="text-purple-600 dark:text-purple-400">{currentFortune.palace}</strong> ({currentFortune.branch})
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {currentFortune.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentFortune.keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      대운 정보를 찾을 수 없습니다
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* AI 상담 버튼 */}
            <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 rounded-xl shadow-lg p-6 text-center border border-purple-200 dark:border-purple-800">
              <div className="text-4xl mb-3">🤖⭐</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                AI 상담사와 대화하기
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                자미두수 AI가 {appliedCustomer?.name || '당신'}님의 명반을 분석하여<br />
                직업, 재물, 건강, 결혼 등 궁금한 점을 자세히 답변해드립니다
              </p>

              {/* 질문 선택기 */}
              <QuestionSelector
                questions={ZIWEI_QUESTIONS}
                onSelectQuestion={(question) => setSelectedAIQuestion(question)}
                currentQuestion={selectedAIQuestion}
              />

              <button
                onClick={() => setShowAIChat(true)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🤖 AI 상담 시작하기
              </button>
            </div>

            {/* 12궁위 차트 시각화 */}
            <ZiweiChartView
              chart={chart}
              selectedPalace={selectedPalace}
              onPalaceSelect={setSelectedPalace}
            />

            {/* 선택한 궁위 상세 정보 모달 */}
            {selectedPalace && (
              <ZiweiPalaceDetail
                palace={chart.palaces[selectedPalace]}
                onClose={() => setSelectedPalace(null)}
              />
            )}

            {/* AI 채팅 모달 */}
            {showAIChat && (
              <ZiweiAIChat
                chart={chart}
                customer={appliedCustomer}
                selectedPalace={selectedPalace}
                onClose={() => setShowAIChat(false)}
              />
            )}
          </div>
        )}

        {/* 초보자 가이드 모달 */}
        {showGuide && (
          <ZiweiBeginnerGuide onClose={() => setShowGuide(false)} />
        )}
      </div>
    </div>
  );
}
