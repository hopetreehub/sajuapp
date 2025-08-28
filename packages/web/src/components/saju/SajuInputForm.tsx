import React, { useState } from 'react';
import { SajuBirthInfo } from '@/types/saju';

interface SajuInputFormProps {
  onSubmit: (birthInfo: SajuBirthInfo) => void;
}

const SajuInputForm: React.FC<SajuInputFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<SajuBirthInfo>({
    year: 1946,
    month: 3,
    day: 4,
    hour: 6,
    minute: 0,
    isLunar: false,
    name: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        🔮 생년월일시 입력
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이름 입력 (선택) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            이름 (선택사항)
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="홍길동"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* 생년월일 입력 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              년도
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              월
            </label>
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {months.map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              일
            </label>
            <select
              name="day"
              value={formData.day}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {days.map(day => (
                <option key={day} value={day}>{day}일</option>
              ))}
            </select>
          </div>
        </div>

        {/* 시간 입력 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              시
            </label>
            <select
              name="hour"
              value={formData.hour}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {hours.map(hour => (
                <option key={hour} value={hour}>
                  {hour.toString().padStart(2, '0')}시
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              분
            </label>
            <select
              name="minute"
              value={formData.minute}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>00분</option>
              <option value={15}>15분</option>
              <option value={30}>30분</option>
              <option value={45}>45분</option>
            </select>
          </div>
        </div>

        {/* 음력/양력 선택 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isLunar"
            name="isLunar"
            checked={formData.isLunar}
            onChange={handleChange}
            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="isLunar" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            음력으로 입력
          </label>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
        >
          사주 분석하기
        </button>
      </form>

      {/* 예시 정보 */}
      <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">예시:</span> 1946년 3월 4일 06시 00분 (양력)
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          정확한 출생 시간을 모르실 경우, 대략적인 시간대를 선택해주세요.
        </p>
      </div>
    </div>
  );
};

export default SajuInputForm;