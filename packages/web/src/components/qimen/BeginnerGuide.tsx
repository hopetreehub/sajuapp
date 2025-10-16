/**
 * 귀문둔갑 초보자 가이드
 *
 * 초보자를 위한 쉬운 설명과 사용 방법 안내
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState } from 'react';

interface BeginnerGuideProps {
  onClose: () => void;
}

export default function BeginnerGuide({ onClose }: BeginnerGuideProps) {
  const [activeTab, setActiveTab] = useState<'what' | 'how' | 'terms'>('what');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">📖 귀문둔갑 초보자 가이드</h2>
              <p className="text-purple-100">처음이시라면 여기서 시작하세요!</p>
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
            귀문둔갑이란?
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
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          {activeTab === 'what' && (
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  🔮 귀문둔갑이란?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  귀문둔갑(奇門遁甲)은 <strong>시간과 방위의 길흉</strong>을 알려주는 중국 고대 점술입니다.
                  마치 날씨 예보처럼, <strong>특정 시간과 방향이 나에게 유리한지 불리한지</strong>를 미리 알 수 있게 해줍니다.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  💡 어디에 활용하나요?
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl mb-2">🚗</div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">여행/출장</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      어느 방향으로 갈 때 길한지 확인
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl mb-2">💼</div>
                    <h4 className="font-bold text-green-900 dark:text-green-300 mb-1">비즈니스</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      중요한 미팅 방향과 시간 선택
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl mb-2">🏠</div>
                    <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-1">부동산</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-400">
                      이사 방향과 집 구조 배치 결정
                    </p>
                  </div>
                  <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                    <div className="text-2xl mb-2">💰</div>
                    <h4 className="font-bold text-pink-900 dark:text-pink-300 mb-1">투자</h4>
                    <p className="text-sm text-pink-700 dark:text-pink-400">
                      재물운이 좋은 시간대 파악
                    </p>
                  </div>
                </div>
              </section>

              <section className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">
                  ⚠️ 주의사항
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>• 귀문둔갑은 참고 도구입니다. 절대적인 것이 아닙니다.</li>
                  <li>• 중요한 결정은 신중하게 여러 요소를 고려하세요.</li>
                  <li>• 긍정적인 마음가짐이 가장 중요합니다!</li>
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
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">3x3 구궁 차트</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        9개 칸이 각각 <strong>방위(동서남북 등)</strong>를 나타냅니다.
                        각 칸을 클릭하면 그 방향의 상세 정보를 볼 수 있습니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> 점수가 70점 이상인 방위를 찾아 클릭해보세요. 팔문, 구성, 팔신의 조합이 왜 좋은지 상세하게 설명됩니다.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">길흉 표시 및 점수</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        각 방위마다 이모지와 점수로 길흉을 표시합니다:
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                          🌟 대길 (80-100점)
                        </span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                          ✨ 길 (60-79점)
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                          ⚖️ 평 (40-59점)
                        </span>
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm">
                          ⚠️ 흉 (20-39점)
                        </span>
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm">
                          ❌ 대흉 (0-19점)
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> 점수 차이가 크지 않다면(예: 55점 vs 62점) 너무 집착하지 마세요. 전체적인 운세가 중요합니다.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">시간 선택 및 비교</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        "시간 선택" 버튼을 눌러 <strong>과거나 미래 시간</strong>의 길흉을 확인할 수 있습니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> "시간대 비교" 버튼을 클릭하면 여러 시간대를 한눈에 비교할 수 있습니다. 중요한 일정은 미리 2-3개 시간대를 비교해보세요!
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">목적 선택 (매우 중요!)</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        화면 상단의 <strong>"🎯 목적"</strong> 드롭다운에서 현재 상황에 맞는 목적을 선택하세요.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2 space-y-1">
                        <p>💡 <strong>여행</strong>: 안전하고 즐거운 여행을 위한 방위 제시</p>
                        <p>💡 <strong>비즈니스</strong>: 계약, 협상에 유리한 방위와 시간</p>
                        <p>💡 <strong>투자</strong>: 재물운이 좋은 방향과 타이밍</p>
                        <p>💡 <strong>건강</strong>: 치료나 요양에 좋은 방위</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">5</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">고객 정보 적용 (선택사항)</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        "고객 선택하기"로 생년월일을 입력하면 <strong>개인 맞춤 해석</strong>을 받을 수 있습니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2">
                        💡 <strong>실전 팁:</strong> 같은 시간이라도 생년월일에 따라 길흉이 달라질 수 있습니다. 정확한 해석을 원하면 꼭 입력하세요!
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">6</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">AI에게 질문하기</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        "🤖 AI에게 질문하기" 버튼을 누르면 궁금한 점을 직접 물어볼 수 있습니다.
                      </p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded mt-2 space-y-1">
                        <p>💡 예시 질문: "내일 오후 2시에 동쪽으로 미팅 가는데 괜찮을까요?"</p>
                        <p>💡 예시 질문: "이번 주 남쪽 방향 출장은 언제가 가장 좋을까요?"</p>
                        <p>💡 예시 질문: "재물운이 좋은 시간대를 알려주세요."</p>
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
                      <span>💼</span>
                      <span>시나리오 1: 중요한 비즈니스 미팅</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> 목적을 "비즈니스"로 선택<br />
                      <strong>2단계:</strong> 미팅 날짜/시간 입력 후 차트 확인<br />
                      <strong>3단계:</strong> 70점 이상인 방위 찾기<br />
                      <strong>4단계:</strong> 해당 방위를 클릭하여 상세 정보 확인<br />
                      <strong>5단계:</strong> 가능하면 그 방향의 장소를 선택하거나, 회의실에서 그 방향에 앉기
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <span>✈️</span>
                      <span>시나리오 2: 주말 여행 계획</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> 목적을 "여행"으로 선택<br />
                      <strong>2단계:</strong> "시간대 비교"로 토요일/일요일 비교<br />
                      <strong>3단계:</strong> 더 점수가 높은 날 선택<br />
                      <strong>4단계:</strong> 길한 방위(동/서/남/북)를 확인<br />
                      <strong>5단계:</strong> 해당 방향의 여행지를 우선 고려
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <span>🏠</span>
                      <span>시나리오 3: 이사 날짜 및 방향 결정</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> 목적을 "부동산"으로 선택<br />
                      <strong>2단계:</strong> 고객 정보(생년월일) 입력<br />
                      <strong>3단계:</strong> 이사 가능한 여러 날짜를 "시간대 비교"로 체크<br />
                      <strong>4단계:</strong> 종합 점수가 가장 높은 날 선택<br />
                      <strong>5단계:</strong> 현재 집에서 새 집 방향이 길한지 확인<br />
                      <strong>6단계:</strong> AI에게 "이날 북쪽으로 이사 가는데 괜찮을까요?" 질문
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <span>📅</span>
                      <span>시나리오 4: 매일 아침 운세 체크 루틴</span>
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>1단계:</strong> 아침에 앱을 열면 자동으로 현재 시간 차트 표시<br />
                      <strong>2단계:</strong> 전체 운세 점수 확인 (70점 이상이면 좋은 날!)<br />
                      <strong>3단계:</strong> "길한 방위"를 메모해두기<br />
                      <strong>4단계:</strong> 하루 동안 중요한 일은 그 방향에서 하거나 그 방향을 향해 진행<br />
                      <strong>5단계:</strong> "불리한 방위"는 가급적 피하기
                    </p>
                  </div>
                </div>
              </section>

              <section className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">
                  ⚠️ 주의사항 및 FAQ
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0">Q:</span>
                    <div>
                      <strong>점수가 낮은 날은 아무것도 하면 안 되나요?</strong><br />
                      A: 아닙니다! 40점 이상이면 일상적인 활동은 괜찮습니다. 다만 중요한 결정이나 큰 계약은 피하는 것이 좋습니다.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0">Q:</span>
                    <div>
                      <strong>모든 방위가 평범한 날은 어떻게 하나요?</strong><br />
                      A: 상대적으로 점수가 높은 방위를 선택하거나, 시간대를 바꿔서 다시 확인해보세요.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0">Q:</span>
                    <div>
                      <strong>차트가 2시간마다 바뀐다고 하는데, 정각에만 바뀌나요?</strong><br />
                      A: 네, 정확히는 자시(23-01시), 축시(01-03시) 등 2시간 단위로 바뀝니다. 홀수 시각 정각에 갱신됩니다.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0">Q:</span>
                    <div>
                      <strong>생년월일을 입력했는데 점수가 별로 안 변했어요.</strong><br />
                      A: 생년월일의 영향은 보너스 점수로 작용합니다(±10점 내외). 기본 차트가 더 중요하므로 크게 걱정하지 마세요.
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
                  🚪 팔문(八門) - 8개의 문
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  각 방위에 배치된 "문"으로, 그 방향의 에너지를 나타냅니다.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-bold text-green-900 dark:text-green-300">휴문 · 생문 · 개문</div>
                    <div className="text-sm text-green-700 dark:text-green-400">→ 좋은 문 (휴식, 성장, 시작)</div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-bold text-blue-900 dark:text-blue-300">경문</div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">→ 명예와 영광의 문</div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="font-bold text-red-900 dark:text-red-300">상문 · 두문 · 사문</div>
                    <div className="text-sm text-red-700 dark:text-red-400">→ 안 좋은 문 (갈등, 막힘, 종결)</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="font-bold text-gray-900 dark:text-gray-300">놀문</div>
                    <div className="text-sm text-gray-700 dark:text-gray-400">→ 변화의 문 (좋을수도 나쁠수도)</div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  ⭐ 구성(九星) - 9개의 별
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  하늘의 별처럼, 각 방위의 기운을 더해주는 요소입니다.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>천임, 천보, 천심, 천금</strong> = 좋은 별 (신뢰, 지원, 치유, 균형)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-red-600">⚠️</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>천봉, 천예</strong> = 안 좋은 별 (간계, 질병)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-blue-600">⚖️</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>천충, 천영, 천주</strong> = 중립 별 (변화, 명예, 권위)
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  🛡️ 팔신(八神) - 8개의 신
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  각 방위를 지키는 수호신 같은 존재입니다.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-bold text-green-900 dark:text-green-300">직부 · 태음 · 육합 · 구지 · 구천</div>
                    <div className="text-sm text-green-700 dark:text-green-400">→ 좋은 신</div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="font-bold text-red-900 dark:text-red-300">등사 · 백호 · 현무</div>
                    <div className="text-sm text-red-700 dark:text-red-400">→ 안 좋은 신</div>
                  </div>
                </div>
              </section>

              <section className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-2">
                  🎯 간단히 기억하세요!
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  복잡해 보이지만, <strong>각 방위를 클릭하면 쉬운 말로 설명</strong>이 나옵니다.
                  처음에는 <strong>🌟✨ 이모지가 많은 방향</strong>을 선택하세요!
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
