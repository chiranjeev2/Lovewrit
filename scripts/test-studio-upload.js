const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testStudioUpload() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('STUDIO CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('STUDIO PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.error('STUDIO REQ FAILED:', req.url(), req.failure()?.errorText));

  console.log('Navigating to Studio...');
  await page.goto('http://localhost:3005/create/letter-to-dear-one', { waitUntil: 'networkidle2' });

  // Check initial photos in CardPreview on right
  const initialImg = await page.evaluate(() => {
    const img = document.querySelector('img[alt="Moment photo"]');
    return img ? { src: img.src, naturalWidth: img.naturalWidth } : null;
  });
  console.log('Initial preview img in CardPreview:', initialImg);

  // Find file input in Studio
  const fileInput = await page.$('input[type="file"][accept*="image"]');
  if (!fileInput) {
    throw new Error('Could not find image file input in Studio!');
  }

  // Use real test image
  const testImagePath = path.resolve('public/uploads/1789913061778-image-V4ktOB-h.png');
  console.log('Uploading real test image:', testImagePath);
  await fileInput.uploadFile(testImagePath);

  // Wait 2 seconds for upload to complete
  await new Promise(r => setTimeout(r, 2500));

  // Check preview img after upload
  const afterImg = await page.evaluate(() => {
    const previewImg = document.querySelector('img[alt="Moment photo"]');
    const trayImgs = Array.from(document.querySelectorAll('img[alt^="Photo "]')).map(i => ({
      src: i.src,
      w: i.naturalWidth,
      h: i.naturalHeight
    }));
    return {
      previewImg: previewImg ? {
        src: previewImg.src,
        w: previewImg.naturalWidth,
        h: previewImg.naturalHeight,
        complete: previewImg.complete
      } : null,
      trayImgs
    };
  });
  console.log('After upload preview state:', JSON.stringify(afterImg, null, 2));

  await page.screenshot({ path: 'test_studio_after_upload.png' });
  console.log('Studio screenshot saved to test_studio_after_upload.png');

  await browser.close();
}

testStudioUpload().catch(console.error);

