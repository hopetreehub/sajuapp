/**
 * AI API 키 유효성 테스트 스크립트
 *
 * 사용법:
 * cd packages/web && npx tsx scripts/test-ai-apis.ts
 */

import 'dotenv/config';

interface TestResult {
  provider: string;
  model: string;
  success: boolean;
  responseTime?: number;
  errorMessage?: string;
  responsePreview?: string;
}

const results: TestResult[] = [];

// Google Gemini API 테스트
async function testGoogleGemini(): Promise<TestResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const startTime = Date.now();

  if (!apiKey) {
    return {
      provider: 'Google Gemini',
      model: 'gemini-2.0-flash-exp',
      success: false,
      errorMessage: '❌ GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다',
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: '안녕하세요. 간단히 응답해주세요.',
                },
              ],
            },
          ],
        }),
      }
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        provider: 'Google Gemini',
        model: 'gemini-2.0-flash-exp',
        success: false,
        responseTime,
        errorMessage: `❌ HTTP ${response.status}: ${errorText}`,
      };
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      provider: 'Google Gemini',
      model: 'gemini-2.0-flash-exp',
      success: true,
      responseTime,
      responsePreview: aiResponse.substring(0, 100) + (aiResponse.length > 100 ? '...' : ''),
    };
  } catch (error) {
    return {
      provider: 'Google Gemini',
      model: 'gemini-2.0-flash-exp',
      success: false,
      responseTime: Date.now() - startTime,
      errorMessage: `❌ 네트워크 오류: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// OpenAI API 테스트
async function testOpenAI(): Promise<TestResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const startTime = Date.now();

  if (!apiKey) {
    return {
      provider: 'OpenAI',
      model: 'gpt-4o',
      success: false,
      errorMessage: '⚠️  OPENAI_API_KEY 환경 변수가 설정되지 않았습니다 (선택사항)',
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: '안녕하세요. 간단히 응답해주세요.',
          },
        ],
        max_tokens: 50,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        provider: 'OpenAI',
        model: 'gpt-4o',
        success: false,
        responseTime,
        errorMessage: `❌ HTTP ${response.status}: ${errorText}`,
      };
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    return {
      provider: 'OpenAI',
      model: 'gpt-4o',
      success: true,
      responseTime,
      responsePreview: aiResponse.substring(0, 100) + (aiResponse.length > 100 ? '...' : ''),
    };
  } catch (error) {
    return {
      provider: 'OpenAI',
      model: 'gpt-4o',
      success: false,
      responseTime: Date.now() - startTime,
      errorMessage: `❌ 네트워크 오류: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// DeepInfra API 테스트
async function testDeepInfra(): Promise<TestResult> {
  const apiKey = process.env.DEEPINFRA_API_KEY;
  const startTime = Date.now();

  if (!apiKey) {
    return {
      provider: 'DeepInfra',
      model: 'llama-3.1-70b',
      success: false,
      errorMessage: '⚠️  DEEPINFRA_API_KEY 환경 변수가 설정되지 않았습니다 (선택사항)',
    };
  }

  try {
    const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        messages: [
          {
            role: 'user',
            content: '안녕하세요. 간단히 응답해주세요.',
          },
        ],
        max_tokens: 50,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        provider: 'DeepInfra',
        model: 'llama-3.1-70b',
        success: false,
        responseTime,
        errorMessage: `❌ HTTP ${response.status}: ${errorText}`,
      };
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    return {
      provider: 'DeepInfra',
      model: 'llama-3.1-70b',
      success: true,
      responseTime,
      responsePreview: aiResponse.substring(0, 100) + (aiResponse.length > 100 ? '...' : ''),
    };
  } catch (error) {
    return {
      provider: 'DeepInfra',
      model: 'llama-3.1-70b',
      success: false,
      responseTime: Date.now() - startTime,
      errorMessage: `❌ 네트워크 오류: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// 메인 테스트 실행
async function runTests() {
  console.log('🔍 AI API 키 유효성 테스트 시작...\n');

  // 환경 변수 확인
  console.log('📋 환경 변수 확인:');
  console.log(`  GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? '✅ 설정됨' : '❌ 미설정'}`);
  console.log(`  OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ 설정됨' : '⚠️  미설정 (선택사항)'}`);
  console.log(`  DEEPINFRA_API_KEY: ${process.env.DEEPINFRA_API_KEY ? '✅ 설정됨' : '⚠️  미설정 (선택사항)'}\n`);

  // 각 API 테스트
  console.log('🧪 API 연결 테스트 중...\n');

  const geminiResult = await testGoogleGemini();
  results.push(geminiResult);
  console.log(`[Google Gemini] ${geminiResult.success ? '✅ 성공' : '❌ 실패'}`);
  if (geminiResult.responseTime) console.log(`  응답 시간: ${geminiResult.responseTime}ms`);
  if (geminiResult.responsePreview) console.log(`  응답: ${geminiResult.responsePreview}`);
  if (geminiResult.errorMessage) console.log(`  ${geminiResult.errorMessage}`);
  console.log('');

  const openaiResult = await testOpenAI();
  results.push(openaiResult);
  console.log(`[OpenAI] ${openaiResult.success ? '✅ 성공' : openaiResult.errorMessage?.includes('선택사항') ? '⚠️  미설정' : '❌ 실패'}`);
  if (openaiResult.responseTime) console.log(`  응답 시간: ${openaiResult.responseTime}ms`);
  if (openaiResult.responsePreview) console.log(`  응답: ${openaiResult.responsePreview}`);
  if (openaiResult.errorMessage && !openaiResult.errorMessage.includes('선택사항')) console.log(`  ${openaiResult.errorMessage}`);
  console.log('');

  const deepinfraResult = await testDeepInfra();
  results.push(deepinfraResult);
  console.log(`[DeepInfra] ${deepinfraResult.success ? '✅ 성공' : deepinfraResult.errorMessage?.includes('선택사항') ? '⚠️  미설정' : '❌ 실패'}`);
  if (deepinfraResult.responseTime) console.log(`  응답 시간: ${deepinfraResult.responseTime}ms`);
  if (deepinfraResult.responsePreview) console.log(`  응답: ${deepinfraResult.responsePreview}`);
  if (deepinfraResult.errorMessage && !deepinfraResult.errorMessage.includes('선택사항')) console.log(`  ${deepinfraResult.errorMessage}`);
  console.log('');

  // 최종 결과 요약
  console.log('═══════════════════════════════════════════════');
  console.log('📊 최종 결과 요약');
  console.log('═══════════════════════════════════════════════');

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(`\n✅ 성공: ${successCount}/${totalCount}`);
  console.log(`❌ 실패: ${totalCount - successCount}/${totalCount}\n`);

  if (successCount === 0) {
    console.log('⚠️  경고: 모든 AI API 키가 유효하지 않습니다!');
    console.log('⚠️  AI 챗 기능이 Mock 응답으로 작동합니다.\n');
    console.log('📝 해결 방법:');
    console.log('  1. .env 파일에 GOOGLE_API_KEY 추가');
    console.log('  2. Google AI Studio에서 API 키 생성: https://aistudio.google.com/app/apikey');
    console.log('  3. .env 파일에 GOOGLE_API_KEY=your_key_here 추가');
    console.log('  4. 개발 서버 재시작\n');
  } else {
    console.log('✅ AI 챗 기능이 정상적으로 작동합니다!\n');

    // 우선순위 체인 표시
    const workingProviders = results.filter(r => r.success);
    console.log('🔄 AI 제공자 우선순위 체인:');
    if (workingProviders.length > 0) {
      workingProviders.forEach((r, index) => {
        console.log(`  ${index + 1}. ${r.provider} (${r.model}) - ${r.responseTime}ms`);
      });
    }
    console.log('');
  }
}

// 스크립트 실행
runTests().catch(console.error);
