const playwright = require('playwright');

async function testMissingItems() {
  console.log('🔍 주능/주흉 누락 항목 확인...\n');

  // 데이터에 실제 있는 항목들
  const junungItems = [
    '통솔력', '결단력', '책임감', '영향력', '선득력',
    '상상력', '혁신성', '예술감', '독창성', '문제해결',
    '의사소통', '경청', '설득', '공감', '표현력',
    '이해력', '기억력', '분석력', '정리력', '적응력',
    '경영', '재무관리', '마케팅', '네트워킹', '협상력',
    '기술력', '전문지식', '실무능력', '장인정신', '발전성'
  ];

  const juhungItems = [
    '질병', '상처', '만성질환', '스트레스', '정신건강',
    '재물손실', '사기조심', '투자주의', '보증주의', '대출주의',
    '분쟁', '갈등', '오해조심', '배신주의', '이별',
    '교통사고', '산업재해', '화재', '수상사고', '낙상주의',
    '소송', '계약주의', '법적분쟁', '세무주의', '규제주의',
    '실패위험', '동업주의', '확장주의', '계역변경', '경쟁압박'
  ];

  // ITEM_OHHAENG_MAPPING에 실제 있는 항목들
  const mappedJunungItems = [
    '통솔력', '결단력', '책임감', '영향력', '선득력',
    '상상력', '혁신성', '예술감', '독창성', '문제해결',
    '의사소통', '경청', '설득', '표현력', // 공감 누락?
    '이해력', '기억력', '분석력', '정리력', '적응력',
    '경영', '재무관리', '마케팅', '네트워킹', '협상력',
    '기술력', '전문지식', '실무능력', '장인정신', '발전성'
  ];

  const mappedJuhungItems = [
    '질병', '상처', '만성질환', '정신건강', // 스트레스 누락?
    '재물손실', '사기조심', '투자주의', '보증주의', '대출주의',
    '분쟁', '갈등', '오해조심', '배신주의', '이별',
    '교통사고', '산업재해', '화재', '수상사고', '낙상주의',
    '소송', '계약주의', '법적분쟁', '세무주의', '규제주의',
    '실패위험', '동업주의', '확장주의', '계역변경', '경쟁압박'
  ];

  console.log('📋 주능 항목 확인:');
  console.log('   전체:', junungItems.length, '개');
  console.log('   매핑:', mappedJunungItems.length, '개');

  const missingJunung = junungItems.filter(item => !mappedJunungItems.includes(item));
  if (missingJunung.length > 0) {
    console.log('   ❌ 누락:', missingJunung.join(', '));
  } else {
    console.log('   ✅ 모두 매핑됨');
  }

  console.log('\n📋 주흉 항목 확인:');
  console.log('   전체:', juhungItems.length, '개');
  console.log('   매핑:', mappedJuhungItems.length, '개');

  const missingJuhung = juhungItems.filter(item => !mappedJuhungItems.includes(item));
  if (missingJuhung.length > 0) {
    console.log('   ❌ 누락:', missingJuhung.join(', '));
  } else {
    console.log('   ✅ 모두 매핑됨');
  }

  // 브라우저 테스트로 실제 확인
  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 300
  });

  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:4000/saju', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 주능 클릭
    await page.getByRole('button', { name: /주능/ }).first().click();
    await page.waitForTimeout(2000);

    // 화면에 표시된 텍스트 확인
    const pageText = await page.evaluate(() => document.body.innerText);

    console.log('\n🔍 브라우저에서 확인 중...');

    // 누락된 항목이 화면에 나타나는지 확인
    if (missingJunung.length > 0) {
      console.log('\n주능 누락 항목이 화면에 표시되는지 확인:');
      missingJunung.forEach(item => {
        const exists = pageText.includes(item);
        console.log(`   ${exists ? '✅' : '❌'} ${item}: ${exists ? '화면에 존재' : '화면에 없음'}`);
      });
    }

    await page.screenshot({ path: 'missing-items-check.png', fullPage: true });
    console.log('\n📸 스크린샷: missing-items-check.png');

  } catch (error) {
    console.error('❌ 에러:', error.message);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

testMissingItems().catch(console.error);
