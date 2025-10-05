const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('===================================================');
  console.log('🔍 음력 변환 에러 수정 후 Vercel 테스트');
  console.log('===================================================\n');

  const baseUrl = 'https://web-roan-five.vercel.app';

  try {
    // 에러 및 네트워크 모니터링 설정
    const consoleLogs = [];
    const networkErrors = [];

    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        method: request.method(),
        error: request.failure().errorText
      });
    });

    console.log('1️⃣ 페이지 로드 테스트...');
    const response = await page.goto(baseUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   응답 상태: ${response.status()}`);

    if (response.status() !== 200) {
      console.log(`   ❌ 페이지 로드 실패 - ${response.status()}`);
      return;
    }

    // 잠시 대기하여 React 컴포넌트가 렌더링될 시간을 줌
    await page.waitForTimeout(3000);

    console.log('\n2️⃣ React 렌더링 확인...');

    // React 루트 확인
    const reactRoot = await page.locator('#root').count();
    const rootContent = reactRoot > 0 ? await page.locator('#root').innerHTML() : '';

    console.log(`   React 루트 (#root): ${reactRoot > 0 ? '✅ 존재' : '❌ 없음'}`);
    console.log(`   React 루트 내용 크기: ${rootContent.length}자`);

    // 실제 화면에 표시되는 텍스트 확인
    const bodyText = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_SKIP;

            const style = window.getComputedStyle(parent);
            if (style.display === 'none' ||
                style.visibility === 'hidden' ||
                style.opacity === '0') {
              return NodeFilter.FILTER_SKIP;
            }

            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text.length > 0) {
          textNodes.push(text);
        }
      }

      return textNodes.join(' ').trim();
    });

    console.log(`   실제 표시 텍스트 길이: ${bodyText.length}자`);

    if (bodyText.length > 0) {
      console.log(`   표시 텍스트 샘플: "${bodyText.substring(0, 200)}..."`);
    } else {
      console.log('   ❌ 화면에 표시되는 텍스트가 전혀 없음!');
    }

    console.log('\n3️⃣ 핵심 UI 요소 확인...');

    const elements = {
      '운명나침반': await page.locator('text=운명나침반').count(),
      '로그인': await page.locator('text=로그인').count(),
      '회원가입': await page.locator('text=회원가입').count(),
      '로그인 버튼': await page.locator('button:has-text("로그인")').count(),
      '회원가입 버튼': await page.locator('button:has-text("회원가입")').count(),
    };

    for (const [name, count] of Object.entries(elements)) {
      console.log(`   ${name}: ${count > 0 ? '✅' : '❌'} (${count}개)`);
    }

    console.log('\n4️⃣ JavaScript 에러 확인...');
    const errors = consoleLogs.filter(log => log.startsWith('[error]'));
    if (errors.length > 0) {
      console.log(`   JavaScript 에러 ${errors.length}개 발견:`);
      errors.slice(0, 10).forEach(error => {
        console.log(`     ${error}`);
      });
    } else {
      console.log('   ✅ JavaScript 에러 없음');
    }

    console.log('\n5️⃣ 음력 변환 기능 테스트...');

    // 음력 변환 함수가 정상 작동하는지 테스트
    const lunarTestResult = await page.evaluate(() => {
      try {
        // 전역으로 노출된 음력 변환 함수가 있는지 확인
        if (window.solarToLunar) {
          const testDate = new Date(2024, 8, 30); // 2024년 9월 30일
          const result = window.solarToLunar(testDate);
          return { success: true, result: result };
        } else {
          return { success: false, error: 'solarToLunar function not found' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    if (lunarTestResult.success) {
      console.log('   ✅ 음력 변환 함수 정상 작동');
      console.log(`   결과: ${JSON.stringify(lunarTestResult.result)}`);
    } else {
      console.log(`   ⚠️ 음력 변환 함수 테스트 불가: ${lunarTestResult.error}`);
    }

    // 네트워크 에러 확인
    console.log('\n6️⃣ 네트워크 에러 확인...');
    if (networkErrors.length > 0) {
      console.log(`   네트워크 에러 ${networkErrors.length}개 발견:`);
      networkErrors.forEach(error => {
        console.log(`     ❌ ${error.method} ${error.url} - ${error.error}`);
      });
    } else {
      console.log('   ✅ 네트워크 에러 없음');
    }

    // 스크린샷 저장
    await page.screenshot({
      path: 'lunar-fix-test.png',
      fullPage: true
    });
    console.log('\n📸 스크린샷 저장: lunar-fix-test.png');

    // 결과 요약
    console.log('\n📊 테스트 결과 요약:');
    console.log(`   페이지 로드: ${response.status() === 200 ? '✅' : '❌'}`);
    console.log(`   React 렌더링: ${bodyText.length > 50 ? '✅' : '❌'}`);
    console.log(`   UI 요소 표시: ${elements['로그인'] > 0 ? '✅' : '❌'}`);
    console.log(`   JavaScript 에러: ${errors.length === 0 ? '✅' : '❌'}`);

    if (bodyText.length > 50 && elements['로그인'] > 0 && errors.length === 0) {
      console.log('\n🎉 음력 변환 에러 수정 성공! React 렌더링이 정상 작동합니다!');
    } else {
      console.log('\n⚠️ 일부 문제가 남아있을 수 있습니다.');
    }

  } catch (error) {
    console.error(`❌ 테스트 중 오류: ${error.message}`);
  } finally {
    console.log('\n===================================================');
    console.log('✨ 음력 변환 수정 테스트 완료');
    console.log('===================================================');
    await browser.close();
  }
})();