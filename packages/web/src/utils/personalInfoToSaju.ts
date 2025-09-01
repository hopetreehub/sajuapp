import { SajuData, CheonGan, JiJi, OhHaeng, CHEONGAN_OHHAENG, JIJI_OHHAENG } from './sajuScoreCalculator';

// 설정 페이지의 PersonalInfo 타입
interface PersonalInfo {
  birthDate: string;
  birthTime: string;
  calendarType: 'solar' | 'lunar';
  gender: 'male' | 'female' | '';
  birthPlace: string;
}

// 천간 배열
const CHEONGAN: CheonGan[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
// 지지 배열  
const JIJI: JiJi[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 간단한 사주 계산 (임시 - 나중에 정확한 계산으로 대체)
function calculateSimpleSaju(year: number, month: number, day: number, hour: number) {
  // 60갑자 기준으로 간단히 계산
  const yearGan = CHEONGAN[(year - 4) % 10];
  const yearJi = JIJI[(year - 4) % 12];
  
  const monthGan = CHEONGAN[(month - 1) % 10];
  const monthJi = JIJI[(month - 1) % 12];
  
  const dayGan = CHEONGAN[day % 10];
  const dayJi = JIJI[day % 12];
  
  // 시간을 12시진으로 변환
  const shiJinIndex = Math.floor((hour + 1) / 2) % 12;
  const timeGan = CHEONGAN[(shiJinIndex * 2) % 10];
  const timeJi = JIJI[shiJinIndex];
  
  return {
    year: { gan: yearGan, ji: yearJi },
    month: { gan: monthGan, ji: monthJi },
    day: { gan: dayGan, ji: dayJi },
    time: { gan: timeGan, ji: timeJi }
  };
}

// PersonalInfo를 SajuData로 변환
export function convertPersonalInfoToSaju(personalInfo: PersonalInfo): SajuData | null {
  if (!personalInfo.birthDate || !personalInfo.birthTime) {
    return null;
  }

  try {
    // 생년월일 파싱
    const [year, month, day] = personalInfo.birthDate.split('-').map(Number);
    
    // 시간 파싱
    const [hour] = personalInfo.birthTime.split(':').map(Number);
    
    // 간단한 사주 계산
    const sajuResult = calculateSimpleSaju(year, month, day, hour);

    // 오행 균형 계산
    const ohHaengBalance: Record<OhHaeng, number> = {
      목: 0,
      화: 0,
      토: 0,
      금: 0,
      수: 0
    };

    // 천간의 오행 계산
    const yearGanOhhaeng = CHEONGAN_OHHAENG[sajuResult.year.gan];
    const monthGanOhhaeng = CHEONGAN_OHHAENG[sajuResult.month.gan];
    const dayGanOhhaeng = CHEONGAN_OHHAENG[sajuResult.day.gan];
    const timeGanOhhaeng = CHEONGAN_OHHAENG[sajuResult.time.gan];
    
    ohHaengBalance[yearGanOhhaeng] += 12.5;
    ohHaengBalance[monthGanOhhaeng] += 12.5;
    ohHaengBalance[dayGanOhhaeng] += 12.5;
    ohHaengBalance[timeGanOhhaeng] += 12.5;

    // 지지의 오행 계산
    const yearJiOhhaeng = JIJI_OHHAENG[sajuResult.year.ji];
    const monthJiOhhaeng = JIJI_OHHAENG[sajuResult.month.ji];
    const dayJiOhhaeng = JIJI_OHHAENG[sajuResult.day.ji];
    const timeJiOhhaeng = JIJI_OHHAENG[sajuResult.time.ji];
    
    ohHaengBalance[yearJiOhhaeng] += 12.5;
    ohHaengBalance[monthJiOhhaeng] += 12.5;
    ohHaengBalance[dayJiOhhaeng] += 12.5;
    ohHaengBalance[timeJiOhhaeng] += 12.5;

    return {
      year: sajuResult.year,
      month: sajuResult.month,
      day: sajuResult.day,
      time: sajuResult.time,
      ohHaengBalance,
      fullSaju: `${sajuResult.year.gan}${sajuResult.year.ji} ${sajuResult.month.gan}${sajuResult.month.ji} ${sajuResult.day.gan}${sajuResult.day.ji} ${sajuResult.time.gan}${sajuResult.time.ji}`
    };
  } catch (error) {
    console.error('PersonalInfo를 SajuData로 변환 중 오류:', error);
    return null;
  }
}

// LocalStorage에서 PersonalInfo 가져오기
export function getPersonalInfoFromStorage(): PersonalInfo | null {
  try {
    const savedInfo = localStorage.getItem('sajuapp-personal-info');
    if (savedInfo) {
      return JSON.parse(savedInfo);
    }
  } catch (error) {
    console.error('LocalStorage에서 PersonalInfo 읽기 실패:', error);
  }
  return null;
}

// PersonalInfo가 유효한지 확인
export function isPersonalInfoValid(info: PersonalInfo | null): boolean {
  return !!(
    info &&
    info.birthDate &&
    info.birthTime &&
    info.gender &&
    info.calendarType
  );
}