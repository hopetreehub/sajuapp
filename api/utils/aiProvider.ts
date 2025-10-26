/**
 * AI 제공자 우선순위 시스템
 *
 * 우선순위:
 * 1. OpenAI GPT-4o (최고 품질, 느림, 유료)
 * 2. Google Gemini 2.0 Flash (빠름, 무료)
 * 3. DeepInfra (백업용)
 *
 * @author Claude Code
 * @version 1.0.0
 */

export interface AIProvider {
  name: string;
  model: string;
  priority: number;
  enabled: boolean;
}

export interface AIResponse {
  success: boolean;
  response: string;
  provider: string;
  model: string;
  timestamp: string;
  error?: string;
}

/**
 * OpenAI GPT-4o API 호출
 */
async function callOpenAI(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000, // 13개 카드 (올해의 운) 해석을 위해 증가
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Google Gemini 2.0 Flash API 호출
 */
async function callGemini(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000, // 13개 카드 (올해의 운) 해석을 위해 증가
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * DeepInfra API 호출
 */
async function callDeepInfra(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000, // 13개 카드 (올해의 운) 해석을 위해 증가
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepInfra API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * AI 제공자 우선순위에 따라 호출 시도
 */
export async function callAIWithPriority(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  const providers: AIProvider[] = [
    {
      name: 'openai',
      model: 'gpt-4o',
      priority: 1,
      enabled: !!process.env.OPENAI_API_KEY,
    },
    {
      name: 'google-gemini',
      model: 'gemini-2.0-flash-exp',
      priority: 2,
      enabled: !!process.env.GOOGLE_API_KEY,
    },
    {
      name: 'deepinfra',
      model: 'llama-3.1-70b',
      priority: 3,
      enabled: !!process.env.DEEPINFRA_API_KEY,
    },
  ];

  // 우선순위 순으로 정렬하고 활성화된 것만 필터
  const enabledProviders = providers
    .filter(p => p.enabled)
    .sort((a, b) => a.priority - b.priority);

  if (enabledProviders.length === 0) {
    return {
      success: false,
      response: '',
      provider: 'none',
      model: 'none',
      timestamp: new Date().toISOString(),
      error: 'No AI providers configured',
    };
  }

  // 각 제공자를 순서대로 시도
  for (const provider of enabledProviders) {
    try {
      console.log(`[AI] 시도 중: ${provider.name} (우선순위 ${provider.priority})`);

      let responseText = '';

      if (provider.name === 'openai') {
        responseText = await callOpenAI(systemPrompt, userPrompt, process.env.OPENAI_API_KEY!);
      } else if (provider.name === 'google-gemini') {
        responseText = await callGemini(systemPrompt, userPrompt, process.env.GOOGLE_API_KEY!);
      } else if (provider.name === 'deepinfra') {
        responseText = await callDeepInfra(systemPrompt, userPrompt, process.env.DEEPINFRA_API_KEY!);
      }

      if (responseText && responseText.length > 20) {
        console.log(`[AI] 성공: ${provider.name}`);
        return {
          success: true,
          response: responseText,
          provider: provider.name,
          model: provider.model,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error: any) {
      console.error(`[AI] ${provider.name} 실패:`, error.message);
      // 다음 제공자로 계속 진행
      continue;
    }
  }

  // 모든 제공자 실패
  return {
    success: false,
    response: '',
    provider: 'none',
    model: 'none',
    timestamp: new Date().toISOString(),
    error: 'All AI providers failed',
  };
}
