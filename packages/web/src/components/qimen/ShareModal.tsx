import React, { useState } from 'react';
import type { QimenChart } from '@/types/qimen';
import { downloadQimenImage, copyQimenImageToClipboard, type QimenImageExportOptions } from '@/utils/qimenImageExport';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  chart: QimenChart;
  elementId: string;
  customerName?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  chart,
  elementId,
  customerName,
}) => {
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [size, setSize] = useState<QimenImageExportOptions['size']>('md');
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isExporting, setIsExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // 이미지 다운로드
  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await downloadQimenImage(elementId, chart, {
        format,
        size,
        includeWatermark,
        theme,
        quality: 0.95,
      });
      alert('✅ 이미지가 다운로드되었습니다!');
    } catch (error) {
      console.error('Image download failed:', error);
      alert('❌ 이미지 다운로드에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  // 클립보드에 복사
  const handleCopyToClipboard = async () => {
    setIsExporting(true);
    setCopySuccess(false);
    try {
      await copyQimenImageToClipboard(elementId, chart, {
        format: 'png',
        size,
        includeWatermark,
        theme,
      });
      setCopySuccess(true);
      alert('✅ 이미지가 클립보드에 복사되었습니다!');
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      alert('❌ 클립보드 복사에 실패했습니다. 브라우저에서 지원하지 않을 수 있습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  // 카카오톡 공유
  const handleKakaoShare = () => {
    // TODO: Kakao SDK 연동 필요
    alert(
      '🚧 카카오톡 공유 기능은 개발 중입니다.\n\nKakao SDK 설정이 필요합니다.\n대신 "이미지 다운로드" 후 직접 공유해주세요.',
    );
  };

  // Facebook 공유
  const handleFacebookShare = () => {
    // TODO: Facebook SDK 또는 공개 URL 필요
    alert(
      '🚧 Facebook 공유 기능은 개발 중입니다.\n\n공개 URL 생성 기능이 필요합니다.\n대신 "이미지 다운로드" 후 직접 공유해주세요.',
    );
  };

  // Twitter 공유
  const handleTwitterShare = () => {
    // TODO: Twitter API 또는 공개 URL 필요
    alert(
      '🚧 Twitter 공유 기능은 개발 중입니다.\n\n공개 URL 생성 기능이 필요합니다.\n대신 "이미지 다운로드" 후 직접 공유해주세요.',
    );
  };

  // URL 복사
  const handleCopyURL = () => {
    // TODO: 백엔드 서비스에서 공유 URL 생성 필요
    alert(
      '🚧 공유 URL 생성 기능은 개발 중입니다.\n\n백엔드 서비스 개발이 필요합니다.\n대신 "이미지 다운로드" 후 직접 공유해주세요.',
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span>📤</span>
              <span>귀문둔갑 차트 공유</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 차트 정보 */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              공유할 차트 정보
            </h3>
            <div className="text-sm space-y-1 text-purple-700 dark:text-purple-300">
              <p>⚡ 국(局): {chart.yinYang === 'yang' ? '양둔' : '음둔'} {chart.ju}국</p>
              <p>🌸 절기: {chart.solarTerm.name}</p>
              <p>📊 점수: {chart.overallFortune.score}점 ({chart.overallFortune.level})</p>
              {customerName && <p>👤 고객: {customerName}</p>}
            </div>
          </div>

          {/* 이미지 설정 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">이미지 설정</h3>

            {/* 포맷 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📷 포맷
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'png' as const, label: 'PNG', desc: '무손실, 투명 배경 지원' },
                  { value: 'jpg' as const, label: 'JPG', desc: '작은 파일 크기' },
                ].map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => setFormat(fmt.value)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      format === fmt.value
                        ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                    }`}
                  >
                    <div className="font-semibold">{fmt.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{fmt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 크기 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📏 크기
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: 'sm' as const, label: '작게', size: '512px' },
                  { value: 'md' as const, label: '중간', size: '1024px' },
                  { value: 'lg' as const, label: '크게', size: '2048px' },
                  { value: 'xl' as const, label: '최대', size: '4096px' },
                ].map((sz) => (
                  <button
                    key={sz.value}
                    onClick={() => setSize(sz.value)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      size === sz.value
                        ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                    }`}
                  >
                    <div className="font-semibold text-sm">{sz.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{sz.size}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 워터마크 토글 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-100">🏷️ 워터마크</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  하단에 출처 및 점수 표시
                </p>
              </div>
              <button
                onClick={() => setIncludeWatermark(!includeWatermark)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  includeWatermark ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    includeWatermark ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 테마 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🎨 테마
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'light' as const, label: '밝은 테마', emoji: '☀️' },
                  { value: 'dark' as const, label: '어두운 테마', emoji: '🌙' },
                ].map((thm) => (
                  <button
                    key={thm.value}
                    onClick={() => setTheme(thm.value)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      theme === thm.value
                        ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                    }`}
                  >
                    <span className="text-xl">{thm.emoji}</span> {thm.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 다운로드 및 복사 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>💾</span>
              <span>{isExporting ? '처리 중...' : '이미지 다운로드'}</span>
            </button>
            <button
              onClick={handleCopyToClipboard}
              disabled={isExporting}
              className={`px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                copySuccess
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gradient-to-r from-blue-400 to-purple-400 text-white hover:from-blue-500 hover:to-purple-500'
              }`}
            >
              <span>{copySuccess ? '✅' : '📋'}</span>
              <span>{copySuccess ? '복사됨!' : isExporting ? '처리 중...' : '클립보드 복사'}</span>
            </button>
          </div>

          {/* SNS 공유 버튼 */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">SNS 공유</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleKakaoShare}
                className="px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>💬</span>
                <span>카카오톡</span>
              </button>
              <button
                onClick={handleFacebookShare}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>📘</span>
                <span>Facebook</span>
              </button>
              <button
                onClick={handleTwitterShare}
                className="px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>🐦</span>
                <span>Twitter</span>
              </button>
              <button
                onClick={handleCopyURL}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>🔗</span>
                <span>URL 복사</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              💡 SNS 공유 기능은 백엔드 서비스 개발 후 사용 가능합니다
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
