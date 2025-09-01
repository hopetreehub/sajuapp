declare module 'korean-lunar-calendar' {
  export default class KoreanLunarCalendar {
    constructor()
    
    // 양력 설정
    setSolarDate(year: number, month: number, day: number): void
    
    // 음력 설정
    setLunarDate(year: number, month: number, day: number, isLeapMonth?: boolean): void
    
    // 양력 가져오기
    getSolarYear(): number
    getSolarMonth(): number
    getSolarDay(): number
    getSolarISOFormat(): string
    
    // 음력 가져오기
    getLunarYear(): number
    getLunarMonth(): number
    getLunarDay(): number
    getLunarLeapMonth(): boolean
    getLunarISOFormat(): string
    
    // 간지 정보
    getChineseYear(): string
    getZodiac(): string
    
    // 절기 정보
    getSolarTerms(): string
  }
}