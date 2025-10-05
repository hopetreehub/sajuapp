const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('===================================================');
  console.log('🔍 Vercel 배포 화면 미표시 문제 진단');
  console.log('===================================================\n');

  const baseUrl = 'https://sajuapp-ruddy.vercel.app';

  try {
    console.log('1️⃣ 기본 연결 테스트...');
    console.log(`   URL: ${baseUrl}`);

    // 콘솔 로그 캡처
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // 네트워크 에러 캡처
    const networkErrors = [];
    page.on('requestfailed', request => {
      networkErrors.push(`${request.method()} ${request.url()} - ${request.failure().errorText}`);
    });

    // 페이지 로드
    const response = await page.goto(baseUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   응답 상태: ${response.status()}`);
    console.log(`   응답 헤더:`);
    const headers = response.headers();
    Object.keys(headers).forEach(key => {
      console.log(`     ${key}: ${headers[key]}`);
    });

    // 페이지 내용 확인
    console.log('\n2️⃣ 페이지 내용 분석...');

    const title = await page.title();
    console.log(`   페이지 제목: "${title}"`);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log(`   본문 텍스트 길이: ${bodyText.length}자`);

    if (bodyText.length > 0) {
      console.log(`   본문 내용 미리보기: "${bodyText.substring(0, 200)}..."`);
    } else {
      console.log('   ❌ 본문 내용이 비어있음!');
    }

    // HTML 구조 확인
    const htmlContent = await page.content();
    console.log(`   HTML 길이: ${htmlContent.length}자`);

    // React 앱 로드 여부 확인
    const reactRoot = await page.locator('#root').count();
    console.log(`   React 루트 요소 (#root): ${reactRoot > 0 ? '✅ 있음' : '❌ 없음'}`);

    if (reactRoot > 0) {
      const rootContent = await page.locator('#root').innerHTML();
      console.log(`   React 루트 내용 길이: ${rootContent.length}자`);

      if (rootContent.trim() === '') {
        console.log('   ⚠️ React 루트가 비어있음 - JavaScript 로딩 문제일 수 있음');
      }
    }

    // JavaScript 에러 확인
    console.log('\n3️⃣ JavaScript 에러 확인...');
    if (consoleLogs.length > 0) {
      console.log('   콘솔 로그:');
      consoleLogs.forEach(log => console.log(`     ${log}`));
    } else {
      console.log('   콘솔 로그 없음');
    }

    // 네트워크 에러 확인
    console.log('\n4️⃣ 네트워크 에러 확인...');
    if (networkErrors.length > 0) {
      console.log('   네트워크 에러:');
      networkErrors.forEach(error => console.log(`     ❌ ${error}`));
    } else {
      console.log('   ✅ 네트워크 에러 없음');
    }

    // 리소스 로딩 상태 확인
    console.log('\n5️⃣ 리소스 로딩 상태...');
    const scriptTags = await page.locator('script[src]').count();
    const cssTags = await page.locator('link[rel="stylesheet"]').count();
    console.log(`   스크립트 태그 수: ${scriptTags}`);
    console.log(`   CSS 링크 수: ${cssTags}`);

    // 실제 화면 캡처
    await page.screenshot({
      path: 'vercel-deployment-check.png',
      fullPage: true
    });
    console.log('\n📸 현재 화면 스크린샷: vercel-deployment-check.png');

    // 페이지 소스 일부 저장
    const htmlSample = htmlContent.substring(0, 2000);
    require('fs').writeFileSync('vercel-page-source.html', htmlSample);
    console.log('📄 페이지 소스 샘플 저장: vercel-page-source.html');

    // 특정 요소들 확인
    console.log('\n6️⃣ 핵심 요소 존재 여부...');
    const authButton = await page.locator('text=로그인').count();
    const signupButton = await page.locator('text=회원가입').count();
    const title운명나침반 = await page.locator('text=운명나침반').count();

    console.log(`   로그인 버튼: ${authButton > 0 ? '✅' : '❌'}`);
    console.log(`   회원가입 버튼: ${signupButton > 0 ? '✅' : '❌'}`);
    console.log(`   운명나침반 텍스트: ${title운명나침반 > 0 ? '✅' : '❌'}`);

    // 다른 URL도 테스트
    console.log('\n7️⃣ 다른 alias URL 테스트...');
    const otherUrls = [
      'https://sajuapp-johns-projects-bf5e60f3.vercel.app',
      'https://sajuapp-mmhg3th0y-johns-projects-bf5e60f3.vercel.app'
    ];

    for (const url of otherUrls) {
      try {
        const testResponse = await page.goto(url, { timeout: 10000 });
        console.log(`   ${url}: ${testResponse.status()}`);
      } catch (error) {
        console.log(`   ${url}: ❌ ${error.message}`);
      }
    }

  } catch (error) {
    console.error(`❌ 테스트 중 오류: ${error.message}`);
  } finally {
    console.log('\n===================================================');
    console.log('진단 완료');
    console.log('===================================================');
    await browser.close();
  }
})();