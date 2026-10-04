const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testCaptureOptions() {
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

  // Test inside browser with html-to-image directly
  const results = await page.evaluate(async () => {
    const node = document.getElementById('lovewrit-card-node');
    if (!node) return { error: 'node not found' };

    // We can use the bundle's html-to-image or import from window
    const rect = node.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    // Let's check the inline style on the cloned element or what happens
    return {
      width,
      height,
      h3Text: node.querySelector('h3')?.innerText,
      pText: node.querySelector('h3 + p')?.innerText,
    };
  });
  console.log('Results:', results);

  await browser.close();
}

testCaptureOptions().catch(console.error);

