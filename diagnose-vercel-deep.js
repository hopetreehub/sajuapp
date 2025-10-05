const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('===================================================');
  console.log('🔍 Vercel 화면 미표시 문제 심층 진단');
  console.log('===================================================\n');

  const testUrls = [
    'https://sajuapp-ruddy.vercel.app',
    'https://sajuapp-johns-projects-bf5e60f3.vercel.app',
    'https://sajuapp-mmhg3th0y-johns-projects-bf5e60f3.vercel.app'
  ];

  for (const baseUrl of testUrls) {
    console.log(`🌐 테스트 URL: ${baseUrl}`);
    console.log('─'.repeat(50));

    try {
      // 에러 및 네트워크 모니터링 설정
      const consoleLogs = [];
      const networkErrors = [];
      const requests = [];

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

      page.on('response', response => {
        requests.push({
          url: response.url(),
          status: response.status(),
          contentType: response.headers()['content-type']
        });
      });

      // 페이지 로드
      console.log('1️⃣ 페이지 로드 중...');
      const response = await page.goto(baseUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      console.log(`   응답 상태: ${response.status()}`);

      if (response.status() !== 200) {
        console.log(`   ❌ 페이지 로드 실패 - ${response.status()}`);
        continue;
      }

      // 페이지 내용 분석
      console.log('\n2️⃣ 페이지 내용 분석...');

      // 기본 정보
      const title = await page.title();
      const url = page.url();
      console.log(`   제목: "${title}"`);
      console.log(`   현재 URL: ${url}`);

      // HTML 구조 확인
      const htmlContent = await page.content();
      console.log(`   HTML 크기: ${htmlContent.length}자`);

      // React 관련 요소 확인
      const reactRoot = await page.locator('#root').count();
      const reactRootContent = reactRoot > 0 ? await page.locator('#root').innerHTML() : '';

      console.log(`   React 루트 (#root): ${reactRoot > 0 ? '✅ 존재' : '❌ 없음'}`);
      console.log(`   React 루트 내용 크기: ${reactRootContent.length}자`);

      // 실제 화면에 표시되는 텍스트 확인
      const bodyText = await page.evaluate(() => {
        // 숨겨진 요소 제외하고 실제 보이는 텍스트만 추출
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

      // 특정 요소들 확인
      console.log('\n3️⃣ 핵심 UI 요소 확인...');

      const elements = {
        '운명나침반': await page.locator('text=운명나침반').count(),
        '로그인': await page.locator('text=로그인').count(),
        '회원가입': await page.locator('text=회원가입').count(),
        '로그인 버튼': await page.locator('button:has-text("로그인")').count(),
        '회원가입 버튼': await page.locator('button:has-text("회원가입")').count(),
        '이메일 입력': await page.locator('input[type="email"]').count(),
        '비밀번호 입력': await page.locator('input[type="password"]').count()
      };

      for (const [name, count] of Object.entries(elements)) {
        console.log(`   ${name}: ${count > 0 ? '✅' : '❌'} (${count}개)`);
      }

      // CSS 로딩 확인
      console.log('\n4️⃣ CSS 및 스타일 확인...');
      const stylesheets = requests.filter(req =>
        req.contentType && req.contentType.includes('text/css')
      );

      console.log(`   CSS 파일 로드: ${stylesheets.length}개`);
      stylesheets.forEach(css => {
        console.log(`     ${css.status} - ${css.url.split('/').pop()}`);
      });

      // JavaScript 로딩 확인
      console.log('\n5️⃣ JavaScript 로딩 확인...');
      const scripts = requests.filter(req =>
        req.contentType && (req.contentType.includes('javascript') || req.url.endsWith('.js'))
      );

      console.log(`   JavaScript 파일 로드: ${scripts.length}개`);
      scripts.forEach(js => {
        console.log(`     ${js.status} - ${js.url.split('/').pop()}`);
      });

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

      // 콘솔 로그 확인 (JavaScript 에러)
      console.log('\n7️⃣ JavaScript 에러 확인...');
      const errors = consoleLogs.filter(log => log.startsWith('[error]'));
      if (errors.length > 0) {
        console.log(`   JavaScript 에러 ${errors.length}개 발견:`);
        errors.slice(0, 5).forEach(error => { // 처음 5개만 표시
          console.log(`     ${error}`);
        });
      } else {
        console.log('   ✅ JavaScript 에러 없음');
      }

      // DOM 요소 개수 확인
      console.log('\n8️⃣ DOM 구조 확인...');
      const domStats = await page.evaluate(() => {
        return {
          totalElements: document.querySelectorAll('*').length,
          divs: document.querySelectorAll('div').length,
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input').length,
          scripts: document.querySelectorAll('script').length,
          links: document.querySelectorAll('link').length
        };
      });

      console.log(`   전체 요소: ${domStats.totalElements}개`);
      console.log(`   div: ${domStats.divs}개`);
      console.log(`   button: ${domStats.buttons}개`);
      console.log(`   input: ${domStats.inputs}개`);
      console.log(`   script: ${domStats.scripts}개`);
      console.log(`   link: ${domStats.links}개`);

      // 스크린샷 저장
      await page.screenshot({
        path: `vercel-deep-analysis-${testUrls.indexOf(baseUrl) + 1}.png`,
        fullPage: true
      });
      console.log(`\n📸 스크린샷 저장: vercel-deep-analysis-${testUrls.indexOf(baseUrl) + 1}.png`);

      // 이 URL에서 뭔가 표시되면 더 이상 테스트하지 않음
      if (bodyText.length > 50 || elements['로그인'] > 0) {
        console.log('\n🎉 이 URL에서 콘텐츠를 찾았습니다!');
        break;
      }

    } catch (error) {
      console.error(`❌ ${baseUrl} 테스트 중 오류: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');
  }

  console.log('===================================================');
  console.log('✨ 심층 진단 완료');
  console.log('===================================================');

  await browser.close();
})();