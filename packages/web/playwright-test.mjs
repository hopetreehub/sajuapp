import { chromium } from '@playwright/test';

async function testCustomerAPI() {
  console.log('🚀 Playwright 테스트 시작...\n');

  const browser = await chromium.launch({
    headless: false, // 브라우저 창을 보여줌
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // 콘솔 로그 캡처
  page.on('console', msg => {
    if (msg.text().includes('Customer API') || msg.text().includes('Error')) {
      console.log(`📝 Console: ${msg.text()}`);
    }
  });

  // 네트워크 요청 모니터링
  page.on('request', request => {
    if (request.url().includes('/api/calendar') || request.url().includes('vercel.app')) {
      console.log(`📤 Request: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/calendar') || response.url().includes('vercel.app')) {
      console.log(`📥 Response: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('\n1️⃣ 배포된 사이트 접속 중...');
    await page.goto('https://2f845225.fortune-compass.pages.dev/customers', {
      waitUntil: 'networkidle'
    });

    // 페이지 로드 대기
    await page.waitForTimeout(3000);

    console.log('\n2️⃣ 페이지 로드 완료. 콘솔 로그 확인 중...');

    // 콘솔 에러 확인
    const errors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.error');
      return errorElements.length > 0 ? 'Errors found on page' : 'No errors visible';
    });
    console.log('  페이지 에러 상태:', errors);

    console.log('\n3️⃣ API 직접 테스트...');

    // API 직접 호출 테스트
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('https://calendar-j3vjlsr7q-johns-projects-bf5e60f3.vercel.app/api/calendar/customers?page=1&limit=10');
        const contentType = response.headers.get('content-type');
        const text = await response.text();

        let parsedData = null;
        try {
          parsedData = JSON.parse(text);
        } catch (e) {
          // JSON 파싱 실패
        }

        return {
          status: response.status,
          contentType: contentType,
          isJson: contentType && contentType.includes('application/json'),
          bodyPreview: text.substring(0, 500),
          parsedData: parsedData
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('\n📊 API 테스트 결과:');
    console.log('  - Status:', apiResponse.status);
    console.log('  - Content-Type:', apiResponse.contentType);
    console.log('  - Is JSON?:', apiResponse.isJson);
    if (apiResponse.parsedData) {
      console.log('  - ✅ JSON 파싱 성공!');
      console.log('  - Data:', JSON.stringify(apiResponse.parsedData, null, 2));
    } else {
      console.log('  - ❌ JSON 파싱 실패!');
      console.log('  - Response Preview:', apiResponse.bodyPreview);
    }

    console.log('\n4️⃣ 테스트 페이지 접속...');
    await page.goto('https://2f845225.fortune-compass.pages.dev/test-api', {
      waitUntil: 'networkidle'
    });

    await page.waitForTimeout(2000);

    // API URL 확인
    const apiUrlInfo = await page.evaluate(() => {
      const hostname = window.location.hostname;
      return {
        hostname: hostname,
        isLocalhost: hostname === 'localhost',
        currentUrl: window.location.href
      };
    });

    console.log('\n🔍 페이지 정보:');
    console.log('  - Hostname:', apiUrlInfo.hostname);
    console.log('  - Is Localhost?:', apiUrlInfo.isLocalhost);
    console.log('  - Current URL:', apiUrlInfo.currentUrl);

    // 고객 목록 조회 버튼 클릭
    console.log('\n5️⃣ 고객 목록 조회 버튼 클릭...');
    const buttons = await page.$$('button');
    if (buttons.length >= 2) {
      await buttons[1].click(); // 두 번째 버튼 (고객 목록 조회)
      await page.waitForTimeout(3000);

      // 결과 확인
      const result = await page.$eval('pre', el => el.textContent);
      console.log('\n📋 테스트 페이지 결과:');

      // JSON 파싱 시도
      try {
        const parsed = JSON.parse(result.replace('로딩 중...', '').trim());
        console.log('  ✅ API 호출 성공!');
        console.log('  Response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('  ❌ API 호출 실패 또는 HTML 응답');
        console.log('  Raw Result:', result.substring(0, 500));
      }
    }

    // 스크린샷 저장
    await page.screenshot({ path: 'test-result.png', fullPage: true });
    console.log('\n📸 스크린샷 저장: test-result.png');

  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
    console.log('\n✅ 테스트 완료!');
  }
}

// 테스트 실행
testCustomerAPI().catch(console.error);