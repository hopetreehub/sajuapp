import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT) || 4000,
      host: true,
      strictPort: false, // 임시로 false로 변경하여 테스트
      proxy: {
        // 고객 관리 서비스
        '/api/customers': {
          target: 'http://localhost:4002',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/customers/, '/api'),
        },
        // 캘린더 서비스
        '/api/calendar': {
          target: 'http://localhost:4012',
          changeOrigin: true,
          secure: false,
        },
        // 사주 분석 서비스
        '/api/saju': {
          target: 'http://localhost:4015',
          changeOrigin: true,
          secure: false,
        },
        // 인생 운세 차트 서비스
        '/api/lifetime-fortune': {
          target: 'http://localhost:4015',
          changeOrigin: true,
          secure: false,
        },
        // 일기 서비스
        '/api/diaries': {
          target: 'http://localhost:4004',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: parseInt(env.VITE_PORT) || 4000,
      strictPort: true,
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
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'calendar-vendor': ['date-fns', 'date-fns-tz'],
            'ui-vendor': ['@dnd-kit/core', '@dnd-kit/sortable'],
          },
        },
      },
    },
  };
});