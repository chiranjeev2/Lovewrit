const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function runFullVerification() {
  console.log('--- STARTING FULL VERIFICATION ACROSS SERVICES & PRODUCTS ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  const testImgPath = path.resolve('public/uploads/1789913061778-image-V4ktOB-h.png');
  if (!fs.existsSync(testImgPath)) {
    throw new Error('Test image not found at ' + testImgPath);
  }

  // 1. DIGITAL CARD STUDIO
  console.log('\n[1/4] Testing Digital Card Studio: /create/letter-to-dear-one...');
  await page.goto('http://localhost:3000/create/letter-to-dear-one', { waitUntil: 'networkidle2' });
  let fileInputs = await page.$$('input[type="file"][accept*="image"]');
  if (fileInputs.length === 0) throw new Error('No image file input found on card studio');
  await fileInputs[0].uploadFile(testImgPath);
  await new Promise(r => setTimeout(r, 2000));

  const cardStudioImg = await page.evaluate(() => {
    const img = document.querySelector('#lovewrit-card-node img');
    return img ? {
      src: img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      crossOrigin: img.crossOrigin
    } : null;
  });
  console.log('Card Studio Preview Image Status:', cardStudioImg);
  await page.screenshot({ path: 'scripts/verified_card_studio_preview.png' });

  // 2. INTERACTIVE PAGE STUDIO
  console.log('\n[2/4] Testing Interactive Page Studio: /create/forever-proposal...');
  await page.goto('http://localhost:3000/create/forever-proposal', { waitUntil: 'networkidle2' });
  fileInputs = await page.$$('input[type="file"][accept*="image"]');
  if (fileInputs.length === 0) throw new Error('No image file input found on page studio');
  await fileInputs[0].uploadFile(testImgPath);
  await new Promise(r => setTimeout(r, 2000));

  const pageStudioImg = await page.evaluate(() => {
    // Look for image in Hero Section or Montage
    const imgs = Array.from(document.querySelectorAll('img')).filter(i => 
      i.src.includes('1789913061778') || i.src.startsWith('blob:') || i.src.includes('uploads')
    );
    return imgs.map(img => ({
      src: img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    }));
  });
  console.log('Page Studio Preview Image Status:', pageStudioImg);
  await page.screenshot({ path: 'scripts/verified_page_studio_preview.png' });

  // 3. CARD FINISHED PRODUCT
  console.log('\n[3/4] Testing Card Finished Product: /c/mXLJvN39fY...');
  await page.goto('http://localhost:3000/c/mXLJvN39fY', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const btn = document.querySelector('div[class*="cursor-pointer"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  const cardProductImg = await page.evaluate(() => {
    const img = document.querySelector('#lovewrit-card-node img');
    return img ? {
      src: img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      crossOrigin: img.crossOrigin
    } : null;
  });
  console.log('Card Finished Product Image Status:', cardProductImg);
  await page.screenshot({ path: 'scripts/verified_card_product.png' });

  // 4. INTERACTIVE PAGE FINISHED PRODUCT
  // Create a quick free ad-supported page order or check existing order
  console.log('\n[4/4] Creating and Testing Page Finished Product...');
  const res = await fetch('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productType: 'PAGE',
      templateId: 'forever-proposal',
      customerEmail: 'testverify@example.com',
      customerName: 'Aarav & Simran',
      currency: 'INR',
      tier: 'SELF_SERVICE',
      isBundle: false,
      isAdSupported: true,
      masterKey: process.env.ADMIN_MASTER_KEY || '',
      pageData: {
        senderName: 'Aarav',
        recipientName: 'Simran',
        occasion: 'proposal',
        letter: 'You are my universe. Forever and always.',
        photoUrls: ['/uploads/1789913061778-image-V4ktOB-h.png'],
        collageLayout: 'masonry',
        isProposal: true,
        colorTheme: 'rose'
      }
    })
  });
  const checkoutData = await res.json();
  console.log('Created Page Order:', checkoutData.slug);

  if (checkoutData.slug) {
    await page.goto(`http://localhost:3000/p/${checkoutData.slug}`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const btn = document.querySelector('div[class*="cursor-pointer"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 2500));

    const pageProductImgs = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')).filter(i => 
        i.src.includes('1789913061778') || i.src.includes('uploads')
      );
      return imgs.map(img => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }));
    });
    console.log('Page Finished Product Images:', pageProductImgs);
    await page.screenshot({ path: 'scripts/verified_page_product.png' });
  }

  await browser.close();
  console.log('\n--- VERIFICATION COMPLETE ---');
}

runFullVerification().catch(err => {
  console.error('Verification Error:', err);
  process.exit(1);
});

