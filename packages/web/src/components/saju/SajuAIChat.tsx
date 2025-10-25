/**
 * 사주 분석 AI 채팅 컴포넌트
 *
 * 사용자 질문에 AI가 사주팔자 해석을 제공
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Customer } from '@/services/customerApi';
import type { FourPillarsResult } from '@/utils/sajuCalculator';
import type { SajuAnalysisResult } from '@/types/saju';
import QuestionSelector from '@/components/tarot/QuestionSelector';
import { SAJU_QUESTIONS } from '@/utils/sajuQuestions';
import {
  getCurrentDaewoon,
  getCurrentSewoon,
  calculateMonthlyFortune,
} from '@/utils/sajuRelations';
import { getDailyPillar, getDailyFortuneModifier } from '@/utils/dailyFortune';
import type { SajuData } from '@/utils/sajuScoreCalculator';

interface SajuAIChatProps {
  customer: Customer;
  fourPillars: FourPillarsResult;
  analysisResult: SajuAnalysisResult;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * 사주 분석 AI 프롬프트 생성 함수
 */
function generateSajuAIPrompt(
  customer: Customer,
  fourPillars: FourPillarsResult,
  analysisResult: SajuAnalysisResult,
  userQuestion: string,
): string {
  const birthYear = parseInt(customer.birth_date.split('-')[0]);
  const birthMonth = parseInt(customer.birth_date.split('-')[1]);
  const age = new Date().getFullYear() - birthYear;
  const today = new Date();

  // 오행 균형 정보
  const fiveElementsStr = Object.entries(analysisResult.fiveElements)
    .map(([element, value]) => `${element}: ${value}점`)
    .join(', ');

  // 십성 분포 정보
  const tenGodsStr = Object.entries(analysisResult.tenGods)
    .map(([god, value]) => `${god}: ${value}점`)
    .join(', ');

  // 대운(大運) 계산
  const daewoon = getCurrentDaewoon(
    birthYear,
    birthMonth,
    customer.gender,
    fourPillars.month.heavenly as any,
    fourPillars.month.earthly as any,
  );

  // 세운(歲運) 계산
  const sewoon = getCurrentSewoon();

  // 월운 계산
  const sajuData: SajuData = {
    year: { gan: fourPillars.year.heavenly as any, ji: fourPillars.year.earthly as any },
    month: { gan: fourPillars.month.heavenly as any, ji: fourPillars.month.earthly as any },
    day: { gan: fourPillars.day.heavenly as any, ji: fourPillars.day.earthly as any },
    time: { gan: fourPillars.hour.heavenly as any, ji: fourPillars.hour.earthly as any },
    ohHaengBalance: analysisResult.fiveElements,
  } as any;
  const monthlyFortune = calculateMonthlyFortune(today, sajuData);

  // 일운 계산
  const dailyPillar = getDailyPillar(today);
  const dailyFortune = getDailyFortuneModifier(today, sajuData, '종합운');

  const prompt = `당신은 30년 경력의 사주명리학 전문가입니다. ${customer.name}님에게 친구처럼 편하게 조언하듯 자연스럽게 대화하세요.

🙋 고객 정보:
- 이름: ${customer.name}님
- 생년월일: ${customer.birth_date} (${customer.lunar_solar === 'lunar' ? '음력' : '양력'})
- 나이: ${age}세
- 생시: ${customer.birth_time || '미상'}
- 성별: ${customer.gender === 'male' ? '남성' : '여성'}

🔮 사주팔자 (四柱八字):
- 년주(年柱): ${fourPillars.year.combined} (${fourPillars.year.heavenly} ${fourPillars.year.earthly})
- 월주(月柱): ${fourPillars.month.combined} (${fourPillars.month.heavenly} ${fourPillars.month.earthly})
- 일주(日柱): ${fourPillars.day.combined} (${fourPillars.day.heavenly} ${fourPillars.day.earthly}) ⭐일간
- 시주(時柱): ${fourPillars.hour.combined} (${fourPillars.hour.heavenly} ${fourPillars.hour.earthly})

⚖️ 오행 균형 (五行均衡):
${fiveElementsStr}
- 평균: ${analysisResult.averageScore}점

🎭 십성 분포 (十星分布):
${tenGodsStr}

🌊 현재 운세 (運勢):
- 대운(大運): ${daewoon ? `${daewoon.combined} (${daewoon.description})` : '계산 불가'}
- 세운(歲運): ${sewoon.combined} (${sewoon.description})
- 월운(月運): ${monthlyFortune > 0 ? '+' : ''}${monthlyFortune}점 (${today.getMonth() + 1}월)
- 일운(日運): ${dailyPillar.combined} (오늘 ${dailyFortune > 0 ? '+' : ''}${dailyFortune}점)

💬 사용자 질문: "${userQuestion}"

✅ 반드시 지킬 사항:
1. 🌏 순수 한국어만 사용 (한자어 단어는 괜찮지만, 중국어 글자, 영어, 일본어, 아랍어 등 외국어 문자는 절대 금지)
2. 🚫 <think> 태그나 사고 과정 절대 보여주지 말 것
3. 📝 마크다운 형식(#, **, -, 등) 사용하지 말 것
4. 💬 친구에게 말하듯 "~거든요", "~해요", "~네요" 같은 편한 말투 사용
5. 💡 현실적이고 균형 잡힌 조언 제공:
   - 좋은 점만 강조하지 말고 주의할 점도 반드시 언급
   - 낮은 점수(60점 미만) 오행이나 십성은 솔직하게 알려주고 극복 방법 제시
   - "~하면 좋아요"가 아닌 "~해야 합니다", "~주의하세요" 같은 구체적 표현 사용
6. 📋 구체적인 실천 방법 제시:
   - 추상적인 조언 금지 (예: "노력하세요" ❌)
   - 구체적인 행동 지침 제공 (예: "매일 아침 30분 명상하세요" ✅)
   - 시기, 방법, 대상을 명확히 제시
7. ⚠️ 위험 요소 명확히 전달:
   - 오행 균형이 낮은 부분은 어떤 문제가 생길 수 있는지 구체적으로 설명
   - 피해야 할 행동, 조심해야 할 시기를 명시
8. 🔮 ${customer.name}님의 사주팔자를 바탕으로 오행 균형이나 십성 분포를 근거로 설명
9. 🌊 운세 정보 적극 활용:
   - "오늘", "이번 달", "올해" 질문에는 반드시 대운/세운/월운/일운 정보를 활용
   - 대운(大運)은 10년 주기의 큰 흐름, 현재 인생 단계 설명 시 사용
   - 세운(歲運)은 올해 전체 운세, 연간 계획이나 목표 조언 시 사용
   - 월운(月運)은 이번 달 기운, 월별 주의사항이나 활동 권장 시 사용
   - 일운(日運)은 오늘 하루 운세, 당일 결정이나 행동 조언 시 사용
   - 점수가 음수면 "조심해야 할 시기", 양수면 "기회를 잡을 시기"로 해석
10. 📏 600-900자 정도로 충분히 설명
11. 💼 실용적 답변 구조:
   - 1단계: 현재 운세 종합 판단 (대운+세운+월운+일운 기반)
   - 2단계: 질문에 대한 핵심 답변 (YES/NO 또는 확률 제시)
   - 3단계: 근거 설명 (사주팔자, 오행, 십성, 운세 정보 활용)
   - 4단계: 구체적 행동 지침 (3-5가지, "~하세요", "~하면 좋습니다" 형식)
   - 5단계: 주의사항 및 타이밍 (피해야 할 것, 최적 시기)

예시: "앱 개발 잘될까요?" 질문에는
→ "현재 세운 을사는 혁신과 도전의 해라서 새로운 사업에 유리합니다. 다만 월운이 0점이라 이번 달보다는 다음 달부터 본격적으로 시작하는 게 좋겠어요. 구체적으로 다음과 같이 준비하세요: 1) 이번 달은 기획과 시장조사에 집중 2) 다음 달 월운이 올라가면 개발 착수 3) 대운 갑오의 안정적 에너지를 활용해 꾸준히 진행"

지금 바로 순수 한국어로만 답변을 시작하세요 (외국어 문자 사용 절대 금지):`;

  return prompt;
}

