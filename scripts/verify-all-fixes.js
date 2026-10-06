const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DOWNLOAD_DIR = path.resolve(__dirname, 'verified_downloads');

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
} else {
  // Clear previous test downloads
  fs.readdirSync(DOWNLOAD_DIR).forEach(f => fs.unlinkSync(path.join(DOWNLOAD_DIR, f)));
}

async function verifyAll() {
  console.log('--- STARTING VERIFICATION ---');
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

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER PAGE ERROR:', err.message));

  // TEST 1: Published Card Page (/c/mXLJvN39fY)
  console.log('\n[1] Navigating to /c/mXLJvN39fY...');
  await page.goto('http://localhost:3005/c/mXLJvN39fY', { waitUntil: 'networkidle2' });

  // Wait for Opening Moment and click to open
  console.log('Clicking to reveal keepsake...');
  await page.evaluate(() => {
    const btn = document.querySelector('div[class*="cursor-pointer"]');
    if (btn) btn.click();
  });
  // Wait 2500ms for reveal animation and unmount
  await new Promise(r => setTimeout(r, 2500));

  // Check card image
  const cardImgStatus = await page.evaluate(() => {
    const cardNode = document.getElementById('lovewrit-card-node');
    if (!cardNode) return { foundNode: false };
    const img = cardNode.querySelector('img[alt="Moment photo"]');
    if (!img) return { foundNode: true, foundImg: false };
    return {
      foundNode: true,
      foundImg: true,
      src: img.src,
      currentSrc: img.currentSrc,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
      crossOrigin: img.crossOrigin
    };
  });
  console.log('Card image status:', cardImgStatus);

  // Take screenshot of the card on page
  await page.screenshot({ path: path.join(__dirname, 'published_card_verified.png') });
  console.log('Saved published card screenshot to scripts/published_card_verified.png');

  // Trigger Download JPG
  console.log('Clicking "Download JPG" button...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Download JPG'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // Trigger Download PNG
  console.log('Clicking "Download PNG" button...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Download PNG'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  const downloadedFiles = fs.readdirSync(DOWNLOAD_DIR);
  console.log('Downloaded files:', downloadedFiles);
  for (const f of downloadedFiles) {
    const stat = fs.statSync(path.join(DOWNLOAD_DIR, f));
    console.log(`- ${f}: ${stat.size} bytes`);
  }

  // TEST 2: Studio Live Preview Image Upload (/create/letter-to-dear-one)
  console.log('\n[2] Navigating to /create/letter-to-dear-one...');
  await page.goto('http://localhost:3005/create/letter-to-dear-one', { waitUntil: 'networkidle2' });

  // Select Digital Card format
  console.log('Switching format to Digital Card...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cardBtn = buttons.find(b => b.textContent && b.textContent.includes('Digital Card'));
    if (cardBtn) cardBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Find file input and upload test image
  console.log('Uploading test image in Studio...');
  const fileInputs = await page.$$('input[type="file"][accept*="image"]');
  console.log(`Found ${fileInputs.length} image file inputs`);
  if (fileInputs.length > 0) {
    const testImgPath = path.resolve('public/uploads/1789913061778-image-V4ktOB-h.png');
    await fileInputs[0].uploadFile(testImgPath);
    await new Promise(r => setTimeout(r, 2500));
  }

  // Check preview image in studio
  const studioImgStatus = await page.evaluate(() => {
    const cardNode = document.getElementById('lovewrit-card-node');
    if (!cardNode) return { foundNode: false };
    const img = cardNode.querySelector('img');
    if (!img) return { foundNode: true, foundImg: false };
    return {
      foundNode: true,
      foundImg: true,
      src: img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete
    };
  });
  console.log('Studio preview image status:', studioImgStatus);

  await page.screenshot({ path: path.join(__dirname, 'studio_preview_verified.png') });
  console.log('Saved studio preview screenshot to scripts/studio_preview_verified.png');

  await browser.close();
  console.log('\n--- VERIFICATION COMPLETED ---');
}

verifyAll().catch(console.error);

