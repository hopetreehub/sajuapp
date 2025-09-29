const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Checking Vercel deployment...');
  console.log('URL: https://sajuapp-seven.vercel.app/auth?mode=login');

  try {
    // Go to the Vercel deployed site
    await page.goto('https://sajuapp-seven.vercel.app/auth?mode=login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for the page to fully load
    await page.waitForTimeout(3000);

    // Check for demo button text
    const demoButtonCount = await page.locator('text=데모 계정으로 체험하기').count();
    console.log('\n========================================');
    console.log('Number of demo buttons found:', demoButtonCount);
    console.log('========================================\n');

    // Get all button elements
    const buttons = await page.locator('button').all();
    console.log('All buttons found on the page:');
    console.log('=================================\n');

    for (let i = 0; i < buttons.length; i++) {
      const buttonText = await buttons[i].textContent();
      const buttonHTML = await buttons[i].evaluate(el => el.outerHTML);

      // Check if this button contains demo text
      if (buttonText && buttonText.includes('데모')) {
        console.log(`⚠️ Button ${i + 1} - DEMO BUTTON FOUND!`);
        console.log('Text:', buttonText);
        console.log('HTML:', buttonHTML);
        console.log('---');
      } else {
        console.log(`Button ${i + 1}:`);
        console.log('Text:', buttonText);
        console.log('---');
      }
    }

    // Take screenshot
    await page.screenshot({ path: 'vercel-login-page.png', fullPage: true });
    console.log('\nScreenshot saved as vercel-login-page.png');

    if (demoButtonCount > 0) {
      console.log('\n❌ DEMO BUTTON STILL EXISTS ON VERCEL!');
      console.log('The demo login button is still visible on the Vercel deployment.');
      console.log('This indicates the deployment may not be up to date with the latest code.');
    } else {
      console.log('\n✅ Demo button successfully removed from Vercel!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();