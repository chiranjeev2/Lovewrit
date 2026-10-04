const puppeteer = require('puppeteer-core');

async function testMxl() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', m => console.log('LOG:', m.text()));
  page.on('requestfailed', r => console.log('FAILED:', r.url(), r.failure()?.errorText));

  await page.goto('http://localhost:3000/c/mXLJvN39fY', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const btn = document.querySelector('div[class*="cursor-pointer"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  const info = await page.evaluate(() => {
    const img = document.querySelector('img[alt="Moment photo"]');
    return img ? {
      src: img.src,
      currentSrc: img.currentSrc,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      crossOrigin: img.crossOrigin
    } : 'Not found';
  });

  console.log('Result for mXLJvN39fY:', info);
  await page.screenshot({ path: 'scripts/mxl_screenshot.png' });
  await browser.close();
}

testMxl().catch(console.error);

