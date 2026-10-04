const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testFix() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3005/c/mXLJvN39fY', { waitUntil: 'networkidle2' });

  // Dismiss opening moment
  await page.evaluate(() => {
    const btn = document.querySelector('div[class*="cursor-pointer"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const info = await page.evaluate(() => {
    const node = document.getElementById('lovewrit-card-node');
    if (!node) return { found: false };
    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    const img = node.querySelector('img');
    return {
      found: true,
      rect: { width: rect.width, height: rect.height, left: rect.left, top: rect.top },
      computedMarginLeft: style.marginLeft,
      computedMarginRight: style.marginRight,
      img: img ? {
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        crossOrigin: img.crossOrigin
      } : null
    };
  });
  console.log('Node and Image Info on /c/mXLJvN39fY:', JSON.stringify(info, null, 2));

  await page.screenshot({ path: 'scripts/current_page_screenshot.png' });
  console.log('Saved screenshot to scripts/current_page_screenshot.png');

  await browser.close();
}

testFix().catch(console.error);

