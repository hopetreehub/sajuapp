import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  calculateCompleteSaju,
} from '../../src/utils/accurateSajuCalculator';
// @ts-expect-error - korean-lunar-calendar has no type definitions
import KoreanLunarCalendar from 'korean-lunar-calendar';

// 사주 계산 관련 인터페이스
interface SajuCalculationRequest {
  birth_date: string;
  birth_time: string;
  lunar_solar: 'lunar' | 'solar';
  use_true_solar_time?: boolean; // 진태양시 보정 옵션
}

interface FourPillarsResult {
  year: { heaven: string; earth: string };
  month: { heaven: string; earth: string };
  day: { heaven: string; earth: string };
  time: { heaven: string; earth: string };
}

interface OhHaengBalance {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

// 천간 오행 매핑
const CHEONGAN_OHHAENG: Record<string, string> = {
  '갑': 'wood', '을': 'wood',
  '병': 'fire', '정': 'fire',
  '무': 'earth', '기': 'earth',
  '경': 'metal', '신': 'metal',
  '임': 'water', '계': 'water',
};

// 지지 오행 매핑
const JIJI_OHHAENG: Record<string, string> = {
  '인': 'wood', '묘': 'wood',
  '사': 'fire', '오': 'fire',
  '진': 'earth', '술': 'earth', '축': 'earth', '미': 'earth',
  '신': 'metal', '유': 'metal',
  '자': 'water', '해': 'water',
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      birth_date,
      birth_time,
      lunar_solar,
      use_true_solar_time,
    }: SajuCalculationRequest = req.body;

    // 필수 필드 검증
    if (!birth_date || !birth_time || !lunar_solar) {
      return res.status(400).json({
        error: 'Missing required fields: birth_date, birth_time, lunar_solar',
      });
    }

    // 날짜 파싱
    const [hour, minute] = birth_time.split(':').map(Number);

    let year: number;
    let month: number;
    let day: number;

    // 음력 변환 처리
    if (lunar_solar === 'lunar') {
      try {
        // birth_date 파싱 (YYYY-MM-DD 형식)
        const birthDate = new Date(birth_date);
        const lunarYear = birthDate.getFullYear();
        const lunarMonth = birthDate.getMonth() + 1;
        const lunarDay = birthDate.getDate();

        // 음력 → 양력 변환
        const calendar = new KoreanLunarCalendar();
        calendar.setLunarDate(lunarYear, lunarMonth, lunarDay, false); // 윤달 아님 (기본)

        const solarDate = calendar.getSolarCalendar();
        year = solarDate.year;
        month = solarDate.month;
        day = solarDate.day;

        // Lunar to solar conversion successful
      } catch (error) {
        return res.status(400).json({
          error: 'Lunar calendar conversion failed',
          message: '음력 변환에 실패했습니다. 날짜를 확인해주세요.',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } else {
      // 양력 날짜 직접 사용
      const birthDate = new Date(birth_date);
      year = birthDate.getFullYear();
      month = birthDate.getMonth() + 1;
      day = birthDate.getDate();
    }

    // 정확한 사주 계산 (accurateSajuCalculator 사용)
    const sajuResult = calculateCompleteSaju(
      year,
      month,
      day,
      hour,
      minute || 0,
      undefined, // applySummerTime
      use_true_solar_time, // applyTrueSolarTime
    );

    // 사주팔자를 API 형식으로 변환
    const fourPillars: FourPillarsResult = {
      year: {
        heaven: sajuResult.year[0],
        earth: sajuResult.year[1],
      },
      month: {
        heaven: sajuResult.month[0],
        earth: sajuResult.month[1],
      },
      day: {
        heaven: sajuResult.day[0],
        earth: sajuResult.day[1],
      },
      time: {
        heaven: sajuResult.hour[0],
        earth: sajuResult.hour[1],
      },
    };

    // 오행 균형 계산
    const ohHaengBalance = calculateOhHaengBalance(fourPillars);
    const interpretation = generateSajuInterpretation(fourPillars, ohHaengBalance);

    return res.status(200).json({
      success: true,
      data: {
        fourPillars,
        ohHaengBalance,
        interpretation,
        sajuString: sajuResult.fullSaju,
        summerTimeApplied: sajuResult.summerTimeApplied,
        trueSolarTimeApplied: sajuResult.trueSolarTimeApplied,
        inputCalendar: lunar_solar,
        convertedDate: lunar_solar === 'lunar' ? {
          solar: { year, month, day },
          lunar: {
            year: new Date(birth_date).getFullYear(),
            month: new Date(birth_date).getMonth() + 1,
            day: new Date(birth_date).getDate(),
          },
        } : undefined,
        calculatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Saju Calculation Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// 오행 균형 계산
function calculateOhHaengBalance(fourPillars: FourPillarsResult): OhHaengBalance {
  const balance: OhHaengBalance = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 천간 4개 + 지지 4개 = 총 8개
  const elements = [
    fourPillars.year.heaven,
    fourPillars.year.earth,
    fourPillars.month.heaven,
    fourPillars.month.earth,
    fourPillars.day.heaven,
    fourPillars.day.earth,
    fourPillars.time.heaven,
    fourPillars.time.earth,
  ];

  // 각 글자의 오행 카운트
  elements.forEach((char, index) => {
    let element: string;

    // 짝수 인덱스는 천간, 홀수는 지지
    if (index % 2 === 0) {
      element = CHEONGAN_OHHAENG[char] || '';
    } else {
      element = JIJI_OHHAENG[char] || '';
    }

    if (element) {
      balance[element as keyof OhHaengBalance] += 1;
    }
  });

  // 백분율로 변환 (총 8개 기준)
  Object.keys(balance).forEach((key) => {
    const ohhaengKey = key as keyof OhHaengBalance;
    balance[ohhaengKey] = Math.round((balance[ohhaengKey] / 8) * 100);
  });

  return balance;
}

// 사주 해석 생성
function generateSajuInterpretation(
  fourPillars: FourPillarsResult,
  ohHaengBalance: OhHaengBalance,
): string {
  const dayMaster = fourPillars.day.heaven;
  const dayMasterElement = CHEONGAN_OHHAENG[dayMaster];

  // 가장 강한 오행
  const maxElement = Object.entries(ohHaengBalance)
    .reduce((a, b) => (a[1] > b[1] ? a : b))[0];

  const elementNames: Record<string, string> = {
    wood: '목(木)',
    fire: '화(火)',
    earth: '토(土)',
    metal: '금(金)',
    water: '수(水)',
  };

  let interpretation = `일간(日干)은 ${dayMaster}(${elementNames[dayMasterElement || 'wood']})입니다. `;
  interpretation += `전체 사주에서 ${elementNames[maxElement]} 오행이 가장 강합니다.\n\n`;

  // 오행 균형 분석
  const balanced = Object.values(ohHaengBalance).every(v => v >= 10 && v <= 30);
  if (balanced) {
    interpretation += '오행이 비교적 균형을 이루고 있어 안정적인 사주입니다.';
  } else {
    interpretation += '특정 오행이 편중되어 있어 그 특성이 강하게 나타날 수 있습니다.';
  }

  return interpretation;
}
