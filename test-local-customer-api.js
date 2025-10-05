// 로컬 Customer API 테스트

const LOCAL_URL = 'http://localhost:4000';

async function testLocalCustomerAPI() {
  console.log('🔍 로컬 Customer API 테스트 시작...\n');

  try {
    // 1. 고객 목록 조회 테스트
    console.log('1️⃣ 고객 목록 조회 테스트');
    console.log(`URL: ${LOCAL_URL}/api/customers?page=1&limit=100&search=`);

    const listResponse = await fetch(`${LOCAL_URL}/api/customers?page=1&limit=100&search=`);
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

    // 2. 고객 등록 테스트
    console.log('2️⃣ 고객 등록 테스트');
    const newCustomer = {
      name: '로컬테스트고객',
      birth_date: '1995-06-15',
      birth_time: '14:30',
      phone: '010-1111-2222',
      gender: 'female',
      lunar_solar: 'solar',
      notes: '로컬 API 테스트',
    };

    console.log(`URL: ${LOCAL_URL}/api/customers`);
    console.log('요청 데이터:', JSON.stringify(newCustomer, null, 2));

    const createResponse = await fetch(`${LOCAL_URL}/api/customers`, {
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

      // 3. 등록된 고객 조회
      console.log('\n---\n');
      console.log('3️⃣ 등록된 고객 조회 테스트');
      const customerId = createData.data.id;
      console.log(`URL: ${LOCAL_URL}/api/customers?id=${customerId}`);

      const detailResponse = await fetch(`${LOCAL_URL}/api/customers?id=${customerId}`);
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
    } else {
      const errorText = await createResponse.text();
      console.log('❌ 실패!');
      console.log('에러 응답:', errorText);
    }

  } catch (error) {
    console.error('❌ 테스트 중 에러 발생:', error.message);
    console.error('💡 로컬 서버가 실행 중인지 확인하세요: npm run dev');
  }

  console.log('\n✨ 테스트 완료!');
}

testLocalCustomerAPI();
