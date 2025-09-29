const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Checking Vercel deployment homepage first...');

  try {
    // First, go to homepage
    console.log('\n1. Checking homepage: https://sajuapp-seven.vercel.app/');
    await page.goto('https://sajuapp-seven.vercel.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    let title = await page.title();
    console.log('Homepage Title:', title);

    // Take screenshot
    await page.screenshot({ path: 'vercel-homepage.png' });
    console.log('Homepage screenshot saved');

    // Now try to navigate to auth page
    console.log('\n2. Navigating to auth page...');
    await page.goto('https://sajuapp-seven.vercel.app/auth?mode=login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    title = await page.title();
    const currentUrl = page.url();
    console.log('Auth Page Title:', title);
    console.log('Current URL:', currentUrl);

    // Check for demo button
    const demoButtonCount = await page.locator('text=데모 계정으로 체험하기').count();
    console.log('\n=== Demo Button Check ===');
    console.log('Number of demo buttons found:', demoButtonCount);

    // Check page content
    const bodyText = await page.locator('body').textContent();
    if (bodyText.includes('404')) {
      console.log('\n❌ Auth page shows 404 error');
      console.log('Error content:', bodyText.substring(0, 200));
    } else if (bodyText.includes('로그인')) {
      console.log('\n✅ Auth page loaded successfully');

      // Count all buttons
      const buttons = await page.locator('button').all();
      console.log('Total buttons on page:', buttons.length);

      // Check each button for demo text
      let hasDemoButton = false;
      for (let i = 0; i < buttons.length; i++) {
        const buttonText = await buttons[i].textContent();
        if (buttonText && buttonText.includes('데모')) {
          console.log(`⚠️ Found demo button: "${buttonText}"`);
          hasDemoButton = true;
        }
      }

      if (!hasDemoButton) {
        console.log('✅ No demo button found - successfully removed!');
      }
    }

    // Take auth page screenshot
    await page.screenshot({ path: 'vercel-auth-page.png', fullPage: true });
    console.log('\nAuth page screenshot saved');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();