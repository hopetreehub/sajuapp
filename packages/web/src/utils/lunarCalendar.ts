import KoreanLunarCalendar from 'korean-lunar-calendar'

export interface LunarDate {
  year: number
  month: number
  day: number
  isLeapMonth: boolean
  zodiac: string // 띠
  chineseYear: string // 간지
}

/**
 * 양력 날짜를 음력으로 변환
 */
export const solarToLunar = (date: Date): LunarDate => {
  try {
    const calendar = new KoreanLunarCalendar()
    
    calendar.setSolarDate(
      date.getFullYear(),
      date.getMonth() + 1, // JavaScript months are 0-indexed
      date.getDate()
    )
    
    // getLunarCalendar() 메서드로 음력 정보 가져오기
    const lunarData = calendar.getLunarCalendar()
    
    return {
      year: lunarData.year || date.getFullYear(),
      month: lunarData.month || (date.getMonth() + 1),
      day: lunarData.day || date.getDate(),
      isLeapMonth: lunarData.leapMonth || false,
      zodiac: lunarData.zodiac || '',
      chineseYear: lunarData.chineseYear || ''
    }
  } catch (error) {
    console.error('Error converting solar to lunar:', error)
    // 에러 시 기본값 반환
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      isLeapMonth: false,
      zodiac: '',
      chineseYear: ''
    }
  }
}

/**
 * 음력 날짜를 양력으로 변환
 */
export const lunarToSolar = (year: number, month: number, day: number, isLeapMonth: boolean = false): Date => {
  try {
    const calendar = new KoreanLunarCalendar()
    
    calendar.setLunarDate(year, month, day, isLeapMonth)
    
    // getSolarCalendar() 메서드로 양력 정보 가져오기
    const solarData = calendar.getSolarCalendar()
    
    return new Date(
      solarData.year || year,
      (solarData.month || month) - 1, // Convert to 0-indexed
      solarData.day || day
    )
  } catch (error) {
    console.error('Error converting lunar to solar:', error)
    // 에러 시 기본값 반환
    return new Date(year, month - 1, day)
  }
}

/**
 * 음력 날짜를 포맷팅된 문자열로 반환
 */
export const formatLunarDate = (date: Date, includeYear: boolean = false): string => {
  const lunar = solarToLunar(date)
  
  if (includeYear) {
    return `음 ${lunar.year}.${lunar.month}.${lunar.day}${lunar.isLeapMonth ? '(윤)' : ''}`
  }
  
  return `음 ${lunar.month}.${lunar.day}${lunar.isLeapMonth ? '(윤)' : ''}`
}

/**
 * 특별한 음력 날짜인지 확인 (설날, 정월대보름, 추석 등)
 */
export const getSpecialLunarDay = (date: Date): string | null => {
  const lunar = solarToLunar(date)
  
  // 설날 (음력 1월 1일)
  if (lunar.month === 1 && lunar.day === 1) {
    return '설날'
  }
  
  // 정월대보름 (음력 1월 15일)
  if (lunar.month === 1 && lunar.day === 15) {
    return '정월대보름'
  }
  
  // 단오 (음력 5월 5일)
  if (lunar.month === 5 && lunar.day === 5) {
    return '단오'
  }
  
  // 칠석 (음력 7월 7일)
  if (lunar.month === 7 && lunar.day === 7) {
    return '칠석'
  }
  
  // 백중 (음력 7월 15일)
  if (lunar.month === 7 && lunar.day === 15) {
    return '백중'
  }
  
  // 추석 (음력 8월 15일)
  if (lunar.month === 8 && lunar.day === 15) {
    return '추석'
  }
  
  // 중양절 (음력 9월 9일)
  if (lunar.month === 9 && lunar.day === 9) {
    return '중양절'
  }
  
  return null
}

/**
 * 음력 월의 한글 이름 반환
 */
export const getLunarMonthName = (month: number): string => {
  const monthNames = [
    '정월', '이월', '삼월', '사월', '오월', '유월',
    '칠월', '팔월', '구월', '시월', '동월', '섣달'
  ]
  
  return monthNames[month - 1] || `${month}월`
}