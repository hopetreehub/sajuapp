import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

/**
 * QR코드 생성 유틸리티
 */
export class QRCodeGenerator {
  private static defaultOptions: QRCodeOptions = {
    width: 200,
    margin: 2,
    color: {
      dark: '#4338CA', // Indigo-700
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  };

  /**
   * Canvas에 QR코드를 생성합니다
   * @param canvas HTML Canvas 요소
   * @param text QR코드로 만들 텍스트
   * @param options QR코드 옵션
   */
  static async generateToCanvas(
    canvas: HTMLCanvasElement, 
    text: string, 
    options?: QRCodeOptions,
  ): Promise<void> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      await QRCode.toCanvas(canvas, text, opts);
    } catch (error) {
      console.error('QR코드 생성 실패:', error);
      throw new Error('QR코드를 생성할 수 없습니다.');
    }
  }

  /**
   * Data URL로 QR코드를 생성합니다
   * @param text QR코드로 만들 텍스트
   * @param options QR코드 옵션
   * @returns Promise<string> Data URL
   */
  static async generateToDataURL(
    text: string, 
    options?: QRCodeOptions,
  ): Promise<string> {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      return await QRCode.toDataURL(text, opts);
    } catch (error) {
      console.error('QR코드 생성 실패:', error);
      throw new Error('QR코드를 생성할 수 없습니다.');
    }
  }

  /**
   * PNG 파일로 다운로드할 수 있는 Blob을 생성합니다
   * @param text QR코드로 만들 텍스트
   * @param options QR코드 옵션 (고해상도로 설정)
   * @returns Promise<Blob>
   */
  static async generateToBlob(
    text: string, 
    options?: QRCodeOptions,
  ): Promise<Blob> {
    const highResOptions: QRCodeOptions = {
      ...this.defaultOptions,
      width: 400, // 고해상도
      ...options,
    };

    try {
      const dataURL = await this.generateToDataURL(text, highResOptions);
      const response = await fetch(dataURL);
      return await response.blob();
    } catch (error) {
      console.error('QR코드 Blob 생성 실패:', error);
      throw new Error('QR코드 파일을 생성할 수 없습니다.');
    }
  }

  /**
   * 추천인 코드를 위한 공유 URL을 생성합니다
   * @param referralCode 추천인 코드
   * @param baseUrl 기본 URL (기본값: 현재 origin)
   * @returns 공유 URL
   */
  static createReferralUrl(referralCode: string, baseUrl?: string): string {
    const base = baseUrl || window.location.origin;
    return `${base}/auth?mode=signup&ref=${referralCode}`;
  }

  /**
   * 파일 다운로드를 실행합니다
   * @param blob 다운로드할 Blob
   * @param filename 파일명
   */
  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 추천인 QR코드를 파일로 다운로드합니다
   * @param referralCode 추천인 코드
   * @param options QR코드 옵션
   */
  static async downloadReferralQRCode(
    referralCode: string, 
    options?: QRCodeOptions,
  ): Promise<void> {
    try {
      const url = this.createReferralUrl(referralCode);
      const blob = await this.generateToBlob(url, options);
      const filename = `referral-qr-${referralCode}.png`;
      this.downloadFile(blob, filename);
    } catch (error) {
      console.error('QR코드 다운로드 실패:', error);
      throw error;
    }
  }

  /**
   * Web Share API를 사용하여 QR코드를 공유합니다
   * @param referralCode 추천인 코드
   * @param options QR코드 옵션
   */
  static async shareReferralQRCode(
    referralCode: string, 
    options?: QRCodeOptions,
  ): Promise<void> {
    if (!navigator.share) {
      throw new Error('이 브라우저는 공유 기능을 지원하지 않습니다.');
    }

    try {
      const url = this.createReferralUrl(referralCode);
      const blob = await this.generateToBlob(url, options);
      const file = new File([blob], `referral-qr-${referralCode}.png`, {
        type: 'image/png',
      });

      await navigator.share({
        title: '🔮 운명나침반 추천 QR코드',
        text: `추천인 코드: ${referralCode}\n함께 가입하면 특별 혜택을 받을 수 있어요!`,
        url,
        files: [file],
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 사용자가 공유를 취소한 경우
        return;
      }
      console.error('QR코드 공유 실패:', error);
      throw new Error('QR코드를 공유할 수 없습니다.');
    }
  }
}

export default QRCodeGenerator;