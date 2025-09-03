// 새로운 고객 추가 테스트 (서머타임 적용 케이스)
const testCustomer = {
  name: "서머타임테스트",
  birth_date: "1988-09-18", 
  birth_time: "20:00",
  phone: "010-8888-8888",
  lunar_solar: "solar",
  gender: "male",
  memo: "서머타임 자동 적용 테스트"
};

console.log('='.repeat(60));
console.log('새로운 고객 추가 테스트 (서머타임 적용)');
console.log('='.repeat(60));

console.log('\n📝 추가할 고객 정보:');
console.log(`   이름: ${testCustomer.name}`);
console.log(`   생년월일: ${testCustomer.birth_date}`);
console.log(`   생시: ${testCustomer.birth_time}`);
console.log(`   음양력: ${testCustomer.lunar_solar}`);

// cURL로 POST 요청 보내기
const curlCommand = `curl -X POST "http://localhost:4003/api/calendar/customers" -H "Content-Type: application/json" -d '${JSON.stringify(testCustomer)}'`;

console.log('\n🔄 API 요청 중...');
console.log(`📡 ${curlCommand}`);

require('child_process').exec(curlCommand, (error, stdout, stderr) => {
  if (error) {
    console.log(`❌ 에러: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`⚠️ 경고: ${stderr}`);
  }
  
  try {
    const response = JSON.parse(stdout);
    
    if (response.success) {
      console.log('\n✅ 고객 추가 성공!');
      console.log('\n📊 계산된 사주 정보:');
      
      const sajuData = JSON.parse(response.data.saju_data);
      console.log(`   사주: ${sajuData.fullSaju}`);
      console.log(`   예상: 무진 신유 병자 정유 (서머타임 적용시)`);
      
      if (sajuData.fullSaju === '무진 신유 병자 정유') {
        console.log('\n🎯 완벽! 서머타임 로직이 정상 작동합니다!');
        console.log('   20:00 → 19:00 (서머타임 차감) → 정유 (유시)');
      } else {
        console.log('\n🤔 서머타임 적용 확인 필요');
        console.log(`   실제: ${sajuData.fullSaju}`);
      }
      
    } else {
      console.log(`❌ 실패: ${response.error || '알 수 없는 오류'}`);
    }
    
  } catch (parseError) {
    console.log(`❌ 응답 파싱 오류: ${parseError.message}`);
    console.log(`📄 Raw response: ${stdout}`);
  }
  
  console.log('\n' + '='.repeat(60));
});

// 대기시간 후 스크립트 종료 방지
setTimeout(() => {
  console.log('\n✅ 테스트 완료');
}, 3000);