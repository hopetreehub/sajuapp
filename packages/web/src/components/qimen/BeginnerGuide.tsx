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
                  📱 화면 구성
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">3x3 구궁 차트</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        9개 칸이 각각 <strong>방위(동서남북 등)</strong>를 나타냅니다.
                        각 칸을 클릭하면 그 방향의 상세 정보를 볼 수 있습니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">길흉 표시</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                        각 방위마다 이모지로 길흉을 표시합니다:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                          🌟 대길 - 매우 좋음
                        </span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                          ✨ 길 - 좋음
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                          ⚖️ 평 - 보통
                        </span>
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm">
                          ⚠️ 흉 - 나쁨
                        </span>
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm">
                          ❌ 대흉 - 매우 나쁨
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">시간 선택</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        "시간 선택" 버튼을 눌러 <strong>과거나 미래 시간</strong>의 길흉을 확인할 수 있습니다.
                        중요한 약속이 있다면 미리 확인해보세요!
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
                  💡 활용 팁
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                  <li>✓ <strong>중요한 약속 전</strong>: 미팅 시간의 차트를 확인하여 유리한 방향 파악</li>
                  <li>✓ <strong>여행 계획</strong>: 여행 날짜와 시간을 입력하여 길한 방향 확인</li>
                  <li>✓ <strong>매일 아침</strong>: 오늘의 길한 방위를 확인하여 하루 계획 수립</li>
                  <li>✓ <strong>중요한 결정</strong>: 계약, 이사 등 중요한 일 전에 시간대별 운세 비교</li>
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
