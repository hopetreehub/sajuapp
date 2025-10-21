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
import Qimen3DRenderer from './Qimen3DRenderer';
import PalaceDetail from './PalaceDetail';
import TimeSelector from './TimeSelector';
import BeginnerGuide from './BeginnerGuide';
import SimpleSummary from './SimpleSummary';
import FortuneHeatmap from './FortuneHeatmap';
import TimeComparison from './TimeComparison';
import CustomerSelector from '../saju/CustomerSelector';
import { analyzeBirthDate } from '@/utils/birthYearAnalysis';
import { calculatePersonalizedOverallScore } from '@/utils/qimenPersonalization';
import { getAllContexts, type QimenContext } from '@/data/qimenContextWeights';
import AIChat from './AIChat';
import Toast, { type ToastType } from '../Common/Toast';
import { exportContentToPDF } from '@/utils/pdfExport';
import NotificationSettings from './NotificationSettings';
import BookmarkButton from './BookmarkButton';
import ShareModal from './ShareModal';
import StatsDashboard from './StatsDashboard';

export default function QimenView() {
  // 상태 관리
  const [chart, setChart] = useState<QimenChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showSimpleSummary, setShowSimpleSummary] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // 고객 선택 관련 상태
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [appliedCustomer, setAppliedCustomer] = useState<Customer | null>(null);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  // 목적 선택 상태
  const [selectedContext, setSelectedContext] = useState<QimenContext>('general');
  const [showAIChat, setShowAIChat] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // 자동 갱신 관련 상태
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeUntilChange, setTimeUntilChange] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    type: 'hour' | 'day' | 'solarTerm';
  } | null>(null);

  // 토스트 알림 상태
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  // 알림 설정 모달 상태
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // 공유 모달 상태
  const [showShareModal, setShowShareModal] = useState(false);

  // 통계 대시보드 상태
  const [showStatsDashboard, setShowStatsDashboard] = useState(false);

  // 변경 히스토리
  const [changeHistory, setChangeHistory] = useState<Array<{
    timestamp: Date;
    ju: number;
    yinYang: string;
    solarTerm: string;
    type: 'hour' | 'day' | 'solarTerm';
  }>>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 고객 선택 변경 감지
  useEffect(() => {
    setHasUnappliedChanges(selectedCustomer?.id !== appliedCustomer?.id);
  }, [selectedCustomer, appliedCustomer]);

  // 차트 계산 (적용된 고객 정보 사용)
  useEffect(() => {
    console.log('🔮 [귀문둔갑] useEffect 실행 시작');
    try {
      setLoading(true);
      setError(null);

      // 적용된 고객 생년월일 활용
      const birthInfo = appliedCustomer ? {
        year: parseInt(appliedCustomer.birth_date.split('-')[0]),
        month: parseInt(appliedCustomer.birth_date.split('-')[1]),
        day: parseInt(appliedCustomer.birth_date.split('-')[2]),
        hour: appliedCustomer.birth_time ? parseInt(appliedCustomer.birth_time.split(':')[0]) : undefined,
      } : undefined;

      console.log('🔮 [귀문둔갑] 차트 재계산:', {
        고객: appliedCustomer?.name,
        생년월일: appliedCustomer?.birth_date,
        시간: selectedDate.toLocaleString(),
        birthInfo,
      });

      const newChart = calculateQimenChart({
        dateTime: selectedDate,
        birthInfo,
      });

      // 이전 차트와 비교하여 변경사항 확인
      if (chart) {
        let changeType: 'hour' | 'day' | 'solarTerm' | null = null;
        let changeMessage = '';

        // 절기 변경
        if (chart.solarTerm.name !== newChart.solarTerm.name) {
          changeType = 'solarTerm';
          changeMessage = `🌸 절기가 변경되었습니다: ${chart.solarTerm.name} → ${newChart.solarTerm.name}`;
        }
        // 국 변경 (절기 변경 시 함께 바뀜)
        else if (chart.ju !== newChart.ju || chart.yinYang !== newChart.yinYang) {
          changeType = 'solarTerm';
          changeMessage = `⚡ 국(局)이 변경되었습니다: ${chart.yinYang === 'yang' ? '양둔' : '음둔'} ${chart.ju}국 → ${newChart.yinYang === 'yang' ? '양둔' : '음둔'} ${newChart.ju}국`;
        }
        // 일간 변경
        else if (chart.dayGan !== newChart.dayGan) {
          changeType = 'day';
          changeMessage = `📅 일간(日干)이 변경되었습니다: ${chart.dayGan} → ${newChart.dayGan}`;
        }
        // 시간 변경
        else if (chart.hourGanZhi.gan !== newChart.hourGanZhi.gan || chart.hourGanZhi.zhi !== newChart.hourGanZhi.zhi) {
          changeType = 'hour';
          changeMessage = `⏰ 시간이 변경되었습니다: ${chart.hourGanZhi.gan}${chart.hourGanZhi.zhi} → ${newChart.hourGanZhi.gan}${newChart.hourGanZhi.zhi}`;
        }

        // 변경사항이 있으면 토스트 표시 및 히스토리 추가
        if (changeType && changeMessage) {
          setToast({
            message: changeMessage,
            type: changeType === 'solarTerm' ? 'warning' : 'info',
          });

          // 히스토리 추가 (최대 10개)
          setChangeHistory(prev => [
            {
              timestamp: new Date(),
              ju: newChart.ju,
              yinYang: newChart.yinYang === 'yang' ? '양둔' : '음둔',
              solarTerm: newChart.solarTerm.name,
              type: changeType,
            },
            ...prev.slice(0, 9),
          ]);
        }
      }

      setChart(newChart);

      console.log('✅ [귀문둔갑] 차트 계산 완료:', newChart.ju, newChart.yinYang);
    } catch (error) {
      console.error('❌ [귀문둔갑] 계산 에러:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
      console.log('🔮 [귀문둔갑] useEffect 완료, loading:', false);
    }
  }, [selectedDate, appliedCustomer]);

  // 다음 변경까지 시간 계산
  useEffect(() => {
    const calculateTimeUntilChange = () => {
      const now = new Date();
      const currentHour = now.getHours();

      // 다음 2시간 경계 (팔신 변경)
      const nextEvenHour = currentHour % 2 === 0 ? currentHour + 2 : currentHour + 1;
      const nextHourChange = new Date(now);
      nextHourChange.setHours(nextEvenHour, 0, 0, 0);

      // 다음 자정 (일간 변경)
      const nextDayChange = new Date(now);
      nextDayChange.setDate(nextDayChange.getDate() + 1);
      nextDayChange.setHours(0, 0, 0, 0);

      // 가장 가까운 변경 시점
      const timeDiff = nextHourChange.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeUntilChange({
        hours,
        minutes,
        seconds,
        type: 'hour',
      });
    };

    calculateTimeUntilChange();
    const interval = setInterval(calculateTimeUntilChange, 1000);

    return () => clearInterval(interval);
  }, []);

  // 자동 갱신 (2시간마다)
  useEffect(() => {
    if (!autoRefresh) return;

    const checkAndRefresh = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // 짝수 시각의 정각이면 갱신 (01:00, 03:00, 05:00 등)
      if (currentMinute === 0 && currentHour % 2 === 1) {
        console.log('⏰ [귀문둔갑] 자동 갱신 - 시간 변경 감지');
        setSelectedDate(new Date());

        // 알림 표시 (나중에 추가)
        // showNotification('시간이 변경되었습니다. 차트가 자동 갱신되었습니다.');
      }
    };

    // 1분마다 체크
    const interval = setInterval(checkAndRefresh, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // 시간 변경 핸들러
  const handleTimeChange = (newDate: Date) => {
    setSelectedDate(newDate);
    setSelectedPalace(null); // 시간 변경 시 선택 해제
  };

  // 궁 선택 핸들러
  const handlePalaceSelect = (palace: Palace) => {
    console.log('🎯 [귀문둔갑] 방위 클릭:', palace, '궁');
    setSelectedPalace(palace);
  };

  // 고객 적용 핸들러
  const handleApplyCustomer = () => {
    console.log('🔥 [귀문둔갑] 고객 적용:', selectedCustomer?.name, selectedCustomer?.birth_date);
    setAppliedCustomer(selectedCustomer);
    setHasUnappliedChanges(false);
  };

  // PDF 출력 핸들러
  const handleExportPDF = async () => {
    if (!chart) return;

    setIsExportingPDF(true);
    try {
      const customerInfo = appliedCustomer
        ? `${appliedCustomer.name}(${appliedCustomer.birth_date})`
        : '일반';
      const timeInfo = selectedDate.toLocaleString('ko-KR');

      await exportContentToPDF(
        'qimen-content',
        '⚡ 귀문둔갑 분석 결과',
        `${chart.yinYang === 'yang' ? '양둔' : '음둔'} ${chart.ju}국 | ${chart.solarTerm.name} | ${timeInfo}`,
        `귀문둔갑_${customerInfo}`,
      );
      alert('PDF 출력이 완료되었습니다.');
    } catch (error) {
      console.error('PDF 출력 실패:', error);
      alert('PDF 출력 중 오류가 발생했습니다.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // 에러 화면
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">귀문둔갑 계산 오류</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (loading || !chart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">국(局) 계산 중...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Loading: {String(loading)}, Chart: {chart ? 'exists' : 'null'}</p>
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
            <button
              onClick={() => setShowNotificationSettings(true)}
              className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors flex items-center gap-2"
            >
              <span>🔔</span>
              <span>알림 설정</span>
            </button>
            <button
              onClick={() => setShowStatsDashboard(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-sm font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span>📊</span>
              <span>통계 분석</span>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
            奇門遁甲 - 시간과 방위의 길흉 판단
          </p>

          {/* 자동 갱신 및 다음 변경까지 시간 */}
          <div className="flex justify-center items-center gap-3 mb-4 flex-wrap">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                autoRefresh
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {autoRefresh ? '🔄 자동 갱신 ON' : '⏸️ 자동 갱신 OFF'}
            </button>
            {timeUntilChange && (
              <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                ⏱️ 다음 변경까지: {timeUntilChange.hours > 0 && `${timeUntilChange.hours}시간 `}
                {timeUntilChange.minutes}분 {timeUntilChange.seconds}초
              </div>
            )}
            {changeHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-1"
              >
                📊 변경 히스토리 ({changeHistory.length})
              </button>
            )}
          </div>

          {/* 목적 선택 */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🎯 목적:
              </label>
              <select
                value={selectedContext}
                onChange={(e) => setSelectedContext(e.target.value as QimenContext)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-lg text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
              >
                {getAllContexts().map((ctx) => (
                  <option key={ctx.value} value={ctx.value}>
                    {ctx.icon} {ctx.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowAIChat(!showAIChat)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>🤖</span>
                <span>AI에게 질문하기</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>📄</span>
                <span>{isExportingPDF ? 'PDF 생성 중...' : 'PDF 출력'}</span>
              </button>
              <button
                onClick={() => setShowComparison(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>📊</span>
                <span>시간대 비교</span>
              </button>
              <BookmarkButton
                chart={chart}
                dateTime={selectedDate}
                customerName={appliedCustomer?.name}
                customerBirthDate={appliedCustomer?.birth_date}
                context={selectedContext}
              />
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <span>📤</span>
                <span>공유하기</span>
              </button>
            </div>
            {selectedContext !== 'general' && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                💡 <strong>{getAllContexts().find(c => c.value === selectedContext)?.description}</strong>에 특화된 해석을 제공합니다
              </div>
            )}
          </div>

          {/* 고객 선택 */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex items-center justify-center gap-3">
              <CustomerSelector
                selectedCustomer={selectedCustomer}
                onSelect={setSelectedCustomer}
                showAddButton={true}
              />
              {selectedCustomer && (
                <button
                  onClick={handleApplyCustomer}
                  disabled={!hasUnappliedChanges}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    hasUnappliedChanges
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl animate-pulse'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {hasUnappliedChanges ? '✨ 적용하기' : '✓ 적용됨'}
                </button>
              )}
            </div>
            {appliedCustomer && (
              <div className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                💡 현재 <strong>{appliedCustomer.name}</strong>님({appliedCustomer.birth_date}) 기준으로 맞춤 해석 중
              </div>
            )}
            {selectedCustomer && hasUnappliedChanges && (
              <div className="mt-2 text-sm text-center text-orange-600 dark:text-orange-400 font-medium">
                ⚠️ <strong>{selectedCustomer.name}</strong>님으로 변경하려면 "적용하기" 버튼을 클릭하세요
              </div>
            )}
          </div>

          {/* 간단 요약 토글 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowSimpleSummary(!showSimpleSummary)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {showSimpleSummary ? '상세 모드로 보기 ▼' : '간단 요약 보기 ▲'}
            </button>
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showHeatmap
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {showHeatmap ? '🎨 히트맵 모드' : '📊 차트 모드'}
            </button>
            <button
              onClick={() => setShow3D(!show3D)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                show3D
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {show3D ? '🎲 3D 모드' : '🎯 2D 모드'}
            </button>
          </div>

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

        {/* PDF 출력용 컨테이너 */}
        <div
          id="qimen-content"
          className="space-y-6"
          style={{
            /* PDF 출력 최적화 스타일 */
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          {/* 시간 선택기 */}
          <TimeSelector
            selectedDate={selectedDate}
            onChange={handleTimeChange}
          />

          {/* 간단 요약 (초보자용) */}
        {showSimpleSummary && (
          <SimpleSummary
            chart={chart}
            customerName={appliedCustomer?.name}
            customerBirthDate={appliedCustomer?.birth_date}
          />
        )}

        {/* 구궁 차트 / 길흉 히트맵 / 3D 뷰 */}
        <div className="my-8">
          {show3D ? (
            <Qimen3DRenderer
              chart={chart}
              selectedPalace={selectedPalace}
              onPalaceSelect={handlePalaceSelect}
              autoRotate={true}
            />
          ) : showHeatmap ? (
            <FortuneHeatmap
              chart={chart}
              selectedPalace={selectedPalace}
              onPalaceSelect={handlePalaceSelect}
            />
          ) : (
            <QimenChart3x3
              chart={chart}
              selectedPalace={selectedPalace}
              onPalaceSelect={handlePalaceSelect}
            />
          )}
        </div>

        {/* 전체 길흉 요약 */}
        <div className="mb-8 p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            📊 전체 운세
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {/* 개인화된 점수 표시 */}
              {appliedCustomer ? (() => {
                const birthAnalysis = analyzeBirthDate(appliedCustomer.birth_date);
                const personalScore = calculatePersonalizedOverallScore(chart, birthAnalysis);
                const displayScore = personalScore.personalScore;
                const scoreChange = personalScore.bonus;

                return (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`text-6xl font-bold ${
                        displayScore >= 80 ? 'text-green-500' :
                        displayScore >= 60 ? 'text-blue-500' :
                        displayScore >= 40 ? 'text-yellow-500' :
                        displayScore >= 20 ? 'text-orange-500' :
                        'text-red-500'
                      }`}>
                        {displayScore}
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          당신의 운세
                          {scoreChange !== 0 && (
                            <span className={`ml-2 font-bold ${
                              scoreChange > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ({scoreChange > 0 ? '+' : ''}{scoreChange})
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-bold text-gray-700 dark:text-gray-200">
                          {displayScore >= 80 ? '대길 🌟' :
                           displayScore >= 60 ? '길 ✨' :
                           displayScore >= 40 ? '평 ⚖️' :
                           displayScore >= 20 ? '흉 ⚠️' :
                           '대흉 ❌'}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
                      {chart.overallFortune.summary}
                    </p>
                    {scoreChange !== 0 && (
                      <div className={`text-sm p-2 rounded ${
                        scoreChange > 0
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                      }`}>
                        💡 {personalScore.explanation}
                      </div>
                    )}
                  </div>
                );
              })() : (
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
              )}
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

        </div>

        {/* 선택한 궁 상세 정보 - 모달로 표시 */}
        {selectedPalace && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="max-w-4xl w-full my-8">
              <PalaceDetail
                palace={chart.palaces[selectedPalace]}
                onClose={() => setSelectedPalace(null)}
              />
            </div>
          </div>
        )}

        {/* 초보자 가이드 모달 */}
        {showGuide && (
          <BeginnerGuide onClose={() => setShowGuide(false)} />
        )}

        {/* AI 채팅 */}
        {showAIChat && (
          <AIChat
            chart={chart}
            context={selectedContext}
            customer={appliedCustomer}
            onClose={() => setShowAIChat(false)}
          />
        )}

        {/* 변경 히스토리 모달 */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">📊 차트 변경 히스토리</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {changeHistory.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">아직 변경 내역이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {changeHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.type === 'solarTerm' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                item.type === 'day' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              }`}>
                                {item.type === 'solarTerm' ? '🌸 절기/국 변경' : item.type === 'day' ? '📅 일간 변경' : '⏰ 시간 변경'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.timestamp.toLocaleString('ko-KR')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>{item.yinYang} {item.ju}국</strong> · 절기: {item.solarTerm}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 시간대 비교 */}
        {showComparison && (
          <TimeComparison
            baseDate={selectedDate}
            customer={appliedCustomer}
            onClose={() => setShowComparison(false)}
          />
        )}

        {/* 알림 설정 모달 */}
        <NotificationSettings
          isOpen={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
        />

        {/* 공유 모달 */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          chart={chart}
          elementId="qimen-content"
          customerName={appliedCustomer?.name}
        />

        {/* 통계 대시보드 */}
        <StatsDashboard
          isOpen={showStatsDashboard}
          onClose={() => setShowStatsDashboard(false)}
        />

        {/* 토스트 알림 */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
