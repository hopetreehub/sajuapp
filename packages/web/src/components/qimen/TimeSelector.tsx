/**
 * 귀문둔갑 시간 선택기
 *
 * 날짜와 시간을 선택하여 국(局) 재계산
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState } from 'react';

interface TimeSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export default function TimeSelector({ selectedDate, onChange }: TimeSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);

  // 현재 시간으로 리셋
  const handleResetToNow = () => {
    onChange(new Date());
    setShowPicker(false);
  };

  // 날짜 변경
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      const updatedDate = new Date(selectedDate);
      updatedDate.setFullYear(newDate.getFullYear());
      updatedDate.setMonth(newDate.getMonth());
      updatedDate.setDate(newDate.getDate());
      onChange(updatedDate);
    }
  };

  // 시간 변경
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const updatedDate = new Date(selectedDate);
    updatedDate.setHours(hours, minutes);
    onChange(updatedDate);
  };

  // 날짜 포맷
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  // 시간 포맷
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // input 값 포맷
  const getDateInputValue = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTimeInputValue = () => {
    const hours = String(selectedDate.getHours()).padStart(2, '0');
    const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="mb-6">
      {/* 선택된 시간 표시 */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-left">
              <div className="text-sm text-gray-500 dark:text-gray-400">선택된 시간</div>
              <div className="font-bold text-gray-800 dark:text-gray-100">
                {formatDate(selectedDate)} {formatTime(selectedDate)}
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={handleResetToNow}
          className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 font-medium"
        >
          현재 시간
        </button>
      </div>

      {/* 날짜/시간 선택기 */}
      {showPicker && (
        <div className="p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm shadow-xl border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            시간 선택
          </h3>

          <div className="space-y-4">
            {/* 날짜 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                날짜
              </label>
              <input
                type="date"
                value={getDateInputValue()}
                onChange={handleDateChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* 시간 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                시간
              </label>
              <input
                type="time"
                value={getTimeInputValue()}
                onChange={handleTimeChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* 간지 시간 안내 */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-xs text-blue-700 dark:text-blue-300">
                💡 <strong>간지 시간 안내</strong>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• 자시(子時): 23:00~01:00</li>
                  <li>• 축시(丑時): 01:00~03:00</li>
                  <li>• 인시(寅時): 03:00~05:00</li>
                  <li>• 묘시(卯時): 05:00~07:00</li>
                  <li>• 진시(辰時): 07:00~09:00</li>
                  <li>• 사시(巳時): 09:00~11:00</li>
                  <li>• 오시(午時): 11:00~13:00</li>
                  <li>• 미시(未時): 13:00~15:00</li>
                  <li>• 신시(申時): 15:00~17:00</li>
                  <li>• 유시(酉時): 17:00~19:00</li>
                  <li>• 술시(戌時): 19:00~21:00</li>
                  <li>• 해시(亥時): 21:00~23:00</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={() => setShowPicker(false)}
            className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg font-medium transition-colors"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}
