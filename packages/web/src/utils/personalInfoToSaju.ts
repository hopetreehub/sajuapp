import { SajuData, CheonGan, JiJi, OhHaeng, CHEONGAN_OHHAENG, JIJI_OHHAENG } from './sajuScoreCalculator';
import { SajuCalculator } from './sajuCalculator';

// 설정 페이지의 PersonalInfo 타입
interface PersonalInfo {
  birthDate: string;
  birthTime: string;
  calendarType: 'solar' | 'lunar';
  gender: 'male' | 'female' | '';
  birthPlace: string;
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
    const [hour, minute = 0] = personalInfo.birthTime.split(':').map(Number);
    
    // 정확한 사주 계산 (SajuCalculator 사용)
    const fourPillars = SajuCalculator.calculateFourPillars({
      year,
      month,
      day,
      hour,
      minute,
      isLunar: personalInfo.calendarType === 'lunar'
    });
    
    console.log('사주 계산 결과:', {
      입력: `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`,
      년주: fourPillars.year.combined,
      월주: fourPillars.month.combined,
      일주: fourPillars.day.combined,
      시주: fourPillars.hour.combined
    });

    // 오행 균형 계산
    const ohHaengBalance: Record<OhHaeng, number> = {
      목: 0,
      화: 0,
      토: 0,
      금: 0,
      수: 0
    };

    // 천간의 오행 계산
    const yearGanOhhaeng = CHEONGAN_OHHAENG[fourPillars.year.heavenly as CheonGan];
    const monthGanOhhaeng = CHEONGAN_OHHAENG[fourPillars.month.heavenly as CheonGan];
    const dayGanOhhaeng = CHEONGAN_OHHAENG[fourPillars.day.heavenly as CheonGan];
    const timeGanOhhaeng = CHEONGAN_OHHAENG[fourPillars.hour.heavenly as CheonGan];
    
    ohHaengBalance[yearGanOhhaeng] += 12.5;
    ohHaengBalance[monthGanOhhaeng] += 12.5;
    ohHaengBalance[dayGanOhhaeng] += 12.5;
    ohHaengBalance[timeGanOhhaeng] += 12.5;

    // 지지의 오행 계산
    const yearJiOhhaeng = JIJI_OHHAENG[fourPillars.year.earthly as JiJi];
    const monthJiOhhaeng = JIJI_OHHAENG[fourPillars.month.earthly as JiJi];
    const dayJiOhhaeng = JIJI_OHHAENG[fourPillars.day.earthly as JiJi];
    const timeJiOhhaeng = JIJI_OHHAENG[fourPillars.hour.earthly as JiJi];
    
    ohHaengBalance[yearJiOhhaeng] += 12.5;
    ohHaengBalance[monthJiOhhaeng] += 12.5;
    ohHaengBalance[dayJiOhhaeng] += 12.5;
    ohHaengBalance[timeJiOhhaeng] += 12.5;

    // SajuData 형식으로 변환
    const sajuData: SajuData = {
      year: { 
        gan: fourPillars.year.heavenly as CheonGan, 
        ji: fourPillars.year.earthly as JiJi 
      },
      month: { 
        gan: fourPillars.month.heavenly as CheonGan, 
        ji: fourPillars.month.earthly as JiJi 
      },
      day: { 
        gan: fourPillars.day.heavenly as CheonGan, 
        ji: fourPillars.day.earthly as JiJi 
      },
      time: { 
        gan: fourPillars.hour.heavenly as CheonGan, 
        ji: fourPillars.hour.earthly as JiJi 
      },
      ohHaengBalance,
      fullSaju: `${fourPillars.year.combined} ${fourPillars.month.combined} ${fourPillars.day.combined} ${fourPillars.hour.combined}`
    };
    
    console.log('최종 SajuData:', sajuData);
    
    return sajuData;
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

// 테스트 함수
export function testSajuCalculation(): void {
  console.log('=== PersonalInfo → SajuData 변환 테스트 ===');
  
  const testInfo: PersonalInfo = {
    birthDate: '1971-11-17',
    birthTime: '04:00',
    calendarType: 'solar',
    gender: 'male',
    birthPlace: '서울'
  };
  
  const result = convertPersonalInfoToSaju(testInfo);
  console.log('테스트 입력:', testInfo);
  console.log('변환 결과:', result);
  console.log('기대값: 신해 기해 병오 경인');
  console.log('실제값:', result?.fullSaju);
  console.log('검증:', result?.fullSaju === '신해 기해 병오 경인' ? '✅ 정확' : '❌ 오류');
}