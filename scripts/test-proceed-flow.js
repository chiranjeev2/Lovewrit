const puppeteer = require('puppeteer-core');

async function testProceedFlow() {
  console.log('--- TESTING PROCEED TO CHECKOUT FLOW ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  page.on('console', msg => console.log('BROWSER:', msg.text()));

  console.log('1. Loading Studio page: /create/letter-to-dear-one...');
  await page.goto('http://localhost:3000/create/letter-to-dear-one', { waitUntil: 'networkidle2' });

  // Fill in customer details
  console.log('2. Filling customer details...');
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const nameInput = inputs.find(i => i.placeholder && i.placeholder.includes('Aarav Sharma'));
    if (nameInput) {
      nameInput.value = 'Chiranjeev Test';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const emailInput = inputs.find(i => i.type === 'email');
    if (emailInput) {
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  // Try clicking Proceed WITHOUT checking Terms box
  console.log('3. Clicking Proceed without checking Terms box...');
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const errorText = await page.evaluate(() => {
    const el = document.querySelector('div[class*="bg-red-950"]');
    return el ? el.textContent.trim() : null;
  });
  console.log('Inline Error displayed:', errorText);

  // Now check Terms box
  console.log('4. Checking Terms box...');
  await page.evaluate(() => {
    const termsCheckbox = document.getElementById('checkout-terms-checkbox');
    if (termsCheckbox) {
      termsCheckbox.click();
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // Now click Proceed to Checkout
  console.log('5. Clicking Proceed to Checkout with Terms checked...');
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });

  console.log('Waiting for navigation to /checkout/success...');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
  const finalUrl = page.url();
  console.log('Navigated to:', finalUrl);

  if (finalUrl.includes('/checkout/success')) {
    console.log('✓ SUCCESS: Proceed button seamlessly completed the order and redirected to success page!');
  } else {
    console.error('✗ FAILED: Did not navigate to success page. Current URL:', finalUrl);
  }

  await page.screenshot({ path: 'scripts/checkout_success_verified.png' });
  await browser.close();
  console.log('--- PROCEED FLOW TEST FINISHED ---');
}

testProceedFlow().catch(err => {
  console.error('Test Error:', err);
  process.exit(1);
});

