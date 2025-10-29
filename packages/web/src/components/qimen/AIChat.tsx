/**
 * 귀문둔갑 AI 채팅 컴포넌트
 *
 * 사용자 질문에 AI가 귀문둔갑 해석을 제공
 * @author Claude Code
 * @version 2.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import type { QimenChart } from '@/types/qimen';
import type { QimenContext } from '@/data/qimenContextWeights';
import type { Customer } from '@/services/customerApi';
import { generateAIPrompt } from '@/utils/qimenContextEvaluator';
import QuestionSelector from '@/components/tarot/QuestionSelector';
import { QIMEN_QUESTIONS } from '@/utils/qimenQuestions';
import { qimenCacheManager } from '@/utils/aiCacheManager';

interface AIChatProps {
  chart: QimenChart;
  context?: QimenContext;
  customer?: Customer | null;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function AIChat({ chart, context, customer, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: customer
        ? `안녕하세요 ${customer.name}님! 저는 귀문둔갑 AI 상담사입니다. ${customer.name}님의 사주 정보를 바탕으로 맞춤 조언을 드리겠습니다. 궁금하신 점을 물어보세요! 😊`
        : '안녕하세요! 저는 귀문둔갑 AI 상담사입니다. 궁금하신 점을 물어보세요! 😊',
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
  const getAIResponse = async (userQuestion: string): Promise<string> => {
    try {
      // 캐시 파라미터 생성 (국 + 음양 + 목적 + 고객 + 질문)
      const cacheParams = {
        ju: chart.ju,
        yinYang: chart.yinYang,
        context: context || 'general',
        customerId: customer?.id || 'anonymous',
        question: userQuestion.toLowerCase().trim(),
      };

      // 영구 캐시 확인 (localStorage)
      const cached = qimenCacheManager.get(cacheParams);
      if (cached) {
        console.log(`⚡ [영구 캐시] 즉시 응답 (${cached.provider} ${cached.model})`);
        return cached.response;
      }

      // 귀문둔갑 정보를 포함한 프롬프트 생성 (고객 정보 포함)
      console.log('🔮 [AI] 프롬프트 생성 중...', { customer: customer?.name, context });
      const aiPrompt = generateAIPrompt(chart, context, userQuestion, customer);
      console.log('✅ [AI] 프롬프트 생성 완료');

      // AI API 호출
      console.log('🌐 [귀문둔갑 AI] API 호출 중...');
      const startTime = performance.now();

      const response = await fetch('/api/qimenChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          userQuestion,
        }),
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (!response.ok) {
        console.error('❌ [AI] API 오류:', response.status, await response.text());
        // 실패 시 규칙 기반 응답으로 대체
        return generateRuleBasedResponse(userQuestion, chart, context);
      }

      const data = await response.json();
      console.log(`✅ [AI] 응답 받음 (${responseTime}ms):`, data.provider, data.model);

      if (data.success && data.response) {
        // 영구 캐시에 저장 (localStorage)
        qimenCacheManager.set(cacheParams, data.response, data.provider, data.model);

        return data.response;
      } else {
        console.error('❌ [AI] 응답 데이터 없음:', data);
        // 실패 시 규칙 기반 응답으로 대체
        return generateRuleBasedResponse(userQuestion, chart, context);
      }
    } catch (error) {
      console.error('❌ [AI] 전체 오류:', error);
      // 오류 시 규칙 기반 응답으로 대체
      return generateRuleBasedResponse(userQuestion, chart, context);
    }
  };

  // 규칙 기반 응답 생성 (API 연동 전 임시)
  const generateRuleBasedResponse = (
    question: string,
    chart: QimenChart,
    _context?: QimenContext,
  ): string => {
    const q = question.toLowerCase();

    // 키워드 기반 응답
    if (q.includes('언제') || q.includes('시간') || q.includes('타이밍')) {
      return `현재 ${chart.yinYang === 'yang' ? '양둔' : '음둔'} ${chart.ju}국이며, 전체 운세는 ${chart.overallFortune.score}점입니다. ${chart.overallFortune.summary} 가장 좋은 방위는 ${chart.overallFortune.bestPalaces.map(p => `${p}궁(${chart.palaces[p].direction})`).join(', ')}입니다. 😊`;
    }

    if (q.includes('방향') || q.includes('방위') || q.includes('어디')) {
      const best = chart.overallFortune.bestPalaces[0];
      const bestPalace = chart.palaces[best];
      return `가장 좋은 방위는 ${bestPalace.direction} 방향(${best}궁)입니다! ${bestPalace.interpretation} ✨`;
    }

    if (q.includes('조심') || q.includes('피해야') || q.includes('위험')) {
      const worst = chart.overallFortune.worstPalaces[0];
      const worstPalace = chart.palaces[worst];
      return `${worstPalace.direction} 방향(${worst}궁)은 조심하세요. ${worstPalace.interpretation} 주의사항: ${worstPalace.warnings.join(', ')} ⚠️`;
    }

    if (q.includes('사업') || q.includes('비즈니스') || q.includes('계약')) {
      const businessPalaces = Object.values(chart.palaces).filter(
        p => p.gate === '생문' || p.gate === '개문' || p.gate === '경문',
      );
      if (businessPalaces.length > 0) {
        const best = businessPalaces[0];
        return `비즈니스에는 ${best.direction} 방향이 좋습니다. ${best.gate}과 ${best.star}의 조합이 사업 추진에 유리합니다. 계약이나 미팅을 이 방향에서 진행하세요! 💼`;
      }
    }

    if (q.includes('연애') || q.includes('사랑') || q.includes('결혼')) {
      const lovePalaces = Object.values(chart.palaces).filter(
        p => p.spirit === '육합' || p.spirit === '태음',
      );
      if (lovePalaces.length > 0) {
        const best = lovePalaces[0];
        return `연애운은 ${best.direction} 방향이 좋습니다. ${best.spirit}이 작용하여 좋은 인연을 만날 수 있습니다. 이 방향으로 데이트나 만남을 가져보세요! 💕`;
      }
    }

    // 기본 응답
    return `현재 ${chart.solarTerm.name} 절기이며, ${chart.yinYang === 'yang' ? '양둔' : '음둔'} ${chart.ju}국입니다. 전체 운세 점수는 ${chart.overallFortune.score}점으로 ${chart.overallFortune.level} 등급입니다. ${chart.overallFortune.summary} 더 구체적인 질문을 해주시면 자세히 답변해드리겠습니다! 😊`;
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
    '지금 중요한 계약하기 좋은가요?',
    '어느 방향이 가장 좋나요?',
    '조심해야 할 방위는 어디인가요?',
    '오늘 연애운은 어떤가요?',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center md:items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] md:h-[750px] flex flex-col">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-t-3xl md:rounded-t-3xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">귀문둔갑 AI 상담사</h3>
              <p className="text-blue-100 text-xs">
                {context !== 'general' && `${context} 전문 상담`}
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
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
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
            questions={QIMEN_QUESTIONS}
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
