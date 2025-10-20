import html2canvas from 'html2canvas';
import type { QimenChart } from '@/types/qimen';

/**
 * 이미지 내보내기 옵션
 */
export interface QimenImageExportOptions {
  /** 이미지 포맷 */
  format: 'png' | 'jpg' | 'jpeg';

  /** 이미지 크기 */
  size: 'sm' | 'md' | 'lg' | 'xl';

  /** 워터마크 포함 여부 */
  includeWatermark: boolean;

  /** 테마 (light/dark) */
  theme: 'light' | 'dark';

  /** 품질 (0.0 ~ 1.0, jpg/jpeg만 적용) */
  quality: number;

  /** 파일명 (확장자 제외) */
  filename?: string;
}

/**
 * 이미지 크기 매핑 (픽셀)
 */
const SIZE_MAP: Record<QimenImageExportOptions['size'], { width: number; height: number }> = {
  sm: { width: 512, height: 512 },
  md: { width: 1024, height: 1024 },
  lg: { width: 2048, height: 2048 },
  xl: { width: 4096, height: 4096 },
};

/**
 * DOM 요소를 이미지로 변환
 */
export async function exportQimenToImage(
  elementId: string,
  chart: QimenChart,
  options: Partial<QimenImageExportOptions> = {}
): Promise<Blob> {
  // 기본 옵션
  const opts: QimenImageExportOptions = {
    format: options.format || 'png',
    size: options.size || 'md',
    includeWatermark: options.includeWatermark ?? true,
    theme: options.theme || 'light',
    quality: options.quality || 0.95,
    filename: options.filename,
  };

  // DOM 요소 가져오기
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  // html2canvas 옵션
  const canvas = await html2canvas(element, {
    backgroundColor: opts.theme === 'dark' ? '#1a1a1a' : '#ffffff',
    scale: 2, // 고해상도
    useCORS: true, // CORS 이미지 허용
    allowTaint: true,
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
  });

  // 크기 조정
  const targetSize = SIZE_MAP[opts.size];
  const resizedCanvas = resizeCanvas(canvas, targetSize.width, targetSize.height);

  // 워터마크 추가
  let finalCanvas = resizedCanvas;
  if (opts.includeWatermark) {
    finalCanvas = await addWatermark(resizedCanvas, chart, opts.theme);
  }

  // Blob으로 변환
  const blob = await new Promise<Blob>((resolve, reject) => {
    const mimeType = opts.format === 'png' ? 'image/png' : 'image/jpeg';
    finalCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      mimeType,
      opts.quality
    );
  });

  return blob;
}

/**
 * Canvas 크기 조정
 */
function resizeCanvas(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = targetWidth;
  resizedCanvas.height = targetHeight;

  const ctx = resizedCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  // 고품질 스케일링
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 이미지 그리기 (비율 유지하며 fit)
  const aspectRatio = sourceCanvas.width / sourceCanvas.height;
  const targetAspectRatio = targetWidth / targetHeight;

  let drawWidth = targetWidth;
  let drawHeight = targetHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (aspectRatio > targetAspectRatio) {
    // 원본이 더 넓음 - 가로 기준
    drawHeight = targetWidth / aspectRatio;
    offsetY = (targetHeight - drawHeight) / 2;
  } else {
    // 원본이 더 높음 - 세로 기준
    drawWidth = targetHeight * aspectRatio;
    offsetX = (targetWidth - drawWidth) / 2;
  }

  ctx.drawImage(sourceCanvas, offsetX, offsetY, drawWidth, drawHeight);

  return resizedCanvas;
}

/**
 * 워터마크 추가
 */
