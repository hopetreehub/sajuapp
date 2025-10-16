/**
 * 귀문둔갑 시간대 비교 컴포넌트
 *
 * 여러 시간대의 차트를 비교하여 길흉 변화를 분석
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { calculateQimenChart } from '@/utils/qimenCalculator';
import type { QimenChart, Palace } from '@/types/qimen';
import type { Customer } from '@/services/customerApi';

interface TimeComparisonProps {
  baseDate: Date;
  customer: Customer | null;
  onClose: () => void;
}

type ComparisonMode = 'hourly' | 'daily' | 'weekly';

interface ChartSnapshot {
  dateTime: Date;
  label: string;
  chart: QimenChart;
}

export default function TimeComparison({
  baseDate,
  customer,
  onClose,
}: TimeComparisonProps) {
  const [mode, setMode] = useState<ComparisonMode>('hourly');
  const [snapshots, setSnapshots] = useState<ChartSnapshot[]>([]);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);

  // 비교 차트 생성
  useEffect(() => {
    const birthInfo = customer ? {
      year: parseInt(customer.birth_date.split('-')[0]),
      month: parseInt(customer.birth_date.split('-')[1]),
      day: parseInt(customer.birth_date.split('-')[2]),
      hour: customer.birth_time ? parseInt(customer.birth_time.split(':')[0]) : undefined,
    } : undefined;

    const newSnapshots: ChartSnapshot[] = [];

    if (mode === 'hourly') {
      // 전후 4시간씩 (2시간 단위)
      for (let i = -4; i <= 4; i += 2) {
        const dateTime = new Date(baseDate);
        dateTime.setHours(baseDate.getHours() + i);

        const chart = calculateQimenChart({ dateTime, birthInfo });
        newSnapshots.push({
          dateTime,
          label: i === 0 ? '현재' : `${i > 0 ? '+' : ''}${i}시간`,
          chart,
        });
      }
    } else if (mode === 'daily') {
      // 전후 3일씩
      for (let i = -3; i <= 3; i++) {
        const dateTime = new Date(baseDate);
        dateTime.setDate(baseDate.getDate() + i);

        const chart = calculateQimenChart({ dateTime, birthInfo });
        newSnapshots.push({
          dateTime,
          label: i === 0 ? '오늘' : `${i > 0 ? '+' : ''}${i}일`,
          chart,
        });
      }
    } else if (mode === 'weekly') {
      // 전후 2주씩
      for (let i = -2; i <= 2; i++) {
        const dateTime = new Date(baseDate);
        dateTime.setDate(baseDate.getDate() + i * 7);

        const chart = calculateQimenChart({ dateTime, birthInfo });
        newSnapshots.push({
          dateTime,
          label: i === 0 ? '이번 주' : `${i > 0 ? '+' : ''}${i}주`,
          chart,
        });
      }
    }

    setSnapshots(newSnapshots);
  }, [mode, baseDate, customer]);

  // 궁의 길흉 변화 추적
  const getPalaceChanges = (palace: Palace) => {
    return snapshots.map(snapshot => ({
      label: snapshot.label,
      fortune: snapshot.chart.palaces[palace].fortune,
      score: snapshot.chart.overallFortune.score,
    }));
  };

  // 점수 색상 결정
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 20) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30';
    if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (score >= 20) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              📊 시간대별 길흉 변화 비교
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {customer
                ? `${customer.name}님의 운세 변화를 분석합니다`
                : '전체적인 운세 변화를 분석합니다'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 비교 모드 선택 */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-center gap-3">
            {[
              { value: 'hourly' as ComparisonMode, label: '⏰ 시간별', desc: '2시간 단위' },
              { value: 'daily' as ComparisonMode, label: '📅 일별', desc: '하루 단위' },
              { value: 'weekly' as ComparisonMode, label: '📆 주별', desc: '일주일 단위' },
            ].map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  mode === value
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div>{label}</div>
                <div className="text-xs opacity-75">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 비교 차트 그리드 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 스냅샷 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {snapshots.map((snapshot, idx) => {
              const isBase = snapshot.label === '현재' || snapshot.label === '오늘' || snapshot.label === '이번 주';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isBase
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  {/* 시간 정보 */}
                  <div className="text-center mb-3">
                    <div className={`text-sm font-bold mb-1 ${isBase ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {snapshot.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {snapshot.dateTime.toLocaleString('ko-KR', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* 국 정보 */}
                  <div className="text-center mb-3 p-2 bg-white dark:bg-gray-900/50 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {snapshot.chart.solarTerm.name}
                    </div>
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {snapshot.chart.yinYang === 'yang' ? '양둔' : '음둔'} {snapshot.chart.ju}국
                    </div>
                  </div>

                  {/* 종합 점수 */}
                  <div className={`text-center p-3 rounded-lg ${getScoreBg(snapshot.chart.overallFortune.score)}`}>
                    <div className={`text-3xl font-bold ${getScoreColor(snapshot.chart.overallFortune.score)}`}>
                      {snapshot.chart.overallFortune.score}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {snapshot.chart.overallFortune.level === 'excellent' ? '대길' :
                       snapshot.chart.overallFortune.level === 'good' ? '길' :
                       snapshot.chart.overallFortune.level === 'neutral' ? '평' :
                       snapshot.chart.overallFortune.level === 'bad' ? '흉' : '대흉'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 궁별 변화 추적 (선택한 궁) */}
          {selectedPalace && (
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                🎯 {selectedPalace}궁 변화 추적
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {getPalaceChanges(selectedPalace).map((change, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg text-center border border-gray-200 dark:border-gray-700"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {change.label}
                    </div>
                    <div className={`text-sm font-bold ${
                      change.fortune === 'excellent' ? 'text-green-600' :
                      change.fortune === 'good' ? 'text-blue-600' :
                      change.fortune === 'neutral' ? 'text-yellow-600' :
                      change.fortune === 'bad' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {change.fortune === 'excellent' ? '대길' :
                       change.fortune === 'good' ? '길' :
                       change.fortune === 'neutral' ? '평' :
                       change.fortune === 'bad' ? '흉' : '대흉'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 궁 선택 패널 */}
          <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              🔍 궁 선택하여 변화 추적
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Palace[]).map(palace => (
                <button
                  key={palace}
                  onClick={() => setSelectedPalace(palace)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedPalace === palace
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {palace}궁
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 시간대별 길흉 변화를 비교하여 최적의 행동 시점을 파악하세요
          </p>
        </div>
      </div>
    </div>
  );
}
