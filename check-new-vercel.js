const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Checking new Vercel deployment (sajuapp-v2)...');
  console.log('================================================\n');

  try {
    // First check homepage
    console.log('1. Testing Homepage...');
    const homepageUrl = 'https://sajuapp-v2.vercel.app/';
    const homeResponse = await page.goto(homepageUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    if (homeResponse.status() === 200) {
      console.log('✅ Homepage loads successfully!');
      const homeTitle = await page.title();
      console.log('   Title:', homeTitle);
    } else {
      console.log('❌ Homepage returned status:', homeResponse.status());
    }

    // Wait a bit
    await page.waitForTimeout(2000);

    // Now test auth page
    console.log('\n2. Testing Auth Page...');
    const authUrl = 'https://sajuapp-v2.vercel.app/auth?mode=login';
    const authResponse = await page.goto(authUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('   Response status:', authResponse.status());

    if (authResponse.status() === 200) {
      console.log('✅ Auth page loads successfully!');

      // Check page title
      const authTitle = await page.title();
      console.log('   Title:', authTitle);

      // Check for demo button
      const demoButtonCount = await page.locator('text=데모 계정으로 체험하기').count();

      if (demoButtonCount > 0) {
        console.log('❌ DEMO BUTTON STILL EXISTS! Count:', demoButtonCount);
      } else {
        console.log('✅ Demo button successfully removed!');
      }

      // Count all buttons
      const buttons = await page.locator('button').all();
      console.log('   Total buttons on page:', buttons.length);

      // Check for login form
      const emailInput = await page.locator('input[type="email"]').count();
      const passwordInput = await page.locator('input[type="password"]').count();

      if (emailInput > 0 && passwordInput > 0) {
        console.log('✅ Login form is present');
      } else {
        console.log('❌ Login form not found');
      }

    } else if (authResponse.status() === 404) {
      console.log('❌ Auth page returns 404 - SPA routing not working!');
      const bodyText = await page.locator('body').textContent();
      console.log('   Error:', bodyText.substring(0, 100));
    }

    // Take screenshots
    await page.screenshot({ path: 'new-vercel-auth.png', fullPage: true });
    console.log('\n📸 Screenshot saved as new-vercel-auth.png');

    console.log('\n================================================');
    console.log('DEPLOYMENT TEST COMPLETE');
    console.log('================================================');

  } catch (error) {
    console.error('Error during testing:', error.message);
  } finally {
    await browser.close();
  }
})();