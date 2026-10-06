const puppeteer = require('puppeteer-core');

async function testRealClick() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));

  await page.goto('http://localhost:3000/create/letter-to-dear-one', { waitUntil: 'networkidle2' });

  // Type in Full Name
  console.log('Typing name...');
  const nameInput = await page.$('input[placeholder*="Aarav Sharma"]');
  await nameInput.type('Chiranjeev User');

  // Type in Email
  console.log('Typing email...');
  const emailInput = await page.$('input[type="email"]');
  await emailInput.type('chiranjeev@example.com');

  // Click Terms Checkbox
  console.log('Clicking terms checkbox...');
  const termsBox = await page.$('#checkout-terms-checkbox');
  await termsBox.click();

  // Click Proceed to Checkout button
  console.log('Clicking submit button...');
  const submitBtn = await page.$('button[type="submit"]');

  // Listen for navigation or response
  const [response] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/checkout') || r.url().includes('/checkout/success'), { timeout: 15000 }).catch(e => null),
    submitBtn.click()
  ]);

  if (response) {
    console.log('Got response from:', response.url(), 'status:', response.status());
    if (response.url().includes('/api/checkout')) {
      const data = await response.json();
      console.log('Checkout API response:', data);
    }
  }

  await new Promise(r => setTimeout(r, 4000));
  console.log('Current page URL:', page.url());

  await page.screenshot({ path: 'scripts/proceed_result.png' });
  await browser.close();
}

testRealClick().catch(console.error);

