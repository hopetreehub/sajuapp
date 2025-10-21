/**
 * PDF 출력 유틸리티
 * jsPDF와 html2canvas를 사용하여 상담 내용을 PDF로 출력
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
}

/**
 * HTML 요소를 PDF로 변환하여 다운로드
 */
export const exportToPDF = async (
  elementId: string,
  options: PDFExportOptions,
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // HTML을 Canvas로 변환
    const canvas = await html2canvas(element, {
      scale: 2, // 고해상도
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 190; // A4 width in mm (210mm - 10mm margin each side)
    const pageHeight = 277; // A4 height in mm (297mm - 10mm margin each side)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // PDF 생성
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let position = 10; // 상단 여백

    // 제목 추가
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(options.title, 105, position, { align: 'center' });
    position += 10;

    if (options.subtitle) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(options.subtitle, 105, position, { align: 'center' });
      position += 10;
    }

    // 이미지 추가
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - position;

    // 페이지가 더 필요한 경우
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // PDF 다운로드
    pdf.save(options.filename);
  } catch (error) {
    console.error('[PDF Export] Error:', error);
    throw new Error('PDF 생성 중 오류가 발생했습니다.');
  }
};

/**
 * 타로 상담 내용을 PDF로 출력
 */
export const exportTarotReadingToPDF = async (
  spreadName: string,
  question: string,
  date: string,
): Promise<void> => {
  const filename = `타로_상담_${spreadName}_${date}.pdf`;
  await exportToPDF('tarot-reading-content', {
    filename,
    title: '🔮 타로 카드 상담 결과',
    subtitle: `${spreadName} | ${date}`,
  });
};

/**
 * 자미두수 상담 내용을 PDF로 출력
 */
export const exportZiweiReadingToPDF = async (
  birthDate: string,
  date: string,
): Promise<void> => {
  const filename = `자미두수_상담_${birthDate}_${date}.pdf`;
  await exportToPDF('ziwei-reading-content', {
    filename,
    title: '⭐ 자미두수 상담 결과',
    subtitle: `생년월일: ${birthDate} | ${date}`,
  });
};

/**
 * 사주 분석 내용을 PDF로 출력
 */
export const exportSajuAnalysisToPDF = async (
  birthDate: string,
  birthTime: string,
  date: string,
): Promise<void> => {
  const filename = `사주분석_${birthDate}_${date}.pdf`;
  await exportToPDF('saju-analysis-content', {
    filename,
    title: '🔮 사주 명리 분석 결과',
    subtitle: `생년월일: ${birthDate} ${birthTime} | ${date}`,
  });
};

/**
 * 통합 사주 분석 내용을 PDF로 출력
 */
export const exportUnifiedSajuToPDF = async (
  birthDate: string,
  birthTime: string,
  date: string,
): Promise<void> => {
  const filename = `통합사주분석_${birthDate}_${date}.pdf`;
  await exportToPDF('unified-saju-content', {
    filename,
    title: '📊 통합 사주 분석 결과',
    subtitle: `생년월일: ${birthDate} ${birthTime} | ${date}`,
  });
};

/**
 * 범용 PDF 출력 함수 (컨텐츠 ID와 옵션을 직접 지정)
 */
export const exportContentToPDF = async (
  contentId: string,
  title: string,
  subtitle: string,
  filenamePrefix: string,
): Promise<void> => {
  const date = formatDateForFilename();
  const filename = `${filenamePrefix}_${date}.pdf`;
  await exportToPDF(contentId, {
    filename,
    title,
    subtitle,
  });
};

/**
 * 날짜를 파일명에 적합한 형식으로 변환
 */
export const formatDateForFilename = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}`;
};