/**
 * 규칙 기반 응답 생성 (API 실패 시 폴백)
 */
function generateRuleBasedResponse(
  question: string,
  fourPillars: FourPillarsResult,
  analysisResult: SajuAnalysisResult,
): string {
  const q = question.toLowerCase();

  // 일간 (日干) 정보
  const dayGan = fourPillars.day.heavenly;

  // 키워드 기반 응답
  if (q.includes('성격') || q.includes('성향')) {
    return `${dayGan} 일간이신 분은 특별한 성향을 가지고 계십니다. 사주의 오행 균형이 평균 ${analysisResult.averageScore}점으로 ${analysisResult.averageScore >= 70 ? '매우 좋은' : analysisResult.averageScore >= 50 ? '균형잡힌' : '개선 가능한'} 상태입니다. 더 자세한 분석은 AI 서비스 연결 후 가능합니다. 😊`;
  }

  if (q.includes('직업') || q.includes('진로') || q.includes('일')) {
    const topElement = Object.entries(analysisResult.fiveElements)
      .sort((a, b) => b[1] - a[1])[0];
    return `${topElement[0]}의 기운이 강하시네요 (${topElement[1]}점). 이는 직업 선택에 중요한 영향을 미칩니다. ${dayGan} 일간의 특성과 함께 고려하면 더 정확한 진로 조언을 드릴 수 있습니다. AI 서비스가 복구되면 상세히 설명해드리겠습니다. 💼`;
  }

  if (q.includes('연애') || q.includes('사랑') || q.includes('결혼') || q.includes('배우자')) {
    return `${dayGan} 일간이신 분의 연애운은 사주의 십성 분포와 밀접한 관련이 있습니다. 총 점수 ${analysisResult.totalScore}점으로 ${analysisResult.totalScore >= 500 ? '좋은' : '무난한'} 편입니다. 배우자 궁합은 상대방의 사주와 함께 봐야 정확합니다. 💕`;
  }

  if (q.includes('재물') || q.includes('돈') || q.includes('재운') || q.includes('투자')) {
    return `사주의 재성(財星) 분포를 보면 재물운에 대한 힌트를 얻을 수 있습니다. 오행 균형이 ${analysisResult.averageScore}점인 것을 고려하면, ${analysisResult.averageScore >= 70 ? '안정적인 재물 관리가 가능' : '신중한 재테크가 필요'}합니다. AI 서비스 복구 후 더 자세히 알려드리겠습니다. 💰`;
  }

  if (q.includes('건강') || q.includes('질병')) {
    const weakElement = Object.entries(analysisResult.fiveElements)
      .sort((a, b) => a[1] - b[1])[0];
    return `오행 중 ${weakElement[0]}이 ${weakElement[1]}점으로 약한 편입니다. 이 오행과 관련된 신체 부위를 주의하시는 것이 좋습니다. ${dayGan} 일간의 건강 특성과 함께 종합적으로 관리하세요. 🏥`;
  }

  // 기본 응답
  return `${dayGan} 일간이신 분의 사주를 분석해드리겠습니다. 전체 오행 균형은 평균 ${analysisResult.averageScore}점으로 ${analysisResult.averageScore >= 70 ? '매우 우수한' : analysisResult.averageScore >= 50 ? '균형잡힌' : '보완이 필요한'} 상태입니다. 더 구체적인 질문을 주시면 자세히 답변드리겠습니다! 😊`;
}

