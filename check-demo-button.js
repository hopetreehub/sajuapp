const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Checking local development server...');

  try {
    // Go to the login page
    await page.goto('http://localhost:4000/auth?mode=login', { waitUntil: 'networkidle' });

    // Wait for the page to fully load
    await page.waitForTimeout(2000);

    // Check for demo button text
    const demoButtonCount = await page.locator('text=데모 계정으로 체험하기').count();
    console.log('Number of demo buttons found:', demoButtonCount);

    // Get all button elements
    const buttons = await page.locator('button').all();
    console.log('\nAll buttons found on the page:');
    console.log('=================================');

    for (let i = 0; i < buttons.length; i++) {
      const buttonText = await buttons[i].textContent();
      const buttonHTML = await buttons[i].evaluate(el => el.outerHTML);
      console.log(`\nButton ${i + 1}:`);
      console.log('Text:', buttonText);
      console.log('HTML:', buttonHTML.substring(0, 200) + '...');
    }

    // Take screenshot
    await page.screenshot({ path: 'login-page-check.png', fullPage: true });
    console.log('\nScreenshot saved as login-page-check.png');

    if (demoButtonCount > 0) {
      console.log('\n❌ DEMO BUTTON STILL EXISTS!');
      console.log('The demo login button is still visible on the page.');
    } else {
      console.log('\n✅ Demo button successfully removed!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();