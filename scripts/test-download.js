const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testDownloadJpg() {
  const downloadPath = path.resolve(__dirname, 'test_downloads');
  if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
  });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER PAGE ERROR:', err.message));

  console.log('Navigating to card page...');
  await page.goto('http://localhost:3005/c/mXLJvN39fY', { waitUntil: 'networkidle2' });

  // If opening moment is visible, click to open
  await page.evaluate(() => {
    const btn = document.querySelector('div[class*="cursor-pointer"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Find and click "Download JPG" button
  console.log('Clicking Download JPG button...');
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const jpgBtn = buttons.find(b => b.textContent && b.textContent.includes('Download JPG'));
    if (jpgBtn) {
      jpgBtn.click();
      return true;
    }
    return false;
  });
  console.log('Download JPG button clicked:', clicked);

  // Wait 3 seconds for download to finish
  await new Promise(r => setTimeout(r, 3000));

  const downloadedFiles = fs.readdirSync(downloadPath);
  console.log('Downloaded files:', downloadedFiles);

  for (const file of downloadedFiles) {
    const filePath = path.join(downloadPath, file);
    const stat = fs.statSync(filePath);
    console.log(`File: ${file}, Size: ${stat.size} bytes`);
  }

  await browser.close();
}

testDownloadJpg().catch(console.error);

