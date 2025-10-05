// Vercel 배포 상태 확인 스크립트

async function checkDeployment() {
  console.log('🔍 Vercel 배포 상태 확인 중...\n');

  const deploymentUrls = [
    'https://sajuapp-web-git-main-johns-projects-bf5e60f3.vercel.app',
    'https://sajuapp-fl1lyach8-johns-projects-bf5e60f3.vercel.app',
  ];

  for (const url of deploymentUrls) {
    console.log(`\n📡 테스트 URL: ${url}`);

    try {
      const response = await fetch(url);
      console.log(`상태 코드: ${response.status}`);

      if (response.ok) {
        console.log('✅ 배포 성공!');

        // API 테스트
        console.log('\n🔍 API 엔드포인트 테스트...');
        const apiUrl = `${url}/api/customers?page=1&limit=10&search=`;
        console.log(`API URL: ${apiUrl}`);

        const apiResponse = await fetch(apiUrl);
        console.log(`API 상태 코드: ${apiResponse.status}`);

        if (apiResponse.ok) {
          const data = await apiResponse.json();
          console.log('✅ API 정상 작동!');
          console.log(`고객 수: ${data.total || data.data?.length || 0}`);
          console.log('샘플 데이터:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
        } else if (apiResponse.status === 401) {
          console.log('⚠️  인증 필요 (401) - Deployment Protection이 활성화되어 있을 수 있음');
        } else {
          console.log(`❌ API 에러: ${apiResponse.status}`);
          const errorText = await apiResponse.text();
          console.log('에러 내용:', errorText.substring(0, 200));
        }
      } else if (response.status === 404) {
        console.log('❌ 아직 배포되지 않음 (404)');
      } else if (response.status === 401) {
        console.log('⚠️  인증 필요 (401) - Deployment Protection');
      } else {
        console.log(`❌ 에러: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ 연결 실패: ${error.message}`);
    }
  }

  console.log('\n✨ 테스트 완료!');
  console.log('\n💡 다음 단계:');
  console.log('1. Vercel 대시보드에서 배포 로그 확인');
  console.log('2. 배포 성공 시 Production URL 테스트');
  console.log('3. 고객 등록/조회 기능 테스트');
}

checkDeployment();
