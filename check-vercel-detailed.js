const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Checking Vercel deployment in detail...');
  console.log('URL: https://sajuapp-seven.vercel.app/auth?mode=login');

  try {
    // Go to the Vercel deployed site
    const response = await page.goto('https://sajuapp-seven.vercel.app/auth?mode=login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('\n=== Response Status ===');
    console.log('Status:', response.status());
    console.log('Status Text:', response.statusText());

    // Wait a bit for any JavaScript to execute
    await page.waitForTimeout(3000);

    // Get the page title
    const title = await page.title();
    console.log('Page Title:', title);

    // Get the page URL (in case of redirect)
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Get the page content
    const bodyText = await page.locator('body').textContent();
    console.log('\n=== Page Body Text (first 500 chars) ===');
    console.log(bodyText.substring(0, 500));

    // Check if it's a 404 page
    if (bodyText.includes('404') || bodyText.includes('NOT_FOUND')) {
      console.log('\n❌ PAGE IS SHOWING 404 ERROR!');

      // Get all text on the page
      console.log('\n=== Full Page Content ===');
      console.log(bodyText);
    } else {
      // Check for demo button
      const demoButtonCount = await page.locator('text=데모 계정으로 체험하기').count();
      console.log('\n=== Demo Button Check ===');
      console.log('Number of demo buttons found:', demoButtonCount);

      // Get all buttons
      const buttons = await page.locator('button').all();
      console.log('\n=== Button Analysis ===');
      console.log('Total buttons found:', buttons.length);

      for (let i = 0; i < Math.min(buttons.length, 5); i++) {
        const buttonText = await buttons[i].textContent();
        console.log(`Button ${i + 1}: ${buttonText}`);
      }
    }

    // Take screenshot
    await page.screenshot({ path: 'vercel-detailed-check.png', fullPage: true });
    console.log('\nScreenshot saved as vercel-detailed-check.png');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();