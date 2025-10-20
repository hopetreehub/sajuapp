import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // 테스트 환경 설정
    environment: 'jsdom',

    // 글로벌 설정
    globals: true,

    // 셋업 파일
    setupFiles: ['./src/test/setup.ts'],

    // 테스트 파일 패턴 (E2E 테스트 제외)
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
    ],

    // 제외할 파일 패턴
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'tests/**/*', // Playwright E2E 테스트 제외
      '**/*.e2e.{test,spec}.{ts,tsx}', // E2E 테스트 파일 제외
    ],

    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      all: false, // 테스트되지 않은 파일 제외
      exclude: [
        'node_modules/',
        'dist/',
        'api/',
        'public/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.js',
        '**/*.cjs',
        '**/*.mjs',
      ],
    },

    // 타임아웃 설정
    testTimeout: 10000,
    hookTimeout: 10000,

    // UI 설정
    ui: true,

    // 워치 모드 설정
    watch: false,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
});
