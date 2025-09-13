#!/usr/bin/env node

/**
 * AI Service API 테스트 스크립트
 * DeepInfra API 키가 설정되어 있으면 실제 AI 서비스 테스트 가능
 */

const axios = require('axios');
const readline = require('readline');

const BASE_URL = 'http://localhost:5003/api/v1';
const API_KEY = 'saju-dev-key-12345';

// 테스트용 사주 데이터
const TEST_SAJU_DATA = {
  fourPillars: {
    year: { stem: '갑', branch: '자' },
    month: { stem: '을', branch: '축' },
    day: { stem: '병', branch: '인' },
    hour: { stem: '정', branch: '묘' }
  },
  tenGods: ['정관', '편재', '식신', '상관'],
  spiritGods: [
    { name: '천을귀인', type: 'auspicious' },
    { name: '역마', type: 'inauspicious' }
  ],
  elements: {
    primary: '목',
    secondary: '화',
    weakness: '금',
    strength: '수'
  },
  currentAge: 30,
  gender: 'male'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class APITester {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async testHealthCheck() {
    console.log('\n🔍 Testing Health Check...');
    
    try {
      const response = await this.client.get('/health');
      console.log('✅ Health Check:', response.data.status);
      console.log('   Service:', response.data.service);
      console.log('   Version:', response.data.version);
      return true;
    } catch (error) {
      console.error('❌ Health Check Failed:', error.message);
      return false;
    }
  }

  async testDetailedHealth() {
    console.log('\n🔍 Testing Detailed Health...');
    
    try {
      const response = await this.client.get('/health/detailed');
      console.log('✅ Detailed Health:', response.data.status);
      console.log('   AI Providers:', Object.keys(response.data.ai_providers).length);
      
      // Show provider status
      for (const [provider, status] of Object.entries(response.data.ai_providers)) {
        const healthStatus = status.healthy ? '✅' : '❌';
        console.log(`   ${healthStatus} ${provider}: ${status.success_rate}% success rate`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Detailed Health Failed:', error.message);
      return false;
    }
  }

  async testDailyFortune() {
    console.log('\n🔮 Testing Daily Fortune...');
    
    const requestData = {
      sajuData: TEST_SAJU_DATA,
      targetDate: new Date().toISOString(),
      interpretationType: 'daily',
      profession: 'office_worker',
      focusAreas: ['work', 'health'],
      systemPrompt: '당신은 전문 명리학자입니다.',
      userPrompt: '오늘의 운세를 해석해주세요.',
      requestType: 'fortune_interpretation'
    };

    try {
      console.log('⏳ Sending request to DeepInfra...');
      const startTime = Date.now();
      
      const response = await this.client.post('/fortune/daily', requestData);
      const responseTime = Date.now() - startTime;
      
      if (response.data.success) {
        console.log('✅ Daily Fortune Success!');
        console.log('   Response time:', responseTime + 'ms');
        console.log('   Provider:', response.data.data.metadata.provider);
        console.log('   Model:', response.data.data.metadata.model);
        console.log('   Token usage:', response.data.data.metadata.tokenUsage.totalTokens);
        console.log('   Cost:', '$' + response.data.data.metadata.cost.toFixed(6));
        console.log('\n📜 Interpretation:');
        console.log(response.data.data.interpretation.substring(0, 200) + '...');
      } else {
        console.log('❌ Daily Fortune Failed:', response.data.error);
      }
      
      return response.data.success;
    } catch (error) {
      console.error('❌ Daily Fortune Error:', error.response?.data || error.message);
      return false;
    }
  }

  async testDiaryInsights() {
    console.log('\n📖 Testing Diary Insights...');
    
    const requestData = {
      diaryContent: '오늘은 회사에서 중요한 프로젝트 발표를 했다. 처음엔 긴장했지만 결과적으로 잘 마무리되어서 기분이 좋다. 상사와 동료들로부터 좋은 피드백을 받았고, 다음 단계 진행도 승인받았다. 저녁에는 가족과 함께 맛있는 식사를 하며 하루를 마무리했다.',
      mood: 4,
      sajuData: TEST_SAJU_DATA,
      previousInsights: ['최근 업무에서 좋은 성과를 내고 있습니다'],
      systemPrompt: '당신은 개인 성장을 돕는 라이프 코치입니다.',
      userPrompt: '다이어리 내용을 분석해주세요.',
      requestType: 'diary_insights'
    };

    try {
      console.log('⏳ Analyzing diary content...');
      const startTime = Date.now();
      
      const response = await this.client.post('/diary/insights', requestData);
      const responseTime = Date.now() - startTime;
      
      if (response.data.success) {
        console.log('✅ Diary Insights Success!');
        console.log('   Response time:', responseTime + 'ms');
        console.log('   Provider:', response.data.data.metadata.provider);
        console.log('   Mood analysis:', response.data.data.insight.mood.description);
        console.log('\n💡 Key Insights:');
        console.log(response.data.data.insight.content.substring(0, 200) + '...');
      } else {
        console.log('❌ Diary Insights Failed:', response.data.error);
      }
      
      return response.data.success;
    } catch (error) {
      console.error('❌ Diary Insights Error:', error.response?.data || error.message);
      return false;
    }
  }

  async testRateLimit() {
    console.log('\n🚦 Testing Rate Limits...');
    
    try {
      const requests = Array.from({ length: 10 }, (_, i) => 
        this.client.get('/health').catch(err => ({ error: err.response?.status }))
      );
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.error === 429);
      const successful = responses.filter(r => !r.error);
      
      console.log(`✅ Rate Limit Test: ${successful.length} successful, ${rateLimited.length} rate limited`);
      return true;
    } catch (error) {
      console.error('❌ Rate Limit Test Failed:', error.message);
      return false;
    }
  }

  async testMetrics() {
    console.log('\n📊 Testing Metrics...');
    
    try {
      const response = await this.client.get('/health/metrics');
      const metrics = response.data.metrics;
      
      console.log('✅ Metrics Retrieved:');
      console.log('   Total requests:', metrics.requests?.total || 0);
      console.log('   Success rate:', (metrics.requests?.successful || 0) + '/' + (metrics.requests?.total || 0));
      console.log('   Average response time:', Math.round(metrics.performance?.averageResponseTime || 0) + 'ms');
      console.log('   Cache hit rate:', Math.round(metrics.cache?.hitRate || 0) + '%');
      console.log('   Total cost today:', '$' + (metrics.costs?.totalCostToday || 0).toFixed(6));
      
      return true;
    } catch (error) {
      console.error('❌ Metrics Test Failed:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting AI Service API Tests...\n');
    
    const tests = [
      { name: 'Health Check', fn: () => this.testHealthCheck() },
      { name: 'Detailed Health', fn: () => this.testDetailedHealth() },
      { name: 'Daily Fortune', fn: () => this.testDailyFortune() },
      { name: 'Diary Insights', fn: () => this.testDiaryInsights() },
      { name: 'Rate Limits', fn: () => this.testRateLimit() },
      { name: 'Metrics', fn: () => this.testMetrics() }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
      try {
        const result = await test.fn();
        if (result) passed++;
      } catch (error) {
        console.error(`❌ Test ${test.name} crashed:`, error.message);
      }
    }
    
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! AI Service is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the logs above for details.');
    }
  }

  async interactiveMode() {
    console.log('\n🤖 Interactive AI Service Tester');
    console.log('Available commands:');
    console.log('  1. health - Test health checks');
    console.log('  2. fortune - Test fortune interpretation');
    console.log('  3. diary - Test diary insights');
    console.log('  4. metrics - Show service metrics');
    console.log('  5. all - Run all tests');
    console.log('  6. exit - Exit interactive mode\n');

    const askCommand = () => {
      rl.question('Enter command (1-6): ', async (answer) => {
        switch (answer.trim()) {
          case '1':
            await this.testHealthCheck();
            await this.testDetailedHealth();
            askCommand();
            break;
          case '2':
            await this.testDailyFortune();
            askCommand();
            break;
          case '3':
            await this.testDiaryInsights();
            askCommand();
            break;
          case '4':
            await this.testMetrics();
            askCommand();
            break;
          case '5':
            await this.runAllTests();
            askCommand();
            break;
          case '6':
            console.log('👋 Goodbye!');
            rl.close();
            break;
          default:
            console.log('❌ Invalid command. Please enter 1-6.');
            askCommand();
        }
      });
    };

    askCommand();
  }
}

// 실행
const tester = new APITester();

// 커맨드라인 인자 확인
const args = process.argv.slice(2);

if (args.includes('--interactive') || args.includes('-i')) {
  tester.interactiveMode();
} else if (args.includes('--health')) {
  tester.testHealthCheck().then(() => process.exit(0));
} else if (args.includes('--fortune')) {
  tester.testDailyFortune().then(() => process.exit(0));
} else if (args.includes('--diary')) {
  tester.testDiaryInsights().then(() => process.exit(0));
} else {
  tester.runAllTests().then(() => process.exit(0));
}

// 사용법 출력
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
AI Service API Tester

Usage:
  node test-api.js [options]

Options:
  --interactive, -i    Interactive mode
  --health            Test health checks only
  --fortune           Test fortune interpretation only
  --diary             Test diary insights only
  --help, -h          Show this help message

Examples:
  node test-api.js                 # Run all tests once
  node test-api.js --interactive   # Interactive mode
  node test-api.js --health        # Health checks only
`);
  process.exit(0);
}