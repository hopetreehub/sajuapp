/**
 * 자미두수 초보자 가이드
 *
 * 초보자를 위한 쉬운 설명과 사용 방법 안내
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState } from 'react';

interface ZiweiBeginnerGuideProps {
  onClose: () => void;
}

export default function ZiweiBeginnerGuide({ onClose }: ZiweiBeginnerGuideProps) {
  const [activeTab, setActiveTab] = useState<'what' | 'how' | 'terms'>('what');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">📖 자미두수 초보자 가이드</h2>
              <p className="text-purple-100">송나라 시대부터 전해지는 정밀 운명 분석 시스템</p>
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
            자미두수란?
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
                  ⭐ 자미두수란?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  자미두수(紫微斗數)는 <strong>태어난 생년월일시</strong>를 바탕으로
                  <strong> 14개의 주요 별(14주성)</strong>과 <strong>12개의 인생 영역(12궁위)</strong>을 분석하는
                  중국 송나라 시대부터 전해지는 운명 분석 시스템입니다.
                </p>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    💡 <strong>마치 당신만의 우주 지도처럼</strong>, 태어날 때 하늘의 별자리 배치를 기록하여
                    성격, 직업, 재물, 건강, 결혼 등 인생 전반을 깊이 있게 이해할 수 있습니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  💡 무엇을 알 수 있나요?
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl mb-2">🎭</div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">성격과 재능</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      타고난 성격, 강점, 약점, 인생에서 중요하게 여기는 가치관
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl mb-2">💼</div>
                    <h4 className="font-bold text-green-900 dark:text-green-300 mb-1">직업과 재물</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      적성에 맞는 직업, 재물운, 사업 성공 가능성
                    </p>
                  </div>
                  <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                    <div className="text-2xl mb-2">💑</div>
                    <h4 className="font-bold text-pink-900 dark:text-pink-300 mb-1">결혼과 인간관계</h4>
                    <p className="text-sm text-pink-700 dark:text-pink-400">
                      배우자 운, 연애 스타일, 가족 관계, 친구 관계
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl mb-2">❤️</div>
                    <h4 className="font-bold text-red-900 dark:text-red-300 mb-1">건강과 수명</h4>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      주의해야 할 건강 문제, 체질, 장수 가능성
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl mb-2">📅</div>
                    <h4 className="font-bold text-orange-900 dark:text-orange-300 mb-1">대운과 유년운</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                      10년 단위 인생 변화, 매년 달라지는 운세
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl mb-2">🏠</div>
                    <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-1">자녀와 가정</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-400">
                      자녀 운, 가정 생활, 부모와의 인연
                    </p>
                  </div>
                </div>
              </section>

              <section className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">
                  ⚠️ 참고사항
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>• 자미두수는 태어난 시간이 <strong>매우 중요</strong>합니다. 정확한 시간을 입력하세요.</li>
                  <li>• 음력/양력 구분이 중요합니다. 1985년 이후 출생자는 대부분 양력입니다.</li>
                  <li>• 운명은 고정된 것이 아니라 <strong>참고하고 준비하는 도구</strong>입니다.</li>
                  <li>• 부정적인 해석도 나올 수 있지만, 미리 알고 대비하면 피해갈 수 있습니다!</li>
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
                        화면 상단의 "고객 선택하기" 버튼을 눌러 <strong>생년월일시</strong>를 입력하세요.
                        이미 등록된 고객이 있다면 선택만 하면 됩니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> 음력/양력 구분이 매우 중요합니다! 1985년 이후 출생자는 대부분 양력입니다.
                        태어난 시간(시, 분)을 정확히 입력할수록 분석이 정확해집니다.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">기본 명반 정보 확인</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        첫 번째 카드에서 <strong>납음오행 국수</strong>, <strong>명궁</strong>, <strong>신궁</strong>을 확인할 수 있습니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2 space-y-1">
                        <p>💡 <strong>명궁(命宮)</strong>: 당신의 핵심 성격과 인생 방향</p>
                        <p>💡 <strong>신궁(身宮)</strong>: 중년 이후 인생에서 중요해지는 영역</p>
                        <p>💡 <strong>납음오행 국수</strong>: 수국(2), 목국(3), 금국(4), 토국(5), 화국(6) 중 하나</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">종합 운세 점수</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        두 번째 카드에서 <strong>종합 점수(0-100점)</strong>를 확인할 수 있습니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> 70점 이상이면 매우 좋은 명반입니다.
                        50-70점은 평균, 50점 미만은 주의가 필요하지만 노력으로 극복 가능합니다!
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">주요 특성 5가지</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        세 번째 카드에서 <strong>성격, 직업, 재물, 건강, 인간관계</strong> 5가지 핵심 특성을 확인하세요.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> 각 영역별로 3-5개씩 키워드가 나옵니다.
                        자신과 맞는지 체크하고, 특히 <strong>직업</strong> 부분은 진로 선택 시 참고하세요!
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">5</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">올해 운세 (유년운)</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        네 번째 섹션에서 <strong>올해(2025년) 운세</strong>를 확인할 수 있습니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> 올해 주관 궁위가 어디인지 확인하세요.
                        예를 들어 재백궁이면 재물운이, 관록궁이면 직장운이 특히 중요한 해입니다!
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">6</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">현재 대운 (10년 운세)</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        대운은 <strong>10년 단위</strong>로 변화하는 큰 흐름입니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2 space-y-1">
                        <p>💡 예: 20-29세는 복덕궁 대운 → 학업과 자기계발의 시기</p>
                        <p>💡 예: 30-39세는 재백궁 대운 → 재물 형성의 중요한 시기</p>
                        <p>💡 <strong>실전 팁:</strong> 현재 대운의 키워드를 보고 이 10년 동안 집중할 분야를 파악하세요!</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">7</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">12궁위 차트 보기</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        하단의 <strong>12궁위 차트</strong>를 보면 각 인생 영역에 어떤 별들이 있는지 시각적으로 확인할 수 있습니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> 각 궁위를 클릭하면 상세 해석이 나옵니다.
                        특히 관심 있는 영역(부부궁, 재백궁, 관록궁 등)을 중점적으로 확인하세요!
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">8</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">AI 상담사에게 질문하기</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        "🤖 AI 상담 시작하기" 버튼을 누르면 궁금한 점을 자유롭게 물어볼 수 있습니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2 space-y-1">
                        <p>💡 예시 질문: "제 명반에서 재물운이 어떤가요?"</p>
                        <p>💡 예시 질문: "올해 전직하려고 하는데 괜찮을까요?"</p>
                        <p>💡 예시 질문: "결혼 운은 언제쯤 좋아지나요?"</p>
                        <p>💡 예시 질문: "자녀 궁에 있는 별들은 무슨 의미인가요?"</p>
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
                      <span>시나리오 1: 진로 결정 (20대 초반)</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> 주요 특성 카드에서 "직업" 섹션 확인<br />
                      <strong>2단계:</strong> 관록궁(사업/직장 운)을 클릭하여 상세 보기<br />
                      <strong>3단계:</strong> 현재 대운의 키워드 확인 (학업? 창업? 취업?)<br />
                      <strong>4단계:</strong> AI에게 "제 명반으로 공무원과 민간 기업 중 어디가 더 맞나요?" 질문<br />
                      <strong>5단계:</strong> 종합하여 진로 방향 설정
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <span>💑</span>
                      <span>시나리오 2: 결혼 시기 및 배우자 타입</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> 부부궁을 클릭하여 어떤 별들이 있는지 확인<br />
                      <strong>2단계:</strong> 주요 특성에서 "인간관계" 확인<br />
                      <strong>3단계:</strong> 유년운과 대운에서 부부궁이 활성화되는 시기 찾기<br />
                      <strong>4단계:</strong> AI에게 "제 명반으로 볼 때 배우자는 어떤 성격일까요?" 질문<br />
                      <strong>5단계:</strong> 복덕궁과 부부궁을 교차 확인 (이상형과 실제 배우자 타입)
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <span>💰</span>
                      <span>시나리오 3: 재테크 및 사업 타이밍</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> 재백궁(재물 운)을 클릭하여 상세 확인<br />
                      <strong>2단계:</strong> 주요 특성에서 "재물" 키워드 확인<br />
                      <strong>3단계:</strong> 올해 운세(유년운)의 점수가 60점 이상인지 체크<br />
                      <strong>4단계:</strong> 현재 대운이 재물과 관련된 궁위인지 확인<br />
                      <strong>5단계:</strong> AI에게 "지금 창업하면 성공할 수 있을까요?" 질문<br />
                      <strong>6단계:</strong> 부정적이라면 언제가 좋을지 재문의
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <span>❤️</span>
                      <span>시나리오 4: 건강 관리 포인트</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> 질액궁(건강 운)을 클릭하여 주의사항 확인<br />
                      <strong>2단계:</strong> 주요 특성에서 "건강" 섹션의 키워드 정리<br />
                      <strong>3단계:</strong> 약한 부위(예: 호흡기, 소화기 등) 파악<br />
                      <strong>4단계:</strong> AI에게 "제 명반으로 볼 때 어떤 건강 검진을 받아야 하나요?" 질문<br />
                      <strong>5단계:</strong> 매년 건강검진 항목 선택 시 참고
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
                      <strong>종합 점수가 낮게 나왔어요. 인생이 불행한 건가요?</strong><br />
                      A: 아닙니다! 점수는 타고난 명반의 강약일 뿐입니다. 노력, 환경, 교육으로 얼마든지 극복 가능합니다.
                      오히려 약한 부분을 미리 알고 대비하는 것이 더 유리합니다!
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 font-bold">Q:</span>
                    <div>
                      <strong>태어난 시간을 정확히 모르는데 어떻게 하나요?</strong><br />
                      A: 부모님께 확인하거나, 출생증명서를 확인하세요.
                      정말 모르겠다면 오전(09:00), 정오(12:00), 오후(15:00) 등 추정 시간으로 입력 후
                      "명궁"이 자신과 맞는지 확인해보세요.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 font-bold">Q:</span>
                    <div>
                      <strong>12궁위가 너무 복잡해요. 어디부터 봐야 하나요?</strong><br />
                      A: 처음엔 <strong>명궁, 재백궁, 관록궁, 부부궁</strong> 4가지만 집중하세요.
                      이것만으로도 성격, 재물, 직업, 결혼을 파악할 수 있습니다!
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 font-bold">Q:</span>
                    <div>
                      <strong>대운과 유년운은 뭐가 다른가요?</strong><br />
                      A: <strong>대운</strong>은 10년 단위 큰 흐름(예: 20대 전반은 학업 시기),
                      <strong>유년운</strong>은 그 해만의 운세(예: 2025년은 직장 변동의 해)입니다.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 font-bold">Q:</span>
                    <div>
                      <strong>음력 생일인데 양력으로 입력하면 결과가 달라지나요?</strong><br />
                      A: 네! 완전히 다른 결과가 나옵니다. 반드시 정확하게 선택하세요.
                      1985년 이후 출생자는 대부분 양력입니다.
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
                  ⭐ 14주성(十四主星) - 14개의 주요 별
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  자미두수의 핵심! 14개의 별이 12궁위에 배치되어 운명을 결정합니다.
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-purple-700 dark:text-purple-400 mb-2">
                      👑 자미성계 (紫微星系) - 황제의 별들
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <strong>자미성</strong>: 황제, 리더십, 고귀함
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <strong>천기성</strong>: 지혜, 계획, 참모
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <strong>태양성</strong>: 명예, 권위, 남성성
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <strong>무곡성</strong>: 재물, 식복, 풍요
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <strong>천동성</strong>: 복덕, 평화, 안정
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                        <strong>염정성</strong>: 재능, 예술, 매력
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2">
                      💼 천부성계 (天府星系) - 재상의 별들
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <strong>천부성</strong>: 재물, 보수적, 안정
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <strong>태음성</strong>: 모성, 부드러움, 여성성
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <strong>탐랑성</strong>: 욕망, 다재다능, 변화
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <strong>거문성</strong>: 문학, 예술, 섬세함
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <strong>천상성</strong>: 희생, 박애, 종교
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <strong>천량성</strong>: 장수, 의료, 봉사
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <strong>칠살성</strong>: 무예, 용맹, 강단
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <strong>파군성</strong>: 개척, 파괴, 혁신
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  🏛️ 12궁위(十二宮位) - 12개 인생 영역
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  인생의 12가지 중요한 영역을 나타냅니다.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-bold text-green-900 dark:text-green-300 mb-1">1. 명궁 (命宮)</div>
                    <div className="text-sm text-green-700 dark:text-green-400">
                      성격, 외모, 인생 방향의 핵심
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-bold text-blue-900 dark:text-blue-300 mb-1">2. 부모궁 (父母宮)</div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">
                      부모 인연, 유년기 환경
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="font-bold text-purple-900 dark:text-purple-300 mb-1">3. 복덕궁 (福德宮)</div>
                    <div className="text-sm text-purple-700 dark:text-purple-400">
                      행복, 취미, 정신세계
                    </div>
                  </div>
                  <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                    <div className="font-bold text-pink-900 dark:text-pink-300 mb-1">4. 전택궁 (田宅宮)</div>
                    <div className="text-sm text-pink-700 dark:text-pink-400">
                      부동산 운, 집안 환경
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="font-bold text-yellow-900 dark:text-yellow-300 mb-1">5. 관록궁 (官祿宮)</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-400">
                      직업, 사회적 지위, 사업운
                    </div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="font-bold text-red-900 dark:text-red-300 mb-1">6. 노복궁 (奴僕宮)</div>
                    <div className="text-sm text-red-700 dark:text-red-400">
                      친구, 부하, 동료 관계
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="font-bold text-orange-900 dark:text-orange-300 mb-1">7. 천이궁 (遷移宮)</div>
                    <div className="text-sm text-orange-700 dark:text-orange-400">
                      외지 생활, 여행, 이동 운
                    </div>
                  </div>
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <div className="font-bold text-teal-900 dark:text-teal-300 mb-1">8. 질액궁 (疾厄宮)</div>
                    <div className="text-sm text-teal-700 dark:text-teal-400">
                      건강, 질병, 체질
                    </div>
                  </div>
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                    <div className="font-bold text-cyan-900 dark:text-cyan-300 mb-1">9. 재백궁 (財帛宮)</div>
                    <div className="text-sm text-cyan-700 dark:text-cyan-400">
                      재물 운, 돈 관리 능력
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="font-bold text-indigo-900 dark:text-indigo-300 mb-1">10. 자녀궁 (子女宮)</div>
                    <div className="text-sm text-indigo-700 dark:text-indigo-400">
                      자녀 운, 자녀와의 인연
                    </div>
                  </div>
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                    <div className="font-bold text-rose-900 dark:text-rose-300 mb-1">11. 부부궁 (夫妻宮)</div>
                    <div className="text-sm text-rose-700 dark:text-rose-400">
                      결혼 운, 배우자 타입
                    </div>
                  </div>
                  <div className="p-3 bg-lime-50 dark:bg-lime-900/20 rounded-lg">
                    <div className="font-bold text-lime-900 dark:text-lime-300 mb-1">12. 형제궁 (兄弟宮)</div>
                    <div className="text-sm text-lime-700 dark:text-lime-400">
                      형제자매, 동업자 관계
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-2">
                  🎯 간단히 기억하세요!
                </h4>
                <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                  <li>• <strong>명궁</strong>: 나 자신 (성격/외모)</li>
                  <li>• <strong>재백궁</strong>: 돈 (재물운)</li>
                  <li>• <strong>관록궁</strong>: 직업 (사회적 성공)</li>
                  <li>• <strong>부부궁</strong>: 결혼 (배우자/연애)</li>
                  <li>• <strong>복덕궁</strong>: 행복 (정신적 만족)</li>
                </ul>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-3">
                  💡 이 5가지만 제대로 이해해도 자미두수의 80%는 알 수 있습니다!
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
