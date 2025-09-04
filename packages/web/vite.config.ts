import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT) || 4000,
      host: true,
      strictPort: true, // 포트 4000번 강제
      proxy: {
        '/api/diaries': {
          target: 'http://localhost:4004',
          changeOrigin: true,
          secure: false,
        },
        '/api/calendar': {
          target: env.VITE_API_URL || 'http://localhost:4003',
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:4003',
          changeOrigin: true,
          secure: false,
        }
      }
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
      }
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
          }
        }
      }
    }
  }
})