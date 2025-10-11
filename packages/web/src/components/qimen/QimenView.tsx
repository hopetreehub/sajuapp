/**
 * 귀문둔갑(奇門遁甲) 메인 뷰
 *
 * 중국 고대 점술 시스템 - 시간과 방위의 길흉 판단
 * @author Claude Code
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { calculateQimenChart } from '@/utils/qimenCalculator';
import type { QimenChart, Palace } from '@/types/qimen';
import type { Customer } from '@/services/customerApi';
import QimenChart3x3 from './QimenChart';
import PalaceDetail from './PalaceDetail';
import TimeSelector from './TimeSelector';
import BeginnerGuide from './BeginnerGuide';
import SimpleSummary from './SimpleSummary';
import CustomerSelector from '../saju/CustomerSelector';

export default function QimenView() {
  // 상태 관리
  const [chart, setChart] = useState<QimenChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [showSimpleSummary, setShowSimpleSummary] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // 차트 계산 (고객 정보 포함)
  useEffect(() => {
    try {
      setLoading(true);

      // 고객 생년월일이 있으면 활용
      const birthInfo = selectedCustomer ? {
        year: parseInt(selectedCustomer.birth_date.split('-')[0]),
        month: parseInt(selectedCustomer.birth_date.split('-')[1]),
        day: parseInt(selectedCustomer.birth_date.split('-')[2]),
        hour: selectedCustomer.birth_time ? parseInt(selectedCustomer.birth_time.split(':')[0]) : undefined,
      } : undefined;

      const newChart = calculateQimenChart({
        dateTime: selectedDate,
        birthInfo,
      });
      setChart(newChart);
    } catch (error) {
      console.error('귀문둔갑 계산 에러:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedCustomer]);

  // 시간 변경 핸들러
  const handleTimeChange = (newDate: Date) => {
    setSelectedDate(newDate);
    setSelectedPalace(null); // 시간 변경 시 선택 해제
  };

  // 궁 선택 핸들러
  const handlePalaceSelect = (palace: Palace) => {
    setSelectedPalace(palace);
  };

  // 로딩 중
  if (loading || !chart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">국(局) 계산 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400">
              ⚡ 귀문둔갑
            </h1>
            <button
              onClick={() => setShowGuide(true)}
              className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-2"
            >
              <span>📖</span>
              <span>초보자 가이드</span>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
            奇門遁甲 - 시간과 방위의 길흉 판단
          </p>

          {/* 고객 선택 */}
          <div className="max-w-2xl mx-auto mb-6">
            <CustomerSelector
              selectedCustomer={selectedCustomer}
              onSelect={setSelectedCustomer}
              showAddButton={true}
            />
            {selectedCustomer && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                💡 {selectedCustomer.name}님의 생년월일({selectedCustomer.birth_date})을 기반으로 맞춤 해석을 제공합니다
              </div>
            )}
          </div>

          {/* 간단 요약 토글 */}
          <button
            onClick={() => setShowSimpleSummary(!showSimpleSummary)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            {showSimpleSummary ? '상세 모드로 보기 ▼' : '간단 요약 보기 ▲'}
          </button>

          {/* 국 정보 */}
          <div className="mt-4 flex justify-center gap-4 flex-wrap">
            <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm shadow-md">
              <span className="text-sm text-gray-500 dark:text-gray-400">국(局)</span>
              <span className="ml-2 font-bold text-purple-600 dark:text-purple-400">
                {chart.yinYang === 'yang' ? '양둔' : '음둔'} {chart.ju}국
              </span>
            </div>
            <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm shadow-md">
              <span className="text-sm text-gray-500 dark:text-gray-400">절기</span>
              <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                {chart.solarTerm.name}
              </span>
            </div>
            <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm shadow-md">
              <span className="text-sm text-gray-500 dark:text-gray-400">시간 간지</span>
              <span className="ml-2 font-bold text-pink-600 dark:text-pink-400">
                {chart.hourGanZhi.gan}{chart.hourGanZhi.zhi}
              </span>
            </div>
          </div>
        </header>

        {/* 시간 선택기 */}
        <TimeSelector
          selectedDate={selectedDate}
          onChange={handleTimeChange}
        />

        {/* 간단 요약 (초보자용) */}
        {showSimpleSummary && (
          <SimpleSummary chart={chart} />
        )}

        {/* 구궁 차트 */}
        <div className="my-8">
          <QimenChart3x3
            chart={chart}
            selectedPalace={selectedPalace}
            onPalaceSelect={handlePalaceSelect}
          />
        </div>

        {/* 전체 길흉 요약 */}
        <div className="mb-8 p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            📊 전체 운세
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`text-6xl font-bold ${
                  chart.overallFortune.score >= 80 ? 'text-green-500' :
                  chart.overallFortune.score >= 60 ? 'text-blue-500' :
                  chart.overallFortune.score >= 40 ? 'text-yellow-500' :
                  chart.overallFortune.score >= 20 ? 'text-orange-500' :
                  'text-red-500'
                }`}>
                  {chart.overallFortune.score}
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">종합 점수</div>
                  <div className="text-lg font-bold text-gray-700 dark:text-gray-200">
                    {chart.overallFortune.level === 'excellent' ? '대길 🌟' :
                     chart.overallFortune.level === 'good' ? '길 ✨' :
                     chart.overallFortune.level === 'neutral' ? '평 ⚖️' :
                     chart.overallFortune.level === 'bad' ? '흉 ⚠️' :
                     '대흉 ❌'}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {chart.overallFortune.summary}
              </p>
            </div>

            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                  ✅ 길한 방위
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {chart.overallFortune.bestPalaces.map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePalaceSelect(p)}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      {p}궁 ({chart.palaces[p].direction})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                  ⚠️ 불리한 방위
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {chart.overallFortune.worstPalaces.map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePalaceSelect(p)}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      {p}궁 ({chart.palaces[p].direction})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 선택한 궁 상세 정보 */}
        {selectedPalace && (
          <PalaceDetail
            palace={chart.palaces[selectedPalace]}
            onClose={() => setSelectedPalace(null)}
          />
        )}

        {/* 초보자 가이드 모달 */}
        {showGuide && (
          <BeginnerGuide onClose={() => setShowGuide(false)} />
        )}
      </div>
    </div>
  );
}
