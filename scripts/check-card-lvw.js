const puppeteer = require('puppeteer-core');

async function checkCard() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:3000/c/LVw2tk4w5z', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const btn = document.querySelector('div[class*="cursor-pointer"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'scripts/lvw_card_view.png' });
  await browser.close();
  console.log('Saved lvw_card_view.png');
}

checkCard().catch(console.error);

