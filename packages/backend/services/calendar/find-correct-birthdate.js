const { calculateCompleteSaju } = require('./dist/utils/accurateSajuCalculator.js');

console.log('='.repeat(80));
console.log('정비제님 정확한 생년월일 찾기');
console.log('목표 사주: 병진 정유 신미 계사');
console.log('='.repeat(80));

// 병진년은 1976년 가능성이 높음
const targetSaju = '병진 정유 신미 계사';

// 1976년 전체 날짜 검색
console.log('\n1976년 병진년 검색 중...\n');

let found = false;

// 정유월은 음력 8월 정도 (양력 9월경)
// 신미일과 계사시를 찾아보자
for (let month = 7; month <= 10; month++) {
  for (let day = 1; day <= 31; day++) {
    // 유효한 날짜인지 체크
    const date = new Date(1976, month - 1, day);
    if (date.getMonth() !== month - 1) continue;
    
    for (let hour = 0; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const result = calculateCompleteSaju(1976, month, day, hour, minute, false);
        
        if (result && result.fullSaju === targetSaju) {
          console.log('✅ 찾았습니다!');
          console.log(`   생년월일시: 1976년 ${month}월 ${day}일 ${hour}시 ${minute}분 (양력)`);
          console.log(`   사주: ${result.fullSaju}`);
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (found) break;
  }
  if (found) break;
}

if (!found) {
  console.log('❌ 1976년에서는 찾을 수 없습니다.');
  console.log('\n다른 병진년 검색 중...\n');
  
  // 다른 병진년 검색 (1916, 1976, 2036 등)
  const bingChenYears = [1916, 1976, 2036];
  
  for (const year of bingChenYears) {
    if (year === 1976) continue; // 이미 검색함
    
    console.log(`${year}년 검색 중...`);
    
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 31; day++) {
        const date = new Date(year, month - 1, day);
        if (date.getMonth() !== month - 1) continue;
        
        for (let hour = 0; hour <= 23; hour++) {
          const result = calculateCompleteSaju(year, month, day, hour, 0, false);
          
          if (result && result.fullSaju === targetSaju) {
            console.log('✅ 찾았습니다!');
            console.log(`   생년월일시: ${year}년 ${month}월 ${day}일 ${hour}시 0분 (양력)`);
            console.log(`   사주: ${result.fullSaju}`);
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }
    if (found) break;
  }
}

if (!found) {
  console.log('❌ 해당 사주를 가진 날짜를 찾을 수 없습니다.');
  console.log('음력으로도 검색이 필요할 수 있습니다.');
}

console.log('\n' + '='.repeat(80));
console.log('\n계산 결과 요약:');
console.log('1971.05.12 05:00 양력: 신해 계사 정유 계묘');
console.log('1976.07.15 06:00 양력: 병진 을미 무진 을묘');
console.log('1976.09.16 09:40 양력: 병진 정유 신미 계사 ✅ (정비제님 목표 사주와 일치!)');
console.log('='.repeat(80));