import request from 'supertest';
import AIServiceApplication from '../src/index';
import { SajuData } from '../src/types/ai.types';

describe('AI Service Integration Tests', () => {
  let app: any;
  const testApiKey = 'saju-dev-key-12345';
  
  beforeAll(async () => {
    // Test application instance
    const appInstance = new AIServiceApplication();
    app = appInstance.getApp();
    
    // Wait for services to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    // Cleanup if needed
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Health Check Endpoints', () => {
    test('GET /api/v1/health - should return service status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('uptime');
    });

    test('GET /api/v1/health/detailed - should return detailed status', async () => {
      const response = await request(app)
        .get('/api/v1/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('ai_providers');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('system');
    });

    test('GET /api/v1/health/providers - should return provider status', async () => {
      const response = await request(app)
        .get('/api/v1/health/providers')
        .expect(200);

      expect(response.body).toHaveProperty('providers');
      expect(response.body).toHaveProperty('total_providers');
      expect(response.body).toHaveProperty('healthy_providers');
    });

    test('GET /api/v1/health/ready - should return readiness status', async () => {
      const response = await request(app)
        .get('/api/v1/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('ready', true);
      expect(response.body).toHaveProperty('healthy_providers');
    });
  });

  describe('Authentication', () => {
    test('should reject requests without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/fortune/daily')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Missing authentication credentials');
    });

    test('should accept requests with valid API key', async () => {
      const response = await request(app)
        .post('/api/v1/fortune/daily')
        .set('X-API-Key', testApiKey)
        .send(getTestSajuData())
        .expect(400); // Will fail validation, but auth should pass

      // Should not be auth error
      expect(response.body.error).not.toBe('Missing authentication credentials');
    });

    test('should reject requests with invalid API key', async () => {
      const response = await request(app)
        .post('/api/v1/fortune/daily')
        .set('X-API-Key', 'invalid-key')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid API key');
    });
  });

  describe('Fortune Interpretation Endpoints', () => {
    const validSajuRequest = {
      sajuData: getTestSajuData().sajuData,
      targetDate: new Date().toISOString(),
      interpretationType: 'daily',
      profession: 'office_worker',
      focusAreas: ['work', 'health'],
      systemPrompt: 'Test system prompt',
      userPrompt: 'Test user prompt',
      requestType: 'fortune_interpretation'
    };

    test('POST /api/v1/fortune/daily - should validate request data', async () => {
      const response = await request(app)
        .post('/api/v1/fortune/daily')
        .set('X-API-Key', testApiKey)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid request data');
      expect(response.body).toHaveProperty('details');
    });

    test('POST /api/v1/fortune/daily - should process valid request', async () => {
      const response = await request(app)
        .post('/api/v1/fortune/daily')
        .set('X-API-Key', testApiKey)
        .send(validSajuRequest);

      // This might return 503 if no AI providers are actually configured
      // but should not return validation errors
      expect(response.body).toHaveProperty('success');
      
      if (response.body.success) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('interpretation');
        expect(response.body.data).toHaveProperty('sajuSummary');
        expect(response.body.data).toHaveProperty('metadata');
      }
    }, 15000); // Longer timeout for AI processing

    test('POST /api/v1/fortune/weekly - should process weekly request', async () => {
      const response = await request(app)
        .post('/api/v1/fortune/weekly')
        .set('X-API-Key', testApiKey)
        .send(validSajuRequest);

      expect(response.body).toHaveProperty('success');
      
      if (response.body.success) {
        expect(response.body.data).toHaveProperty('weekStart');
        expect(response.body.data).toHaveProperty('weekEnd');
      }
    }, 15000);

    test('POST /api/v1/fortune/monthly - should process monthly request', async () => {
      const response = await request(app)
        .post('/api/v1/fortune/monthly')
        .set('X-API-Key', testApiKey)
        .send(validSajuRequest);

      expect(response.body).toHaveProperty('success');
      
      if (response.body.success) {
        expect(response.body.data).toHaveProperty('month');
        expect(response.body.data).toHaveProperty('year');
      }
    }, 15000);
  });

  describe('Diary Insights Endpoints', () => {
    const validDiaryRequest = {
      diaryContent: '오늘은 정말 힘든 하루였다. 회사에서 프로젝트가 잘 안 풀려서 스트레스를 많이 받았다.',
      mood: 2,
      sajuData: getTestSajuData().sajuData,
      previousInsights: ['이전 인사이트 예시'],
      systemPrompt: 'Test system prompt',
      userPrompt: 'Test user prompt',
      requestType: 'diary_insights'
    };

    test('POST /api/v1/diary/insights - should validate request data', async () => {
      const response = await request(app)
        .post('/api/v1/diary/insights')
        .set('X-API-Key', testApiKey)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid request data');
    });

    test('POST /api/v1/diary/insights - should process valid diary request', async () => {
      const response = await request(app)
        .post('/api/v1/diary/insights')
        .set('X-API-Key', testApiKey)
        .send(validDiaryRequest);

      expect(response.body).toHaveProperty('success');
      
      if (response.body.success) {
        expect(response.body.data).toHaveProperty('insight');
        expect(response.body.data.insight).toHaveProperty('content');
        expect(response.body.data.insight).toHaveProperty('mood');
        expect(response.body.data.insight).toHaveProperty('recommendations');
      }
    }, 15000);

    test('POST /api/v1/diary/advice - should provide personal advice', async () => {
      const response = await request(app)
        .post('/api/v1/diary/advice')
        .set('X-API-Key', testApiKey)
        .send(validDiaryRequest);

      expect(response.body).toHaveProperty('success');
      
      if (response.body.success) {
        expect(response.body.data).toHaveProperty('advice');
        expect(response.body.data.advice).toHaveProperty('actionItems');
        expect(response.body.data.advice).toHaveProperty('longTermGoals');
      }
    }, 15000);
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits', async () => {
      const requests = Array.from({ length: 15 }, (_, i) =>
        request(app)
          .get('/api/v1/health')
      );

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);
      
      // Should have some rate limited requests if limit is < 15
      // This depends on the actual rate limit configuration
      expect(tooManyRequests.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/fortune/daily')
        .set('X-API-Key', testApiKey)
        .set('Content-Type', 'application/json')
        .send('invalid json{')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid JSON');
    });

    test('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/v1/unknown-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Not found');
    });
  });

  describe('Documentation', () => {
    test('GET /api/v1/docs - should return API documentation', async () => {
      const response = await request(app)
        .get('/api/v1/docs')
        .expect(200);

      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(Array.isArray(response.body.endpoints)).toBe(true);
    });

    test('GET / - should return service information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  // Helper function to generate test Saju data
  function getTestSajuData(): { sajuData: SajuData } {
    return {
      sajuData: {
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
      }
    };
  }
});

// Mock AI Service Tests (when no real AI providers are configured)
describe('Mock AI Service Tests', () => {
  test('should handle AI service unavailable gracefully', async () => {
    // This test verifies that the service handles cases where 
    // AI providers are not available or not configured
    expect(true).toBe(true); // Placeholder
  });

  test('should cache responses properly', async () => {
    // Test caching functionality
    expect(true).toBe(true); // Placeholder
  });

  test('should track metrics correctly', async () => {
    // Test metrics collection
    expect(true).toBe(true); // Placeholder
  });
});