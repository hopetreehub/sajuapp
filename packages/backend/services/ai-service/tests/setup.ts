// Jest 테스트 설정 파일

import { logger } from '../src/utils/logger';

// 테스트 환경에서는 로그 레벨을 error로 설정하여 테스트 출력을 깔끔하게 유지
logger.level = 'error';

// 테스트 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // 랜덤 포트 사용
process.env.LOG_LEVEL = 'error';
process.env.DEEPINFRA_API_KEY = 'test-api-key';
process.env.DEEPINFRA_BASE_URL = 'https://api.deepinfra.com/v1/openai';
process.env.DEEPINFRA_DEFAULT_MODEL = 'Qwen/Qwen2.5-32B-Instruct';

// 테스트 타임아웃 설정
jest.setTimeout(30000);

// 전역 테스트 setup
beforeAll(async () => {
  // 테스트 시작 전 필요한 초기화 작업
});

afterAll(async () => {
  // 테스트 완료 후 정리 작업
});

// Mock 네트워크 요청들을 위한 전역 설정
global.console = {
  ...console,
  // 테스트 중 불필요한 로그 숨기기
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error
};