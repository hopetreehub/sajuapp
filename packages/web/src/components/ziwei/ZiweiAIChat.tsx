/**
 * 자미두수 AI 채팅 컴포넌트
 *
 * 사용자 질문에 AI가 자미두수 해석을 제공
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import type { ZiweiChart, Palace } from '@/types/ziwei';
import type { Customer } from '@/services/customerApi';

interface ZiweiAIChatProps {
  chart: ZiweiChart;
  customer?: Customer | null;
  selectedPalace?: Palace | null;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

type ZiweiContext =
  | 'general'
  | 'career'
  | 'wealth'
  | 'health'
  | 'relationship'
  | 'marriage'
  | 'family'
  | 'study';

export default function ZiweiAIChat({
  chart,
  customer,
  selectedPalace,
  onClose,
}: ZiweiAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: customer
        ? `안녕하세요 ${customer.name}님! 저는 자미두수 AI 상담사입니다. ${customer.name}님의 명반(命盤) 정보를 바탕으로 맞춤 조언을 드리겠습니다. 궁금하신 점을 물어보세요! ⭐`
        : '안녕하세요! 저는 자미두수 AI 상담사입니다. 궁금하신 점을 물어보세요! ⭐',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState<ZiweiContext>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // AI 응답 캐시
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
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ko-KR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (_event: any) => {
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

  // AI 프롬프트 생성
  const generateZiweiAIPrompt = (userQuestion: string): string => {
    const customerInfo = customer
      ? `[고객 정보]
- 이름: ${customer.name}
- 생년월일시: ${customer.birth_date} ${customer.birth_time || '시간 미상'}
- 성별: ${customer.gender === 'male' ? '남성' : customer.gender === 'female' ? '여성' : '미상'}
- 음양력: ${customer.lunar_solar === 'lunar' ? '음력' : '양력'}
`
      : '';

    const palaceInfo = selectedPalace
      ? `[선택한 궁위: ${selectedPalace}]
- 궁위: ${selectedPalace} (${chart.palaces[selectedPalace].branch})
- 주성: ${chart.palaces[selectedPalace].mainStars.join(', ') || '없음'}
- 보조성: ${chart.palaces[selectedPalace].auxiliaryStars.join(', ') || '없음'}
- 길흉점수: ${chart.palaces[selectedPalace].luckyScore}점
- 해석: ${chart.palaces[selectedPalace].description}
`
      : '';

    const contextDescription: Record<ZiweiContext, string> = {
      general: '종합 운세',
      career: '직업/관록궁 중심 분석',
      wealth: '재물/재백궁 중심 분석',
      health: '건강/질액궁 중심 분석',
      relationship: '인간관계/노복궁 중심 분석',
      marriage: '결혼/부부궁 중심 분석',
      family: '가족/부모궁/형제궁 중심 분석',
      study: '학업/자녀궁 중심 분석',
    };

    return `당신은 자미두수(紫微斗數) 전문가입니다. 아래 명반 정보를 바탕으로 사용자의 질문에 친절하게 답변해주세요.

${customerInfo}
[명반 기본 정보]
- 납음오행 국수: ${chart.bureau}
- 명궁: ${chart.lifePalaceBranch} (${chart.palaces['命宮'].mainStars.join(', ') || '없음'})
- 신궁: ${chart.bodyPalaceBranch}
- 종합 점수: ${chart.overallFortune.score}점 (${chart.overallFortune.level})
- 종합 평가: ${chart.overallFortune.summary}

[12궁위 주성 배치]
${Object.entries(chart.palaces)
  .map(
    ([palace, info]) =>
      `- ${palace} (${info.branch}): ${info.mainStars.join(', ') || '없음'} (${info.luckyScore}점)`,
  )
  .join('\n')}

[사화성 (四化星) - 생년 천간에 따른 특별한 영향]
${Object.entries(chart.palaces)
  .filter(([_, info]) =>
    info.auxiliaryStars.some(star => ['化祿', '化權', '化科', '化忌'].includes(star)),
  )
  .map(([palace, info]) => {
    const transformations = info.auxiliaryStars.filter(star =>
      ['化祿', '化權', '化科', '化忌'].includes(star),
    );
    const mainStar = info.mainStars.find(ms =>
      transformations.length > 0,
    );
    return transformations.map(t =>
      `- ${palace}: ${mainStar}이(가) ${t} (재물운/권력운/명예운/불운에 큰 영향)`,
    ).join('\n');
  })
  .join('\n')}

[주요 특성]
- 성격: ${chart.characteristics.personality.join(', ')}
- 직업: ${chart.characteristics.career.join(', ')}
- 재물: ${chart.characteristics.wealth.join(', ')}
- 건강: ${chart.characteristics.health.join(', ')}
- 인간관계: ${chart.characteristics.relationships.join(', ')}

[대운 (大運) - 10년 단위 운세]
- 현재 대운: ${chart.majorFortunes.find(f => chart.yearlyFortune.age >= f.startAge && chart.yearlyFortune.age <= f.endAge)?.description || '대운 정보 없음'}
- 대운 점수: ${chart.majorFortunes.find(f => chart.yearlyFortune.age >= f.startAge && chart.yearlyFortune.age <= f.endAge)?.luckyScore || 50}점

[유년운 (流年) - 올해 운세]
- ${chart.yearlyFortune.description}
- 올해 점수: ${chart.yearlyFortune.luckyScore}점
- 올해 키워드: ${chart.yearlyFortune.keywords.join(', ')}

[유월운 (流月運) - 이번 달 운세]
- ${chart.monthlyFortune.description}
- 이번 달 점수: ${chart.monthlyFortune.luckyScore}점
- 이번 달 키워드: ${chart.monthlyFortune.keywords.join(', ')}

[이번 주 일진 (7일 운세)]
${chart.weeklyFortunes
  .map(
    (df) =>
      `- ${df.date} (${df.dayOfWeek}요일): ${df.palace} ${df.branch} | ${df.luckyScore}점 | ${df.keywords.join(', ')}
  → ${df.description}`,
  )
  .join('\n')}

⚠️ 중요: 사용자가 "이번 주 중 언제", "어느 날", "무슨 요일" 같은 질문을 하면 위 7일 일진 정보를 바탕으로 구체적인 날짜와 요일을 추천해주세요!
- 점수가 가장 높은 날을 1순위로 추천
- 해당 날짜의 궁위 특성과 키워드를 언급
- 피해야 할 낮은 점수의 날도 함께 알려주기

${palaceInfo}
[상담 목적]
${contextDescription[selectedContext]}

[사용자 질문]
${userQuestion}

[답변 지침]
🚫 절대 금지 사항:
1. 영어, 중국어, 일본어, 러시아어, 아랍어 등 모든 외국어 사용 절대 금지
2. 마크다운 형식(#, **, -, 등) 사용 금지
3. <think> 태그나 사고 과정 노출 금지
4. 불완전한 문장 금지 (예: "에 이 있어", "과 점수가" 등)

✅ 반드시 지킬 사항:
1. 오직 한국어만 사용 (숫자, 문장부호 포함)
2. 궁위 이름은 반드시 완전하게 표현
   - 좋은 예: "관록궁이 57점으로 낮아 경쟁에서 어려움을 겪을 수 있어요"
   - 나쁜 예: "공식운이 57점으로 낮아 에 이 있어" (불완전)
3. 친구처럼 자연스럽고 친근한 말투 (~해요, ~네요, ~거든요)
4. 구체적인 궁위명, 주성명, 점수를 정확히 언급
5. 💡 현실적이고 균형 잡힌 조언 제공:
   - 좋은 점만 강조하지 말고 주의할 점도 반드시 언급
   - 낮은 점수(60점 미만)는 솔직하게 알려주고 극복 방법 제시
   - "~하면 좋아요"가 아닌 "~해야 합니다", "~주의하세요" 같은 구체적 표현 사용
6. 📋 구체적인 실천 방법 제시:
   - 추상적인 조언 금지 (예: "노력하세요" ❌)
   - 구체적인 행동 지침 제공 (예: "매일 아침 30분 운동하세요" ✅)
   - 시기, 방법, 대상을 명확히 제시
7. ⚠️ 위험 요소 명확히 전달:
   - 점수가 낮은 궁위는 어떤 문제가 생길 수 있는지 구체적으로 설명
   - 피해야 할 행동, 조심해야 할 시기를 명시
8. 200자 내외로 간결하게 답변
9. 같은 질문이라도 매번 다양한 표현과 관점으로 답변

📋 12궁위 정확한 표현:
명궁, 부모궁, 복덕궁, 전택궁, 관록궁, 노복궁, 천이궁, 질액궁, 재백궁, 자녀궁, 부부궁, 형제궁`;
  };

  // AI 응답 생성
  const getAIResponse = async (userQuestion: string): Promise<string> => {
    try {
      // 캐시 비활성화: AI가 매번 새로운 답변을 생성하도록 함
      // const cacheKey = `${chart.bureau}_${selectedContext}_${customer?.id || 'none'}_${userQuestion.toLowerCase().trim()}`;
      // if (responseCache.has(cacheKey)) {
      //   return responseCache.get(cacheKey)!;
      // }

      // 프롬프트 생성
      const aiPrompt = generateZiweiAIPrompt(userQuestion);

      // API 호출
      const response = await fetch('/api/v1/ziwei/chat', {
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
        return generateRuleBasedResponse(userQuestion);
      }

      const data = await response.json();

      if (data.success && data.response) {
        // 캐싱 비활성화
        // setResponseCache((prev) => new Map(prev).set(cacheKey, data.response));
        return data.response;
      } else {
        return generateRuleBasedResponse(userQuestion);
      }
    } catch (error) {
      return generateRuleBasedResponse(userQuestion);
    }
  };

  // 규칙 기반 응답 생성 (폴백)
  const generateRuleBasedResponse = (question: string): string => {
    const q = question.toLowerCase();

    const lifePalace = chart.palaces['命宮'];
    const careerPalace = chart.palaces['官祿宮'];
    const wealthPalace = chart.palaces['財帛宮'];
    const marriagePalace = chart.palaces['夫妻宮'];

    if (q.includes('직업') || q.includes('일') || q.includes('사업') || q.includes('진로')) {
      return `${customer?.name || '당신'}님의 관록궁(직업운)은 ${careerPalace.branch}에 ${careerPalace.mainStars.join(', ')}이 있어요. ${careerPalace.description} 점수는 ${careerPalace.luckyScore}점으로, ${careerPalace.luckyScore >= 60 ? '좋은 직업운' : '노력이 필요한 시기'}입니다. ${chart.characteristics.career.slice(0, 2).join(', ')} 분야가 잘 맞을 거예요! 💼`;
    }

    if (q.includes('재물') || q.includes('돈') || q.includes('재산') || q.includes('금전')) {
      return `${customer?.name || '당신'}님의 재백궁(재물운)은 ${wealthPalace.branch}에 ${wealthPalace.mainStars.join(', ')}이 있어요. ${wealthPalace.description} 점수는 ${wealthPalace.luckyScore}점입니다. ${chart.characteristics.wealth.slice(0, 2).join(', ')} 방식으로 재물을 모으시면 좋을 것 같아요! 💰`;
    }

    if (q.includes('결혼') || q.includes('배우자') || q.includes('부부')) {
      return `${customer?.name || '당신'}님의 부부궁(결혼운)은 ${marriagePalace.branch}에 ${marriagePalace.mainStars.join(', ')}이 있어요. ${marriagePalace.description} 점수는 ${marriagePalace.luckyScore}점으로, ${marriagePalace.luckyScore >= 60 ? '좋은 인연' : '서로 이해하고 노력하는 관계'}가 예상됩니다. 💕`;
    }

    if (q.includes('성격') || q.includes('특징') || q.includes('나는')) {
      return `${customer?.name || '당신'}님의 명궁은 ${lifePalace.branch}에 ${lifePalace.mainStars.join(', ')}이 있어요. ${lifePalace.description} 성격적으로는 ${chart.characteristics.personality.slice(0, 3).join(', ')} 특징이 있으시네요. 이런 성격이 ${customer?.name || '당신'}님의 큰 강점이에요! ⭐`;
    }

    // 기본 응답
    return `${customer?.name || '당신'}님의 명반을 보면, ${chart.bureau}이며 종합 점수는 ${chart.overallFortune.score}점입니다. ${chart.overallFortune.summary} 더 구체적으로 궁금한 점을 말씀해 주시면 자세히 답변드릴게요! ⭐`;
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
    } catch {
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

  // 맥락별 샘플 질문
  const contextQuestions: Record<ZiweiContext, string[]> = {
    general: [
      '내 운세가 어떤가요?',
      '가장 강한 궁위는 어디인가요?',
      '주의해야 할 점은 무엇인가요?',
      '내 명반의 특징은 뭔가요?',
    ],
    career: [
      '어떤 직업이 잘 맞나요?',
      '사업을 시작해도 될까요?',
      '이직 시기가 언제인가요?',
      '승진 운은 어떤가요?',
    ],
    wealth: [
      '재물운이 좋은가요?',
      '투자를 해도 될까요?',
      '돈은 어떻게 모아야 하나요?',
      '재물이 언제 들어오나요?',
    ],
    health: [
      '건강은 어떤가요?',
      '조심해야 할 질병은 뭐가 있나요?',
      '건강을 위해 뭘 해야 하나요?',
      '수술 시기는 언제가 좋나요?',
    ],
    relationship: [
      '대인관계가 어떤가요?',
      '좋은 인연을 만날 수 있나요?',
      '친구 관계는 어떤가요?',
      '사람들과 어떻게 지내야 하나요?',
    ],
    marriage: [
      '결혼운이 좋은가요?',
      '배우자는 어떤 사람인가요?',
      '결혼 시기는 언제인가요?',
      '부부 관계는 어떤가요?',
    ],
    family: [
      '가족운이 어떤가요?',
      '부모님과의 관계는?',
      '형제자매 관계는 어떤가요?',
      '가정에서 주의할 점은?',
    ],
    study: [
      '학업운이 좋은가요?',
      '어떤 공부가 잘 맞나요?',
      '시험 운은 어떤가요?',
      '학업에서 주의할 점은?',
    ],
  };

  // 맥락 버튼
  const contextButtons: { key: ZiweiContext; icon: string; label: string }[] = [
    { key: 'general', icon: '⭐', label: '종합' },
    { key: 'career', icon: '💼', label: '직업' },
    { key: 'wealth', icon: '💰', label: '재물' },
    { key: 'health', icon: '❤️', label: '건강' },
    { key: 'relationship', icon: '👥', label: '인간관계' },
    { key: 'marriage', icon: '💕', label: '결혼' },
    { key: 'family', icon: '🏠', label: '가족' },
    { key: 'study', icon: '📚', label: '학업' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center md:items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] md:h-[750px] flex flex-col">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-t-3xl md:rounded-t-3xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
              ⭐
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">자미두수 AI 상담사</h3>
              <p className="text-purple-100 text-xs">
                {customer?.name && `${customer.name}님 전문 상담`}
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

        {/* 맥락 선택 버튼 */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
          <div className="flex gap-2 flex-nowrap">
            {contextButtons.map((ctx) => (
              <button
                key={ctx.key}
                onClick={() => setSelectedContext(ctx.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedContext === ctx.key
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {ctx.icon} {ctx.label}
              </button>
            ))}
          </div>
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

        {/* 샘플 질문 */}
        {messages.length === 1 && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              💡 이런 질문을 해보세요:
            </p>
            <div className="flex gap-2 flex-wrap">
              {contextQuestions[selectedContext].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

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
