// Vercel 배포된 Customer API 테스트

const VERCEL_URL = 'https://sajuapp-6om1llu72-johns-projects-bf5e60f3.vercel.app';

async function testCustomerAPI() {
  console.log('🔍 Vercel Customer API 테스트 시작...\n');

  try {
    // 1. 고객 목록 조회 테스트
    console.log('1️⃣ 고객 목록 조회 테스트');
    console.log(`URL: ${VERCEL_URL}/api/customers?page=1&limit=100&search=`);

    const listResponse = await fetch(`${VERCEL_URL}/api/customers?page=1&limit=100&search=`);
    console.log(`상태 코드: ${listResponse.status}`);

    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log('✅ 성공!');
      console.log('응답 데이터:', JSON.stringify(listData, null, 2));
      console.log(`총 고객 수: ${listData.total || listData.data?.length || 0}`);
    } else {
      const errorText = await listResponse.text();
      console.log('❌ 실패!');
      console.log('에러 응답:', errorText);
    }

    console.log('\n---\n');

    // 2. 특정 고객 조회 테스트 (ID: 1)
    console.log('2️⃣ 특정 고객 조회 테스트 (ID: 1)');
    console.log(`URL: ${VERCEL_URL}/api/customers?id=1`);

    const detailResponse = await fetch(`${VERCEL_URL}/api/customers?id=1`);
    console.log(`상태 코드: ${detailResponse.status}`);

    if (detailResponse.ok) {
      const detailData = await detailResponse.json();
      console.log('✅ 성공!');
      console.log('응답 데이터:', JSON.stringify(detailData, null, 2));
    } else {
      const errorText = await detailResponse.text();
      console.log('❌ 실패!');
      console.log('에러 응답:', errorText);
    }

    console.log('\n---\n');

    // 3. 고객 등록 테스트
    console.log('3️⃣ 고객 등록 테스트');
    const newCustomer = {
      name: '테스트고객',
      birth_date: '1990-01-01',
      birth_time: '12:00',
      phone: '010-0000-0000',
      gender: 'male',
      lunar_solar: 'solar',
      notes: 'API 테스트 고객',
    };

    console.log(`URL: ${VERCEL_URL}/api/customers`);
    console.log('요청 데이터:', JSON.stringify(newCustomer, null, 2));

    const createResponse = await fetch(`${VERCEL_URL}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCustomer),
    });

    console.log(`상태 코드: ${createResponse.status}`);

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ 성공!');
      console.log('응답 데이터:', JSON.stringify(createData, null, 2));
    } else {
      const errorText = await createResponse.text();
      console.log('❌ 실패!');
      console.log('에러 응답:', errorText);
    }

  } catch (error) {
    console.error('❌ 테스트 중 에러 발생:', error.message);
  }

  console.log('\n✨ 테스트 완료!');
}

testCustomerAPI();
