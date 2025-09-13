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
      strictPort: true, // 포트 4000번 절대 강제 - CLAUDE.md 정책 준수
      proxy: {
        // 모든 API 요청을 내장된 API Gateway로 프록시 (포트 4000 정책)
        '/api': {
          target: 'http://localhost:5000', // API Gateway 내부 포트
          changeOrigin: true,
          secure: false,
          ws: true, // WebSocket 지원
          configure: (proxy, _options) => {
            // 프록시 에러 처리 개선
            proxy.on('error', (err, _req, _res) => {
              console.error('Proxy error:', err);
            },);
          },
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