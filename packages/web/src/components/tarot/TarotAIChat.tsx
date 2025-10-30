/**
 * 타로 AI 채팅 컴포넌트
 *
 * 사용자 질문에 AI가 타로 카드 해석을 제공
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import type { TarotCardPosition } from '@/utils/tarotSpread';
import QuestionSelector from '@/components/tarot/QuestionSelector';
import { TAROT_QUESTIONS } from '@/utils/tarotQuestions';
import { tarotCacheManager } from '@/utils/aiCacheManager';
import { generateSpreadPrompt } from '@/utils/tarotSpread';

interface TarotAIChatProps {
  cardPositions: TarotCardPosition[];
  spreadName: string;
  userQuestion: string;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * 규칙 기반 응답 생성 (API 실패 시 폴백)
 */
function generateRuleBasedResponse(
  question: string,
  cardPositions: TarotCardPosition[],
): string {
  const q = question.toLowerCase();

  // 키워드 기반 응답
  if (q.includes('의미') || q.includes('뜻')) {
    const firstCard = cardPositions[0];
    return `${firstCard.card.name} 카드는 ${firstCard.isReversed ? '역방향으로 ' : ''}뽑혔습니다. 이 카드는 ${firstCard.positionName} 위치에서 ${firstCard.positionMeaning}을 의미합니다. 더 자세한 해석은 AI 서비스가 복구되면 제공됩니다. 🔮`;
  }

  if (q.includes('조언') || q.includes('행동') || q.includes('어떻게')) {
    return `뽑으신 ${cardPositions.length}장의 카드를 바탕으로 현재 상황에 대한 통찰을 드립니다. AI 서비스가 연결되면 더 구체적인 행동 지침을 제공해드리겠습니다. 💡`;
  }

  if (q.includes('경고') || q.includes('주의') || q.includes('조심')) {
    const reversedCards = cardPositions.filter(p => p.isReversed);
    if (reversedCards.length > 0) {
      return `역방향 카드 ${reversedCards.length}장이 나왔습니다: ${reversedCards.map(c => c.card.name).join(', ')}. 역방향은 카드의 반대 의미나 경고를 나타낼 수 있습니다. ⚠️`;
    }
    return `현재 뽑으신 카드들은 모두 정방향입니다. 특별한 경고 신호는 보이지 않습니다. ✨`;
  }

  // 기본 응답
  const cardList = cardPositions.map((p, i) =>
    `${i + 1}. ${p.positionName}: ${p.card.name} ${p.isReversed ? '(역방향)' : '(정방향)'}`
  ).join('\n');

  return `타로 리딩 결과:\n\n${cardList}\n\n더 구체적인 질문을 주시면 자세히 답변드리겠습니다! 🔮`;
}

export default function TarotAIChat({ cardPositions, spreadName, userQuestion, onClose }: TarotAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `안녕하세요! 저는 타로 AI 상담사입니다. ${spreadName}로 뽑으신 카드들을 바탕으로 해석을 도와드리겠습니다. 궁금하신 점을 물어보세요! 🔮`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // AI 응답 생성 (API 호출 + 영구 캐싱)
  const getAIResponse = async (question: string): Promise<string> => {
    try {
      // 캐시 파라미터 생성 (카드 + 질문)
      const cacheParams = {
        spreadName,
        userQuestion,
        cardNames: cardPositions.map(p => `${p.card.name}_${p.isReversed ? 'R' : 'U'}`).join('|'),
        question: question.toLowerCase().trim(),
      };

      // 영구 캐시 확인 (localStorage)
      const cached = tarotCacheManager.get(cacheParams);
      if (cached) {
        console.log(`⚡ [타로 영구 캐시] 즉시 응답 (${cached.provider} ${cached.model})`);
        return cached.response;
      }

      // 타로 해석 프롬프트 생성
      console.log('🔮 [타로 AI] 프롬프트 생성 중...');
      const spreadPrompt = generateSpreadPrompt(cardPositions, userQuestion);

      const aiPrompt = `당신은 30년 경력의 타로 마스터입니다. 친구처럼 편하게 조언하듯 자연스럽게 대화하세요.

🔮 타로 리딩 정보:
${spreadPrompt}

💬 사용자 추가 질문: "${question}"

✅ 반드시 지킬 사항:
1. 🌏 순수 한국어만 사용 (한자어 단어는 괜찮지만, 중국어 글자, 영어, 일본어, 아랍어 등 외국어 문자는 절대 금지)
2. 🚫 <think> 태그나 사고 과정 절대 보여주지 말 것
3. 📝 마크다운 형식(#, **, -, 등) 사용하지 말 것
4. 💬 친구에게 말하듯 "~거든요", "~해요", "~네요" 같은 편한 말투 사용
5. 💡 현실적이고 균형 잡힌 조언 제공:
   - 긍정적인 면과 주의할 점 모두 언급
   - 역방향 카드는 경고나 반대 의미를 명확히 설명
   - "~하면 좋아요"가 아닌 "~해야 합니다", "~주의하세요" 같은 구체적 표현
6. 📋 구체적인 실천 방법 제시:
   - 추상적인 조언 금지 (예: "노력하세요" ❌)
   - 구체적인 행동 지침 제공 (예: "매일 아침 감사 일기 쓰세요" ✅)
7. 🔮 카드의 위치와 의미를 연결하여 해석
8. 📏 600-900자 정도로 충분히 설명
9. 💼 실용적 답변 구조:
   - 1단계: 카드 전체 흐름 파악 (과거-현재-미래 등)
   - 2단계: 질문에 대한 핵심 답변
   - 3단계: 각 카드의 의미와 조언
   - 4단계: 구체적 행동 지침 (3-5가지)
   - 5단계: 주의사항 및 경고

지금 바로 순수 한국어로만 답변을 시작하세요:`;

      console.log('✅ [타로 AI] 프롬프트 생성 완료');

      // AI API 호출
      console.log('🌐 [타로 AI] API 호출 중...');
      const startTime = performance.now();

      const response = await fetch('/api/tarotChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          userQuestion: question,
        }),
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (!response.ok) {
        console.error('❌ [타로 AI] API 오류:', response.status, await response.text());
        return generateRuleBasedResponse(question, cardPositions);
      }

      const data = await response.json();
      console.log(`✅ [타로 AI] 응답 받음 (${responseTime}ms):`, data.provider, data.model);

      if (data.success && data.response) {
        // 영구 캐시에 저장 (localStorage)
        tarotCacheManager.set(cacheParams, data.response, data.provider, data.model);

        return data.response;
      } else {
        console.error('❌ [타로 AI] 응답 데이터 없음:', data);
        return generateRuleBasedResponse(question, cardPositions);
      }
    } catch (error) {
      console.error('❌ [타로 AI] 전체 오류:', error);
      return generateRuleBasedResponse(question, cardPositions);
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
              <h3 className="text-white font-bold text-lg">타로 AI 상담사</h3>
              <p className="text-purple-100 text-xs">
                {spreadName} 전문 상담
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
            questions={TAROT_QUESTIONS}
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
