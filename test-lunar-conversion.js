const KoreanLunarCalendar = require('korean-lunar-calendar');

console.log('=== 음력 변환 테스트 ===\n');

// 테스트 1: 음력 1971년 10월 21일 → 양력으로 변환
console.log('테스트 1: 음력 1971년 10월 21일');
const calendar1 = new KoreanLunarCalendar();
calendar1.setLunarDate(1971, 10, 21, false);
const solar1 = calendar1.getSolarCalendar();
console.log(`양력 결과: ${solar1.year}년 ${solar1.month}월 ${solar1.day}일`);
console.log(`예상: 1971년 11월 17일`);
console.log(`일치: ${solar1.year === 1971 && solar1.month === 11 && solar1.day === 17 ? '✅' : '❌'}\n`);

// 테스트 2: 음력 2000년 1월 1일 → 양력으로 변환
console.log('테스트 2: 음력 2000년 1월 1일');
const calendar2 = new KoreanLunarCalendar();
calendar2.setLunarDate(2000, 1, 1, false);
const solar2 = calendar2.getSolarCalendar();
console.log(`양력 결과: ${solar2.year}년 ${solar2.month}월 ${solar2.day}일`);
console.log(`예상: 2000년 2월 5일`);
console.log(`일치: ${solar2.year === 2000 && solar2.month === 2 && solar2.day === 5 ? '✅' : '❌'}\n`);

// 테스트 3: 음력 2024년 1월 1일 → 양력으로 변환
console.log('테스트 3: 음력 2024년 1월 1일');
const calendar3 = new KoreanLunarCalendar();
calendar3.setLunarDate(2024, 1, 1, false);
const solar3 = calendar3.getSolarCalendar();
console.log(`양력 결과: ${solar3.year}년 ${solar3.month}월 ${solar3.day}일`);
console.log(`예상: 2024년 2월 10일`);
console.log(`일치: ${solar3.year === 2024 && solar3.month === 2 && solar3.day === 10 ? '✅' : '❌'}\n`);

// 역변환 테스트: 양력 → 음력
console.log('=== 역변환 테스트 (양력 → 음력) ===\n');
console.log('양력 2024년 2월 10일 → 음력');
const calendar4 = new KoreanLunarCalendar();
calendar4.setSolarDate(2024, 2, 10);
const lunar4 = calendar4.getLunarCalendar();
console.log(`음력 결과: ${lunar4.year}년 ${lunar4.month}월 ${lunar4.day}일`);
console.log(`예상: 2024년 1월 1일`);
console.log(`일치: ${lunar4.year === 2024 && lunar4.month === 1 && lunar4.day === 1 ? '✅' : '❌'}\n`);

console.log('=== 모든 테스트 완료 ===');
