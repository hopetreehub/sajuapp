import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './utils/registerServiceWorker';

// 사주 계산 테스트 (개발용)
if (import.meta.env.DEV) {
  import('./utils/testSajuCalculation');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Service Worker 등록 (프로덕션 환경에서만)
if (import.meta.env.PROD) {
  registerServiceWorker()
    .then((registration) => {
      if (registration) {
        console.log('✅ App is ready to work offline');
      }
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}