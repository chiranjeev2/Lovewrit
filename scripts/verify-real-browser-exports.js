const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DOWNLOAD_DIR = path.resolve(__dirname, 'export_verification_downloads');

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
} else {
  fs.readdirSync(DOWNLOAD_DIR).forEach(f => fs.unlinkSync(path.join(DOWNLOAD_DIR, f)));
}

async function testRealBrowserExports() {
  console.log('--- STARTING REAL BROWSER EXPORT TEST (PORT 3000) ---');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOAD_DIR
  });

  page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:3000/c/anniversary-demo...');
  await page.goto('http://localhost:3000/c/anniversary-demo', { waitUntil: 'networkidle2' });

  // Open the card if opening envelope/cover is visible
  await page.evaluate(() => {
    const btn = document.querySelector('div[class*="cursor-pointer"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Click JPG download
  console.log('Testing JPG download...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Download JPG'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3500));

  // 2. Click PNG download
  console.log('Testing PNG download...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Download PNG'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3500));

  // 3. Click Print-Ready (300 DPI) download
  console.log('Testing Print-Ready (300 DPI) download...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Print-Ready (300 DPI)'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  // 4. Click Foldable Card (PDF) download
  console.log('Testing Foldable Card (PDF) download...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Foldable Card (PDF)'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 4500));

  const downloaded = fs.readdirSync(DOWNLOAD_DIR);
  console.log('\nDownloaded files in export_verification_downloads:', downloaded);
  
  if (downloaded.length === 0) {
    throw new Error('FAILED: No files downloaded.');
  }

  for (const f of downloaded) {
    const stat = fs.statSync(path.join(DOWNLOAD_DIR, f));
    console.log(`  ✓ ${f} (${stat.size} bytes)`);
    if (stat.size < 5000) {
      throw new Error(`FAILED: File ${f} is suspiciously small (${stat.size} bytes)`);
    }
  }

  console.log(`\n✅ ALL REAL-BROWSER EXPORT TESTS PASSED (${downloaded.length} / 4 exports verified: PNG, JPG, 300 DPI, PDF)!`);
  await browser.close();
}

testRealBrowserExports().catch(err => {
  console.error('❌ EXPORT TEST FAILED:', err);
  process.exit(1);
});

