/**
 * 토스트 알림 컴포넌트
 *
 * 귀문둔갑 차트 변경 알림 등에 사용
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useEffect } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500 dark:bg-green-600',
    info: 'bg-blue-500 dark:bg-blue-600',
    warning: 'bg-orange-500 dark:bg-orange-600',
    error: 'bg-red-500 dark:bg-red-600',
  };

  const icons = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
      <div className={`${typeStyles[type]} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}>
        <span className="text-2xl">{icons[type]}</span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// 애니메이션 CSS는 index.css에 추가 필요
