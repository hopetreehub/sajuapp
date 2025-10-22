import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import viteImagemin from 'vite-plugin-imagemin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),

      // Gzip 압축 (프로덕션)
      mode === 'production' && viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240, // 10KB 이상만 압축
        deleteOriginFile: false,
      }),

      // Brotli 압축 (프로덕션)
      mode === 'production' && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240,
        deleteOriginFile: false,
      }),

      // 이미지 최적화 (프로덕션)
      mode === 'production' && viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 7,
        },
        mozjpeg: {
          quality: 80,
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4,
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox',
              active: false,
            },
            {
              name: 'removeEmptyAttrs',
              active: true,
            },
          ],
        },
      }),

      // 번들 분석기 (빌드 시)
      mode === 'production' && visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    server: {
      port: parseInt(env.VITE_PORT) || 4000,
      host: true,
      strictPort: false, // 임시로 false로 변경하여 테스트
      proxy: {
        // 인증 서비스
        '/api/auth': {
          target: 'http://localhost:4018',
          changeOrigin: true,
          secure: false,
        },
        // 관리자 서비스
        '/api/admin': {
          target: 'http://localhost:4018',
          changeOrigin: true,
          secure: false,
        },
        // 고객 관리 서비스 - Vercel Functions 사용 (프록시 제거)
        // '/api/customers': {
        //   target: 'http://localhost:4016',
        //   changeOrigin: true,
        //   secure: false,
        // },
        // 캘린더 서비스
        '/api/calendar': {
          target: 'http://localhost:4012',
          changeOrigin: true,
          secure: false,
        },
        '/api/events': {
          target: 'http://localhost:4012',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api/calendar'),
        },
        '/api/tags': {
          target: 'http://localhost:4012',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api/calendar'),
        },
        '/api/todos': {
          target: 'http://localhost:4012',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api/calendar'),
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
        // AI 서비스 (귀문둔갑)
        '/api/v1/qimen': {
          target: 'http://localhost:4017',
          changeOrigin: true,
          secure: false,
        },
        // AI 서비스 (자미두수)
        '/api/v1/ziwei': {
          target: 'http://localhost:4017',
          changeOrigin: true,
          secure: false,
        },
        // AI 서비스 (사주)
        '/api/v1/saju': {
          target: 'http://localhost:4017',
          changeOrigin: true,
          secure: false,
        },
        // AI 서비스 (타로)
        '/api/v1/tarot': {
          target: 'http://localhost:4017',
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
      sourcemap: mode === 'production' ? false : true, // 프로덕션에서는 sourcemap 비활성화
      minify: 'terser', // 코드 압축 최적화
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // 프로덕션에서 console 제거
          drop_debugger: true,
        },
      },
      chunkSizeWarningLimit: 1000, // 청크 크기 경고 임계값 (KB)
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // React 관련 라이브러리 (최우선 - 모든 React 기반 라이브러리 포함)
            if (id.includes('node_modules/react') ||
                id.includes('node_modules/react-dom') ||
                id.includes('node_modules/react-router-dom') ||
                id.includes('node_modules/@react-three') ||
                id.includes('node_modules/react-chartjs-2') ||
                id.includes('node_modules/react-markdown') ||
                id.includes('node_modules/@dnd-kit') ||
                id.includes('node_modules/framer-motion') ||
                id.includes('node_modules/lucide-react')) {
              return 'react-vendor';
            }
            // Three.js 라이브러리만
            if (id.includes('node_modules/three')) {
              return 'three-vendor';
            }
            // Chart.js (React 제외)
            if (id.includes('node_modules/chart.js')) {
              return 'chart-vendor';
            }
            // 날짜 관련 라이브러리
            if (id.includes('node_modules/date-fns')) {
              return 'calendar-vendor';
            }
            // 문서 생성 관련 (React 제외)
            if (id.includes('node_modules/html2canvas') ||
                id.includes('node_modules/jspdf')) {
              return 'document-vendor';
            }
            // 나머지 node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          // 파일명 패턴 (캐시 최적화)
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      // 자산 인라인 제한 (4kb 이하는 base64로 인라인)
      assetsInlineLimit: 4096,
    },
  };
});