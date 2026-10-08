const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { getBrowserExecutablePath } = require('./browser-config.cjs');

const EDGE_PATH = getBrowserExecutablePath();
const DOWNLOAD_DIR = path.resolve(__dirname, 'all_formats_downloads');

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
} else {
  fs.readdirSync(DOWNLOAD_DIR).forEach(f => fs.unlinkSync(path.join(DOWNLOAD_DIR, f)));
}

async function testAllFormats() {
  console.log('--- STARTING ALL FORMATS VERIFICATION ---');
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

  // 1. Visit published card page
  console.log('Navigating to http://localhost:3005/c/mXLJvN39fY...');
  await page.goto('http://localhost:3005/c/mXLJvN39fY', { waitUntil: 'networkidle2' });

  // Open the card
  await page.evaluate(() => {
    const btn = document.querySelector('div[class*="cursor-pointer"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  // Click JPG download
  console.log('Downloading JPG...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Download JPG'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // Click PNG download
  console.log('Downloading PNG...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Download PNG'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // Click Print-Ready 300 DPI download
  console.log('Downloading Print-Ready 300 DPI...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Print-Ready (300 DPI)'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3500));

  // Click Foldable Card (PDF) download
  console.log('Downloading Foldable Card (PDF)...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Foldable Card (PDF)'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 4000));

  const downloaded = fs.readdirSync(DOWNLOAD_DIR);
  console.log('Downloaded files in all_formats_downloads:', downloaded);
  for (const f of downloaded) {
    const stat = fs.statSync(path.join(DOWNLOAD_DIR, f));
    console.log(`  ✓ ${f} (${stat.size} bytes)`);
  }

  // 2. Studio upload test with JPG and PNG
  console.log('\nTesting Studio preview with fresh uploads...');
  await page.goto('http://localhost:3005/create/letter-to-dear-one', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Digital Card'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const fileInputs = await page.$$('input[type="file"][accept*="image"]');
  if (fileInputs.length > 0) {
    console.log('Uploading image to Studio...');
    const testImgPath = path.resolve('public/uploads/1789913061778-image-V4ktOB-h.png');
    await fileInputs[0].uploadFile(testImgPath);
    await new Promise(r => setTimeout(r, 2000));
  }

  const studioStatus = await page.evaluate(() => {
    const previewImg = document.querySelector('#lovewrit-card-node img');
    return previewImg ? {
      src: previewImg.src,
      complete: previewImg.complete,
      naturalWidth: previewImg.naturalWidth,
      naturalHeight: previewImg.naturalHeight
    } : null;
  });
  console.log('Studio preview image status:', studioStatus);

  await browser.close();
  console.log('--- TEST FINISHED SUCCESSFULLY ---');
}

testAllFormats().catch(console.error);

