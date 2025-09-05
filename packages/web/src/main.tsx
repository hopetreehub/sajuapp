import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 사주 계산 테스트 (개발용)
if (import.meta.env.DEV) {
  import('./utils/testSajuCalculation')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)