export default function SajuAIChat({ customer, fourPillars, analysisResult, onClose }: SajuAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `안녕하세요 ${customer.name}님! 저는 사주명리학 AI 상담사입니다. ${customer.name}님의 사주팔자를 바탕으로 맞춤 조언을 드리겠습니다. 궁금하신 점을 물어보세요! 😊`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // AI 응답 캐시 (메모리 기반)
  const [responseCache, setResponseCache] = useState<Map<string, string>>(new Map());

  // 음성 인식 상태
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 포커스
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 음성 인식 초기화
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ko-KR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('음성 인식 오류:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // 음성 인식 토글
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // AI 응답 생성 (API 호출 + 캐싱)
  const getAIResponse = async (userQuestion: string): Promise<string> => {
    try {
      // 캐시 키 생성 (고객 ID + 질문)
      const cacheKey = `${customer.id}_${userQuestion.toLowerCase().trim()}`;

      // 캐시 확인
      if (responseCache.has(cacheKey)) {
        console.log('💾 [캐시] 저장된 응답 사용:', cacheKey);
        return responseCache.get(cacheKey)!;
      }

      // 사주 분석 프롬프트 생성
      console.log('🔮 [AI] 프롬프트 생성 중...', { customer: customer.name });
      const aiPrompt = generateSajuAIPrompt(customer, fourPillars, analysisResult, userQuestion);
      console.log('✅ [AI] 프롬프트 생성 완료');

      // AI API 호출 - 사주 전용 엔드포인트 사용
      console.log('🌐 [사주 AI] API 호출 중...');
      const response = await fetch('/api/sajuChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          userQuestion,
        }),
      });

      if (!response.ok) {
        console.error('❌ [AI] API 오류:', response.status, await response.text());
        return generateRuleBasedResponse(userQuestion, fourPillars, analysisResult);
      }

      const data = await response.json();
      console.log('✅ [AI] 응답 받음:', data);

      if (data.success && data.response) {
        setResponseCache(prev => new Map(prev).set(cacheKey, data.response));
        console.log('💾 [캐시] 응답 저장:', cacheKey);
        return data.response;
      } else {
        console.error('❌ [AI] 응답 데이터 없음:', data);
        return generateRuleBasedResponse(userQuestion, fourPillars, analysisResult);
      }
    } catch (error) {
      console.error('❌ [AI] 전체 오류:', error);
      return generateRuleBasedResponse(userQuestion, fourPillars, analysisResult);
    }
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(userMessage.content);

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI 응답 에러:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '죄송합니다. 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 샘플 질문
  const sampleQuestions = [
    '제 성격은 어떤가요?',
    '직업운이 궁금해요',
    '올해 재물운은 어떤가요?',
    '연애 운세가 궁금합니다',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center md:items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] md:h-[750px] flex flex-col">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-t-3xl md:rounded-t-3xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
              🔮
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">사주명리 AI 상담사</h3>
              <p className="text-purple-100 text-xs">
                {customer.name}님 전문 상담
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : msg.role === 'assistant'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      : 'bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 질문 선택기 */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <QuestionSelector
            questions={SAJU_QUESTIONS}
            onSelectQuestion={(question) => {
              setSelectedQuestion(question);
              setInput(question);
            }}
            currentQuestion={selectedQuestion}
          />
        </div>

        {/* 입력 영역 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex gap-2">
            <button
              onClick={toggleVoiceInput}
              disabled={isLoading}
              className={`px-3 py-3 rounded-full font-medium transition-all shadow-md ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse-strong'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              } disabled:opacity-50`}
              title="음성 입력"
            >
              {isListening ? '🎤' : '🎙️'}
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? '음성 인식 중...' : '질문을 입력하세요...'}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              전송
            </button>
          </div>
          {isListening && (
            <div className="mt-2 text-center text-sm text-red-500 dark:text-red-400 animate-pulse">
              🎤 듣고 있습니다... 말씀해주세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
