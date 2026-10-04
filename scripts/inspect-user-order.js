const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function inspectUserOrder() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.error('REQ FAILED:', req.url(), req.failure()?.errorText));

  console.log('Navigating to http://localhost:3000/c/wUNI-yr7YB...');
  await page.goto('http://localhost:3000/c/wUNI-yr7YB', { waitUntil: 'networkidle2' });

  // Wait for Opening Moment and click to open
  console.log('Clicking to reveal keepsake...');
  await page.evaluate(() => {
    const btn = document.querySelector('div[class*="cursor-pointer"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  const imgInfo = await page.evaluate(() => {
    const img = document.querySelector('#lovewrit-card-node img');
    if (!img) {
      const allImgs = Array.from(document.querySelectorAll('img')).map(i => ({ src: i.src, alt: i.alt }));
      return { found: false, allImgs };
    }
    return {
      found: true,
      src: img.src,
      currentSrc: img.currentSrc,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
      crossOrigin: img.crossOrigin
    };
  });
  console.log('Image Info for wUNI-yr7YB:', JSON.stringify(imgInfo, null, 2));

  await page.screenshot({ path: 'scripts/user_order_wUNI_screenshot.png' });
  console.log('Saved screenshot to scripts/user_order_wUNI_screenshot.png');

  await browser.close();
}

inspectUserOrder().catch(console.error);

