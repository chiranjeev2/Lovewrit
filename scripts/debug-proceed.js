const puppeteer = require('puppeteer-core');

async function debugProceed() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000/create/letter-to-dear-one', { waitUntil: 'networkidle2' });

  const formInfo = await page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) return 'No form';

    const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
    const invalidInputs = inputs.filter(i => !i.checkValidity()).map(i => ({
      name: i.name,
      id: i.id,
      type: i.type,
      required: i.required,
      value: i.value,
      validationMessage: i.validationMessage
    }));

    return {
      action: form.action,
      method: form.method,
      totalInputs: inputs.length,
      invalidInputs
    };
  });

  console.log('Form Info on page load:', JSON.stringify(formInfo, null, 2));

  // Now fill in name and email
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const nameInput = inputs.find(i => i.placeholder && i.placeholder.includes('Aarav Sharma'));
    if (nameInput) {
      nameInput.value = 'Chiranjeev Test';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const emailInput = inputs.find(i => i.type === 'email');
    if (emailInput) {
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  const formInfoAfter = await page.evaluate(() => {
    const form = document.querySelector('form');
    const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
    const invalidInputs = inputs.filter(i => !i.checkValidity()).map(i => ({
      name: i.name,
      id: i.id,
      type: i.type,
      required: i.required,
      value: i.value,
      validationMessage: i.validationMessage
    }));

    return {
      invalidInputs
    };
  });

  console.log('Form Info after filling name & email:', JSON.stringify(formInfoAfter, null, 2));

  await browser.close();
}

debugProceed().catch(console.error);

