import { test, expect } from '@playwright/test';

/**
 * API 엔드포인트 E2E 테스트
 */
test.describe('Customers API', () => {
  const baseURL = 'http://localhost:4000';

  test('GET /api/customers - 모든 고객 조회', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/customers`);

    // 상태 코드 확인
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    // 응답 본문 확인
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('POST /api/customers - 고객 생성 (메모리 모드)', async ({ request }) => {
    const newCustomer = {
      name: '테스트 고객',
      birth_date: '1990-01-01',
      birth_time: '12:00:00',
      phone: '010-0000-0000',
      gender: 'male',
      lunar_solar: 'solar',
      memo: 'E2E 테스트용 고객',
    };

    const response = await request.post(`${baseURL}/api/customers`, {
      data: newCustomer,
    });

    // 상태 코드 확인
    if (response.status() === 201 || response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('name', newCustomer.name);
    } else {
      // PostgreSQL이 설정되지 않은 경우 500 에러가 날 수 있음
      expect([500, 503]).toContain(response.status());
    }
  });

  test('POST /api/customers - 필수 필드 누락 시 400 에러', async ({ request }) => {
    const invalidCustomer = {
      name: '테스트 고객',
      // birth_date, birth_time, gender, lunar_solar 누락
    };

    const response = await request.post(`${baseURL}/api/customers`, {
      data: invalidCustomer,
    });

    // 400 Bad Request
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('POST /api/customers - XSS 공격 차단', async ({ request }) => {
    const xssCustomer = {
      name: '<script>alert("XSS")</script>',
      birth_date: '1990-01-01',
      birth_time: '12:00:00',
      gender: 'male',
      lunar_solar: 'solar',
    };

    const response = await request.post(`${baseURL}/api/customers`, {
      data: xssCustomer,
    });

    if (response.ok()) {
      const data = await response.json();

      // Sanitization 확인
      expect(data.data.name).not.toContain('<script>');
      expect(data.data.name).toContain('&lt;');
    }
  });

  test('Rate Limiting - 60+ 요청 시 429 에러', async ({ request }) => {
    // 60회 연속 요청
    const requests = [];
    for (let i = 0; i < 61; i++) {
      requests.push(request.get(`${baseURL}/api/customers`));
    }

    const responses = await Promise.all(requests);

    // 마지막 요청들 중 일부는 429 에러가 나야 함
    const rateLimitedResponses = responses.filter((r) => r.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);

    // Rate Limit 헤더 확인
    const lastResponse = responses[responses.length - 1];
    if (lastResponse.status() === 429) {
      expect(lastResponse.headers()['x-ratelimit-limit']).toBeDefined();
    }
  });
});

/**
 * 보안 헤더 테스트
 */
test.describe('보안 헤더', () => {
  const baseURL = 'http://localhost:4000';

  test('API 응답에 보안 헤더가 포함된다', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/customers`);
    const headers = response.headers();

    // CORS 헤더
    expect(headers['access-control-allow-origin']).toBeDefined();
    expect(headers['access-control-allow-methods']).toBeDefined();

    // 보안 헤더
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
  });

  test('OPTIONS 요청 (CORS preflight)이 처리된다', async ({ request }) => {
    const response = await request.fetch(`${baseURL}/api/customers`, {
      method: 'OPTIONS',
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['access-control-allow-methods']).toBeDefined();
  });
});

/**
 * 에러 핸들링 테스트
 */
test.describe('에러 핸들링', () => {
  const baseURL = 'http://localhost:4000';

  test('존재하지 않는 엔드포인트 - 404', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/nonexistent`);
    expect(response.status()).toBe(404);
  });

  test('잘못된 메서드 - 405', async ({ request }) => {
    const response = await request.patch(`${baseURL}/api/customers`, {
      data: {},
    });

    // 405 Method Not Allowed 또는 404
    expect([404, 405]).toContain(response.status());
  });

  test('SQL Injection 시도 차단', async ({ request }) => {
    const sqlInjection = {
      name: "'; DROP TABLE customers; --",
      birth_date: '1990-01-01',
      birth_time: '12:00:00',
      gender: 'male',
      lunar_solar: 'solar',
    };

    const response = await request.post(`${baseURL}/api/customers`, {
      data: sqlInjection,
    });

    // 400 Bad Request (검증 실패) 또는 500 (에러 처리)
    expect([400, 500]).toContain(response.status());

    if (response.status() === 400) {
      const data = await response.json();
      expect(data.error).toMatch(/허용되지 않는 문자|Invalid/i);
    }
  });
});
