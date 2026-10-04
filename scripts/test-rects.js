const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testSkipFontsFalse() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  await page.goto('http://localhost:3005/c/mXLJvN39fY', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const btn = document.querySelector('div[class*="cursor-pointer"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  // Run html-to-image toPng from the browser bundle or test
  const dataUrl = await page.evaluate(async () => {
    const node = document.getElementById('lovewrit-card-node');
    // Check if html-to-image is available or we can test font rendering
    // Let's check what fonts are used by h3
    const h3 = node.querySelector('h3');
    const p = node.querySelector('h3 + p');
    return {
      h3Html: h3.outerHTML,
      pHtml: p.outerHTML,
      h3Bounding: h3.getBoundingClientRect(),
      pBounding: p.getBoundingClientRect(),
    };
  });
  console.log('DOM Rects on screen:', dataUrl);

  await browser.close();
}

testSkipFontsFalse().catch(console.error);

