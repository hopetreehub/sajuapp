/**
 * 사주분석 초보자 가이드
 *
 * 초보자를 위한 쉬운 설명과 사용 방법 안내
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState } from 'react';

interface SajuBeginnerGuideProps {
  onClose: () => void;
}

export default function SajuBeginnerGuide({ onClose }: SajuBeginnerGuideProps) {
  const [activeTab, setActiveTab] = useState<'what' | 'how' | 'terms'>('what');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">📖 사주분석 초보자 가이드</h2>
              <p className="text-purple-100">사주팔자로 보는 레이더 차트 기반 운명 분석</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="닫기"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('what')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'what'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            사주분석이란?
          </button>
          <button
            onClick={() => setActiveTab('how')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'how'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            사용 방법
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'terms'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            용어 설명
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {activeTab === 'what' && (
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  🔮 사주분석이란?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  사주팔자(四柱八字)는 <strong>태어난 년·월·일·시</strong>의 <strong>천간(天干)과 지지(地支)</strong>를 조합하여
                  총 <strong>8글자</strong>로 운명을 분석하는 동양 철학입니다.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  우리 시스템은 전통 사주학을 현대적으로 재해석하여 <strong>9개 대항목, 수십 개 중항목</strong>으로
                  세분화된 <strong>레이더 차트</strong>로 보여줍니다.
                </p>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    💡 <strong>마치 건강검진처럼</strong>, 인생의 각 영역(직업, 재물, 건강, 인간관계 등)을
                    점수화하여 강점과 약점을 한눈에 파악할 수 있습니다!
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  💡 우리 시스템의 특징
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl mb-2">📊</div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">9개 대항목 분석</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      주본(기본), 육친, 십성, 용신, 격국, 주능, 주흉, 육대성향, 십칠대성향
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-bold text-green-900 dark:text-green-300 mb-1">레이더 차트 시각화</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      각 항목을 0-100점으로 점수화하여 한눈에 비교
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl mb-2">🤖</div>
                    <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-1">AI 맞춤 해석</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-400">
                      궁금한 점을 AI에게 직접 질문하여 상세 답변 받기
                    </p>
                  </div>
                  <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                    <div className="text-2xl mb-2">📄</div>
                    <h4 className="font-bold text-pink-900 dark:text-pink-300 mb-1">PDF 출력 가능</h4>
                    <p className="text-sm text-pink-700 dark:text-pink-400">
                      분석 결과를 PDF로 저장하여 보관 및 인쇄
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  🌟 무엇을 알 수 있나요?
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">📝 주본(主本) - 기본 정보</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      일간(나를 나타내는 글자), 월지, 계절, 음양오행 균형 등 사주의 기초 정보
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">👨‍👩‍👧‍👦 육친(六親) - 인간관계</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      부모, 형제, 배우자, 자녀와의 인연 및 관계의 질
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">⚡ 십성(十星) - 성향 및 재능</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      비견, 식신, 정재, 정관 등 10가지 성향의 균형 상태
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-red-500">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">🌊 용신(用神) - 필요한 에너지</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      사주에 부족하거나 필요한 오행, 보완 방법 제시
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">🏆 격국(格局) - 인생 패턴</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      종재격, 종살격, 식신생재격 등 사주의 전체적인 구조
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">💪 주능(主能) - 핵심 능력</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      리더십, 창의력, 분석력 등 타고난 주요 능력 점수
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-pink-500">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">⚠️ 주흉(主凶) - 주의사항</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      충(沖), 형(刑), 파(破), 해(害) 등 주의해야 할 요소
                    </p>
                  </div>
                </div>
              </section>

              <section className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">
                  ⚠️ 참고사항
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>• 사주분석은 <strong>참고 자료</strong>이지 절대적인 운명이 아닙니다.</li>
                  <li>• 레이더 차트는 상대적 강약을 보여주는 것이므로 <strong>균형</strong>이 중요합니다.</li>
                  <li>• 음력/양력 구분을 정확히 해야 합니다 (1985년 이후는 대부분 양력).</li>
                  <li>• 정확한 태어난 시간(시, 분)을 아는 것이 매우 중요합니다!</li>
                </ul>
              </section>
            </div>
          )}

          {activeTab === 'how' && (
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  📱 화면 구성 및 사용법
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">고객 선택하기</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        화면 상단의 "고객 선택하기"를 눌러 <strong>생년월일시</strong>를 정확히 입력하세요.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> 음력/양력 구분이 매우 중요합니다!
                        시간은 24시간 기준으로 정확히 입력하세요. 예: 오후 2시 = 14:00
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">사주팔자 확인</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        고객을 선택하면 보라색 박스에 <strong>사주팔자 8글자</strong>가 표시됩니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2 space-y-1">
                        <p>💡 예: 辛亥 己亥 甲寅 丙寅 (년주 월주 일주 시주)</p>
                        <p>💡 <strong>일간</strong>(세 번째 칸의 첫 글자)이 나 자신을 의미합니다</p>
                        <p>💡 오행 균형도 함께 표시됩니다 (목/화/토/금/수 비율)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">대항목 선택</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        9개 대항목 중 궁금한 카테고리를 선택하세요.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> 처음이라면 <strong>주본 → 육친 → 십성</strong> 순서로 보는 것을 추천합니다.
                        기본 정보부터 이해한 후 세부 분석으로 들어가세요!
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">중항목 탭 선택</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        대항목을 선택하면 하단에 <strong>중항목 탭</strong>이 나타납니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2 space-y-1">
                        <p>💡 예: "주본" 선택 → "일간", "월지", "계절" 등의 탭 표시</p>
                        <p>💡 각 탭을 클릭하면 해당 항목의 레이더 차트가 변경됩니다</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">5</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">레이더 차트 분석</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        거미줄 모양의 레이더 차트에서 <strong>튀어나온 부분</strong>이 강점, <strong>움푹 들어간 부분</strong>이 약점입니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2 space-y-1">
                        <p>💡 <strong>80-100점</strong>: 매우 강함 (천부적 재능)</p>
                        <p>💡 <strong>60-79점</strong>: 강함 (노력으로 발휘 가능)</p>
                        <p>💡 <strong>40-59점</strong>: 보통 (평균 수준)</p>
                        <p>💡 <strong>20-39점</strong>: 약함 (보완 필요)</p>
                        <p>💡 <strong>0-19점</strong>: 매우 약함 (집중 보완 필요)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">6</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">세부 항목 카드 확인</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        레이더 차트 하단에 각 항목의 <strong>점수, 색상, 설명</strong>이 카드 형태로 표시됩니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> 색상별로 정렬되므로 빨간색(낮은 점수) 항목을 먼저 확인하여 약점을 파악하세요!
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">7</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">AI에게 질문하기</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        우측 상단의 "🤖 AI에게 질문하기" 버튼을 누르면 전문 사주상담사 AI와 대화할 수 있습니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2 space-y-1">
                        <p>💡 예시: "제 사주에서 재물운이 어떤가요?"</p>
                        <p>💡 예시: "정재와 편재의 차이가 뭔가요?"</p>
                        <p>💡 예시: "십성 균형이 안 맞는데 어떻게 보완하나요?"</p>
                        <p>💡 예시: "올해 운세는 어떤가요?"</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">8</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">PDF 출력</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        "📄 PDF 출력" 버튼으로 현재 분석 결과를 PDF로 저장할 수 있습니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> 고객 상담용 자료나 개인 보관용으로 활용하세요. 인쇄도 가능합니다!
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 text-lg">
                  🎯 실전 활용 시나리오
                </h4>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <span>🎓</span>
                      <span>시나리오 1: 자기 이해 및 성격 파악 (입문자)</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> "주본" 대항목 선택<br />
                      <strong>2단계:</strong> "일간" 중항목 확인 → 나를 나타내는 글자 파악<br />
                      <strong>3단계:</strong> "십성" 대항목 선택 → 비견, 식신, 재성 등 비율 확인<br />
                      <strong>4단계:</strong> "육대성향" 선택 → 기본 성격 6가지 확인<br />
                      <strong>5단계:</strong> AI에게 "제 성격을 한 문장으로 요약하면?" 질문<br />
                      <strong>💡 결과:</strong> 나의 기본 성격과 타고난 특성 이해
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <span>💼</span>
                      <span>시나리오 2: 직업 적성 파악</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> "주능" 대항목 선택<br />
                      <strong>2단계:</strong> "업무능력", "창의력", "리더십" 중항목 차례로 확인<br />
                      <strong>3단계:</strong> 70점 이상인 능력 메모<br />
                      <strong>4단계:</strong> "십성" 대항목에서 정관/편관(직장), 정재/편재(사업) 비율 확인<br />
                      <strong>5단계:</strong> AI에게 "제 사주로 공무원과 프리랜서 중 어디가 맞나요?" 질문<br />
                      <strong>💡 결과:</strong> 직장 vs 사업, 안정 vs 도전 중 어디가 맞는지 파악
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <span>💰</span>
                      <span>시나리오 3: 재물운 및 투자 성향</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> "십성" 대항목 선택 → "재성" 중항목 확인<br />
                      <strong>2단계:</strong> 정재(정기 수입) vs 편재(투자 수입) 비율 확인<br />
                      <strong>3단계:</strong> "주본" → "오행균형" 확인 → 금(金)과 수(水) 비율 체크<br />
                      <strong>4단계:</strong> "주능" → "재테크능력" 점수 확인<br />
                      <strong>5단계:</strong> AI에게 "제 사주로 주식투자가 맞나요, 부동산이 맞나요?" 질문<br />
                      <strong>💡 결과:</strong> 재물 형성 방법 및 투자 스타일 파악
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <span>💑</span>
                      <span>시나리오 4: 인간관계 및 결혼운</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> "육친" 대항목 선택<br />
                      <strong>2단계:</strong> "배우자" 중항목 확인 → 점수와 특성 파악<br />
                      <strong>3단계:</strong> "십성" → "관성"(여자), "재성"(남자) 중항목 확인<br />
                      <strong>4단계:</strong> "주흉" 대항목에서 "충(沖)"이 있는지 확인 (갈등 요소)<br />
                      <strong>5단계:</strong> AI에게 "제 배우자는 어떤 성격일까요?" 질문<br />
                      <strong>💡 결과:</strong> 이상형, 결혼 시기, 배우자 타입 파악
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <span>⚡</span>
                      <span>시나리오 5: 약점 보완 및 개선 방향</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> 모든 대항목을 빠르게 훑어보며 빨간색(낮은 점수) 항목 체크<br />
                      <strong>2단계:</strong> "용신" 대항목 선택 → 부족한 오행 확인<br />
                      <strong>3단계:</strong> 약한 항목들 리스트업 (예: 건강, 인내력, 대인관계 등)<br />
                      <strong>4단계:</strong> AI에게 "제 사주에서 토(土)가 부족한데 어떻게 보완하나요?" 질문<br />
                      <strong>5단계:</strong> 방향, 색상, 직업, 주거지 등 보완 방법 실천<br />
                      <strong>💡 결과:</strong> 약점을 미리 알고 의식적으로 보완하여 균형 개선
                    </p>
                  </div>
                </div>
              </section>

              <section className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">
                  ⚠️ 자주 묻는 질문 (FAQ)
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 font-bold">Q:</span>
                    <div>
                      <strong>레이더 차트가 한쪽으로 치우쳐 있어요. 나쁜 건가요?</strong><br />
                      A: 아닙니다! 강한 영역이 있다는 뜻입니다. 오히려 <strong>특화된 재능</strong>이 있다고 볼 수 있습니다.
                      다만 약한 부분을 보완하면 더 좋습니다.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 font-bold">Q:</span>
                    <div>
                      <strong>대항목이 9개나 되는데 다 봐야 하나요?</strong><br />
                      A: 처음엔 <strong>주본, 육친, 십성</strong> 3가지만 집중하세요.
                      익숙해지면 나머지도 천천히 보시면 됩니다.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 font-bold">Q:</span>
                    <div>
                      <strong>점수가 낮은 항목이 많아요. 운이 없는 건가요?</strong><br />
                      A: 점수가 낮다는 것은 <strong>노력이 필요한 영역</strong>이라는 뜻입니다.
                      미리 알았으니 대비할 수 있습니다! 용신(用神)을 참고하여 보완하세요.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 font-bold">Q:</span>
                    <div>
                      <strong>중항목 탭이 너무 많아서 어떤 것부터 봐야 할지 모르겠어요.</strong><br />
                      A: 각 대항목의 <strong>첫 번째 탭</strong>부터 순서대로 보시면 됩니다.
                      시스템이 중요도 순으로 배치했습니다.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 font-bold">Q:</span>
                    <div>
                      <strong>사주팔자가 안 좋게 나왔는데 바꿀 수 있나요?</strong><br />
                      A: 타고난 사주는 바꿀 수 없지만, <strong>운(運)은 노력으로 바꿀 수 있습니다</strong>.
                      용신을 보강하고, 약한 부분을 의식적으로 개선하세요!
                    </div>
                  </li>
                </ul>
              </section>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  🌳 오행(五行) - 5가지 기본 에너지
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  우주 만물을 구성하는 5가지 기본 요소입니다.
                </p>
                <div className="grid md:grid-cols-5 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <div className="text-3xl mb-1">🌳</div>
                    <div className="font-bold text-green-900 dark:text-green-300">목(木)</div>
                    <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                      나무, 성장<br/>봄, 동쪽<br/>인자함, 유연함
                    </div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                    <div className="text-3xl mb-1">🔥</div>
                    <div className="font-bold text-red-900 dark:text-red-300">화(火)</div>
                    <div className="text-xs text-red-700 dark:text-red-400 mt-1">
                      불, 열정<br/>여름, 남쪽<br/>활동적, 명예
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                    <div className="text-3xl mb-1">🏔️</div>
                    <div className="font-bold text-yellow-900 dark:text-yellow-300">토(土)</div>
                    <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                      흙, 안정<br/>환절기, 중앙<br/>믿음직, 중재
                    </div>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <div className="text-3xl mb-1">⚔️</div>
                    <div className="font-bold text-gray-900 dark:text-gray-300">금(金)</div>
                    <div className="text-xs text-gray-700 dark:text-gray-400 mt-1">
                      금속, 결단<br/>가을, 서쪽<br/>강인함, 의리
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <div className="text-3xl mb-1">💧</div>
                    <div className="font-bold text-blue-900 dark:text-blue-300">수(水)</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      물, 지혜<br/>겨울, 북쪽<br/>부드러움, 융통성
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    💡 <strong>상생(相生)</strong>: 木→火→土→金→水→木 (서로 생해줌)<br/>
                    💡 <strong>상극(相剋)</strong>: 木剋土, 土剋水, 水剋火, 火剋金, 金剋木 (서로 제압)
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  ⚡ 십성(十星) - 10가지 성향
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  일간(나)을 기준으로 다른 글자들과의 관계를 10가지로 분류합니다.
                </p>
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-bold text-blue-900 dark:text-blue-300 mb-1">비견(比肩)</div>
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        나와 같은 오행. 독립심, 자존심, 경쟁심
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-bold text-blue-900 dark:text-blue-300 mb-1">겁재(劫財)</div>
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        비견과 유사. 과감함, 행동력, 변화 추구
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="font-bold text-green-900 dark:text-green-300 mb-1">식신(食神)</div>
                      <div className="text-sm text-green-700 dark:text-green-400">
                        표현력, 여유, 예술성, 복록
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="font-bold text-green-900 dark:text-green-300 mb-1">상관(傷官)</div>
                      <div className="text-sm text-green-700 dark:text-green-400">
                        재능, 비판력, 창의력, 예민함
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="font-bold text-yellow-900 dark:text-yellow-300 mb-1">편재(偏財)</div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-400">
                        사업, 투자, 변동재물, 활동성
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="font-bold text-yellow-900 dark:text-yellow-300 mb-1">정재(正財)</div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-400">
                        월급, 안정적 수입, 근면 성실
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="font-bold text-purple-900 dark:text-purple-300 mb-1">편관(偏官)</div>
                      <div className="text-sm text-purple-700 dark:text-purple-400">
                        강한 추진력, 도전, 무예, 권력
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="font-bold text-purple-900 dark:text-purple-300 mb-1">정관(正官)</div>
                      <div className="text-sm text-purple-700 dark:text-purple-400">
                        명예, 지위, 공직, 질서, 책임감
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                      <div className="font-bold text-pink-900 dark:text-pink-300 mb-1">편인(偏印)</div>
                      <div className="text-sm text-pink-700 dark:text-pink-400">
                        독특한 학문, 예술, 종교, 철학
                      </div>
                    </div>
                    <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                      <div className="font-bold text-pink-900 dark:text-pink-300 mb-1">정인(正印)</div>
                      <div className="text-sm text-pink-700 dark:text-pink-400">
                        학문, 지혜, 명예, 어머니, 보호
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  👨‍👩‍👧‍👦 육친(六親) - 6가지 인간관계
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  사주에서 가족 및 주변 사람들과의 관계를 나타냅니다.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="font-bold text-indigo-900 dark:text-indigo-300 mb-1">부모</div>
                    <div className="text-xs text-indigo-700 dark:text-indigo-400">
                      인성(정인/편인)으로 판단<br/>교육, 보호, 지혜 전수
                    </div>
                  </div>
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <div className="font-bold text-teal-900 dark:text-teal-300 mb-1">형제자매</div>
                    <div className="text-xs text-teal-700 dark:text-teal-400">
                      비겁(비견/겁재)으로 판단<br/>협력 또는 경쟁 관계
                    </div>
                  </div>
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                    <div className="font-bold text-rose-900 dark:text-rose-300 mb-1">배우자</div>
                    <div className="text-xs text-rose-700 dark:text-rose-400">
                      남자: 재성(정재/편재)<br/>여자: 관성(정관/편관)
                    </div>
                  </div>
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                    <div className="font-bold text-cyan-900 dark:text-cyan-300 mb-1">자녀</div>
                    <div className="text-xs text-cyan-700 dark:text-cyan-400">
                      식상(식신/상관)으로 판단<br/>표현, 창의성, 후손
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="font-bold text-amber-900 dark:text-amber-300 mb-1">친구/동료</div>
                    <div className="text-xs text-amber-700 dark:text-amber-400">
                      비겁으로 판단<br/>경쟁 또는 협업 관계
                    </div>
                  </div>
                  <div className="p-3 bg-lime-50 dark:bg-lime-900/20 rounded-lg">
                    <div className="font-bold text-lime-900 dark:text-lime-300 mb-1">상사/직장</div>
                    <div className="text-xs text-lime-700 dark:text-lime-400">
                      관성으로 판단<br/>권위, 책임, 규율
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-2">
                  🎯 간단히 기억하세요!
                </h4>
                <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                  <li>• <strong>오행</strong>: 목/화/토/금/수 = 내 몸의 에너지 균형</li>
                  <li>• <strong>십성</strong>: 나를 중심으로 한 10가지 관계 (성격/재능 판단)</li>
                  <li>• <strong>육친</strong>: 가족/주변 사람과의 인연 (인간관계 판단)</li>
                  <li>• <strong>용신</strong>: 부족한 오행을 채워주는 보약 같은 존재</li>
                </ul>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-3">
                  💡 이 4가지 개념만 이해해도 사주분석의 70%는 이해할 수 있습니다!
                </p>
              </section>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
