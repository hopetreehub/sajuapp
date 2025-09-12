import React, { useEffect, useRef, useState } from 'react';
import QRCodeUtil from '@/utils/qrcode';

interface QRCodeGeneratorProps {
  referralCode: string
  className?: string
}

/**
 * 추천인 코드용 QR코드 생성 및 표시 컴포넌트
 */
const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  referralCode, 
  className = '', 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'success' | 'error'>('idle');

  // QR코드 생성
  useEffect(() => {
    if (!referralCode || !canvasRef.current) return;

    const generateQRCode = async () => {
      setIsGenerating(true);
      setError(null);

      try {
        const shareUrl = QRCodeUtil.createReferralUrl(referralCode);
        await QRCodeUtil.generateToCanvas(canvasRef.current!, shareUrl, {
          width: 160,
          color: {
            dark: '#667eea',
            light: '#ffffff',
          },
        });
      } catch (err) {
        setError('QR코드를 생성할 수 없습니다.');
        console.error('QR코드 생성 오류:', err);
      } finally {
        setIsGenerating(false);
      }
    };

    generateQRCode();
  }, [referralCode]);

  // 다운로드 기능
  const handleDownload = async () => {
    if (!referralCode) return;

    setDownloadStatus('downloading');
    try {
      await QRCodeUtil.downloadReferralQRCode(referralCode, {
        width: 400,
        color: {
          dark: '#667eea',
          light: '#ffffff',
        },
      });
      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    } catch (error) {
      console.error('다운로드 실패:', error);
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    }
  };

  // 공유 기능
  const handleShare = async () => {
    if (!referralCode) return;

    setShareStatus('sharing');
    try {
      if (navigator.share) {
        await QRCodeUtil.shareReferralQRCode(referralCode, {
          width: 400,
          color: {
            dark: '#667eea',
            light: '#ffffff',
          },
        });
        setShareStatus('success');
      } else {
        // Web Share API를 지원하지 않는 경우 URL 복사
        const shareUrl = QRCodeUtil.createReferralUrl(referralCode);
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('success');
      }
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch (error) {
      console.error('공유 실패:', error);
      setShareStatus('error');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-xl p-6 text-white ${className}`}>
      <div className="text-center">
        <h4 className="text-lg font-semibold mb-4 flex items-center justify-center">
          <span className="mr-2">📱</span>
          QR코드로 쉽게 공유하기
        </h4>

        {/* QR코드 표시 영역 */}
        <div className="inline-block bg-white p-4 rounded-xl shadow-lg mb-4">
          {isGenerating ? (
            <div className="w-40 h-40 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="w-40 h-40 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-2">❌</div>
                <div className="text-xs">{error}</div>
              </div>
            </div>
          ) : (
            <canvas 
              ref={canvasRef} 
              className="block"
              style={{ imageRendering: 'pixelated' }}
            />
          )}
        </div>

        <p className="text-sm opacity-90 mb-4">
          QR코드를 스캔하면 바로 가입 페이지로 이동해요!
        </p>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={handleDownload}
            disabled={downloadStatus === 'downloading' || isGenerating || !!error}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              downloadStatus === 'downloading'
                ? 'bg-gray-400 cursor-not-allowed'
                : downloadStatus === 'success'
                ? 'bg-green-500 hover:bg-green-600'
                : downloadStatus === 'error'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            {downloadStatus === 'downloading' ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                다운로드 중...
              </>
            ) : downloadStatus === 'success' ? (
              <>
                <span className="mr-2">✅</span>
                다운로드 완료
              </>
            ) : downloadStatus === 'error' ? (
              <>
                <span className="mr-2">❌</span>
                다운로드 실패
              </>
            ) : (
              <>
                <span className="mr-2">💾</span>
                PNG 다운로드
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            disabled={shareStatus === 'sharing' || isGenerating || !!error}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              shareStatus === 'sharing'
                ? 'bg-gray-400 cursor-not-allowed'
                : shareStatus === 'success'
                ? 'bg-green-500 hover:bg-green-600'
                : shareStatus === 'error'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            {shareStatus === 'sharing' ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                공유 중...
              </>
            ) : shareStatus === 'success' ? (
              <>
                <span className="mr-2">✅</span>
                공유 완료
              </>
            ) : shareStatus === 'error' ? (
              <>
                <span className="mr-2">❌</span>
                공유 실패
              </>
            ) : (
              <>
                <span className="mr-2">🔗</span>
                {navigator.share ? 'QR 공유하기' : '링크 복사'}
              </>
            )}
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-4 text-xs opacity-75">
          <p>💡 QR코드를 저장해서 오프라인에서도 공유해보세요!</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;