async function addWatermark(
  canvas: HTMLCanvasElement,
  chart: QimenChart,
  theme: 'light' | 'dark'
): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  const width = canvas.width;
  const height = canvas.height;

  // 워터마크 배경 (반투명)
  const watermarkHeight = Math.floor(height * 0.08); // 8% 높이
  ctx.fillStyle = theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(0, height - watermarkHeight, width, watermarkHeight);

  // 텍스트 색상
  ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000';
  ctx.font = `bold ${Math.floor(watermarkHeight * 0.3)}px "Noto Sans KR", sans-serif`;
  ctx.textBaseline = 'middle';

  // 좌측: 귀문둔갑 정보
  const leftText = `⚡ ${chart.yinYang === 'yang' ? '양둔' : '음둔'} ${chart.ju}국 | ${chart.solarTerm.name}`;
  ctx.textAlign = 'left';
  ctx.fillText(leftText, Math.floor(width * 0.03), height - watermarkHeight / 2);

  // 우측: 운명나침반 로고/링크
  const rightText = '운명나침반.com | 귀문둔갑';
  ctx.textAlign = 'right';
  ctx.fillText(rightText, Math.floor(width * 0.97), height - watermarkHeight / 2);

  // 점수 표시 (좌측 상단)
  const scoreSize = Math.floor(height * 0.08);
  const scoreBgSize = scoreSize * 1.5;
  const scoreX = Math.floor(width * 0.05);
  const scoreY = Math.floor(height * 0.05);

  // 점수 배경 원
  const scoreColor =
    chart.overallFortune.score >= 80
      ? '#10b981'
      : chart.overallFortune.score >= 60
      ? '#3b82f6'
      : chart.overallFortune.score >= 40
      ? '#eab308'
      : chart.overallFortune.score >= 20
      ? '#f97316'
      : '#ef4444';

  ctx.fillStyle = scoreColor;
  ctx.beginPath();
  ctx.arc(scoreX + scoreBgSize / 2, scoreY + scoreBgSize / 2, scoreBgSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // 점수 텍스트
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${scoreSize}px "Noto Sans KR", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(chart.overallFortune.score.toString(), scoreX + scoreBgSize / 2, scoreY + scoreBgSize / 2);

  // 운세 레벨 텍스트
  const levelText =
    chart.overallFortune.level === 'excellent'
      ? '대길'
      : chart.overallFortune.level === 'good'
      ? '길'
      : chart.overallFortune.level === 'neutral'
      ? '평'
      : chart.overallFortune.level === 'bad'
      ? '흉'
      : '대흉';

  ctx.font = `bold ${scoreSize * 0.4}px "Noto Sans KR", sans-serif`;
  ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000';
  ctx.fillText(levelText, scoreX + scoreBgSize / 2, scoreY + scoreBgSize + scoreSize * 0.4);

  return canvas;
}

/**
 * 이미지 다운로드
 */
export async function downloadQimenImage(
  elementId: string,
  chart: QimenChart,
  options: Partial<QimenImageExportOptions> = {}
): Promise<void> {
  const blob = await exportQimenToImage(elementId, chart, options);

  // 기본 옵션
  const opts: QimenImageExportOptions = {
    format: options.format || 'png',
    size: options.size || 'md',
    includeWatermark: options.includeWatermark ?? true,
    theme: options.theme || 'light',
    quality: options.quality || 0.95,
    filename: options.filename,
  };

  // 파일명 생성
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const filename =
    opts.filename ||
    `귀문둔갑_${chart.yinYang === 'yang' ? '양둔' : '음둔'}${chart.ju}국_${timestamp}`;

  const extension = opts.format === 'png' ? 'png' : 'jpg';
  const fullFilename = `${filename}.${extension}`;

  // Blob URL 생성 및 다운로드
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fullFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Blob URL 해제
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * 이미지를 클립보드에 복사
 */
export async function copyQimenImageToClipboard(
  elementId: string,
  chart: QimenChart,
  options: Partial<QimenImageExportOptions> = {}
): Promise<void> {
  // 클립보드 API 지원 확인
  if (!navigator.clipboard || !navigator.clipboard.write) {
    throw new Error('Clipboard API not supported in this browser');
  }

  const blob = await exportQimenToImage(elementId, chart, options);

  // ClipboardItem으로 변환
  const clipboardItem = new ClipboardItem({
    'image/png': blob,
  });

  await navigator.clipboard.write([clipboardItem]);
}

/**
 * 이미지를 Base64 문자열로 변환
 */
export async function exportQimenToBase64(
  elementId: string,
  chart: QimenChart,
  options: Partial<QimenImageExportOptions> = {}
): Promise<string> {
  const blob = await exportQimenToImage(elementId, chart, options);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 프리뷰 이미지 생성 (작은 썸네일)
 */
export async function createQimenThumbnail(
  elementId: string,
  chart: QimenChart
): Promise<Blob> {
  return exportQimenToImage(elementId, chart, {
    format: 'jpg',
    size: 'sm',
    includeWatermark: false,
    quality: 0.8,
  });
}
