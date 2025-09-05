/**
 * 사주 계산 테스트
 */

import { calculateSaju } from './unifiedSajuCalculator'
import { SajuBirthInfo } from '@/types/saju'

export function testSajuCalculations() {
  console.log('=== 사주 계산 테스트 ===\n')
  
  // 테스트 케이스 1: 1971년 11월 17일 04:00
  const testCase1: SajuBirthInfo = {
    year: 1971,
    month: 11,
    day: 17,
    hour: 4,
    minute: 0,
    isLunar: false,
    name: '테스트1',
    gender: 'male'
  }
  
  // 테스트 케이스 2: 1995년 9월 2일 04:00
  const testCase2: SajuBirthInfo = {
    year: 1995,
    month: 9,
    day: 2,
    hour: 4,
    minute: 0,
    isLunar: false,
    name: '테스트2',
    gender: 'male'
  }
  
  console.log('----------------------------------------')
  console.log('테스트 1: 1971년 11월 17일 04:00 (양력)')
  console.log('----------------------------------------')
  
  const result1 = calculateSaju(testCase1)
  
  console.log(`생년월일시: ${testCase1.year}년 ${testCase1.month}월 ${testCase1.day}일 ${testCase1.hour}시 ${testCase1.minute}분`)
  console.log(`\n사주 팔자:`)
  console.log(`  년주: ${result1.fourPillars.year}`)
  console.log(`  월주: ${result1.fourPillars.month}`)
  console.log(`  일주: ${result1.fourPillars.day}`)
  console.log(`  시주: ${result1.fourPillars.hour}`)
  
  console.log(`\n천간지지 분석:`)
  console.log(`  년: 천간(${result1.fourPillars.yearHeavenly}) 지지(${result1.fourPillars.yearEarthly})`)
  console.log(`  월: 천간(${result1.fourPillars.monthHeavenly}) 지지(${result1.fourPillars.monthEarthly})`)
  console.log(`  일: 천간(${result1.fourPillars.dayHeavenly}) 지지(${result1.fourPillars.dayEarthly})`)
  console.log(`  시: 천간(${result1.fourPillars.hourHeavenly}) 지지(${result1.fourPillars.hourEarthly})`)
  
  console.log(`\n오행 분석:`)
  console.log(`  년: 천간(${result1.elements.year.heavenly}) 지지(${result1.elements.year.earthly})`)
  console.log(`  월: 천간(${result1.elements.month.heavenly}) 지지(${result1.elements.month.earthly})`)
  console.log(`  일: 천간(${result1.elements.day.heavenly}) 지지(${result1.elements.day.earthly})`)
  console.log(`  시: 천간(${result1.elements.hour.heavenly}) 지지(${result1.elements.hour.earthly})`)
  
  console.log(`\n기타 정보:`)
  console.log(`  절기월: ${result1.solarMonth}월`)
  console.log(`  서머타임 적용: ${result1.summerTimeApplied ? '예' : '아니오'}`)
  
  console.log('\n========================================')
  console.log('테스트 2: 1995년 9월 2일 04:00 (양력)')
  console.log('========================================')
  
  const result2 = calculateSaju(testCase2)
  
  console.log(`생년월일시: ${testCase2.year}년 ${testCase2.month}월 ${testCase2.day}일 ${testCase2.hour}시 ${testCase2.minute}분`)
  console.log(`\n사주 팔자:`)
  console.log(`  년주: ${result2.fourPillars.year}`)
  console.log(`  월주: ${result2.fourPillars.month}`)
  console.log(`  일주: ${result2.fourPillars.day}`)
  console.log(`  시주: ${result2.fourPillars.hour}`)
  
  console.log(`\n천간지지 분석:`)
  console.log(`  년: 천간(${result2.fourPillars.yearHeavenly}) 지지(${result2.fourPillars.yearEarthly})`)
  console.log(`  월: 천간(${result2.fourPillars.monthHeavenly}) 지지(${result2.fourPillars.monthEarthly})`)
  console.log(`  일: 천간(${result2.fourPillars.dayHeavenly}) 지지(${result2.fourPillars.dayEarthly})`)
  console.log(`  시: 천간(${result2.fourPillars.hourHeavenly}) 지지(${result2.fourPillars.hourEarthly})`)
  
  console.log(`\n오행 분석:`)
  console.log(`  년: 천간(${result2.elements.year.heavenly}) 지지(${result2.elements.year.earthly})`)
  console.log(`  월: 천간(${result2.elements.month.heavenly}) 지지(${result2.elements.month.earthly})`)
  console.log(`  일: 천간(${result2.elements.day.heavenly}) 지지(${result2.elements.day.earthly})`)
  console.log(`  시: 천간(${result2.elements.hour.heavenly}) 지지(${result2.elements.hour.earthly})`)
  
  console.log(`\n기타 정보:`)
  console.log(`  절기월: ${result2.solarMonth}월`)
  console.log(`  서머타임 적용: ${result2.summerTimeApplied ? '예' : '아니오'}`)
  
  // 요약 비교
  console.log('\n========================================')
  console.log('요약 비교')
  console.log('========================================')
  console.log('\n테스트 1 (1971.11.17 04:00):')
  console.log(`  ${result1.fourPillars.year} ${result1.fourPillars.month} ${result1.fourPillars.day} ${result1.fourPillars.hour}`)
  
  console.log('\n테스트 2 (1995.09.02 04:00):')
  console.log(`  ${result2.fourPillars.year} ${result2.fourPillars.month} ${result2.fourPillars.day} ${result2.fourPillars.hour}`)
  
  return { result1, result2 }
}

// 테스트 실행
if (typeof window !== 'undefined') {
  // 브라우저 환경에서 실행
  (window as any).testSaju = testSajuCalculations
  console.log('브라우저 콘솔에서 testSaju()를 실행하세요.')
}

// 바로 실행
testSajuCalculations()