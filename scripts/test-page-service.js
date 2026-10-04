const puppeteer = require('puppeteer-core');
const path = require('path');

async function inspectPagePreview() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  console.log('Navigating to /create/forever-proposal...');
  await page.goto('http://localhost:3000/create/forever-proposal', { waitUntil: 'networkidle2' });

  // Upload an image
  const fileInputs = await page.$$('input[type="file"][accept*="image"]');
  console.log(`Found ${fileInputs.length} image inputs on forever-proposal`);
  if (fileInputs.length > 0) {
    const testImg = path.resolve('public/uploads/1789913061778-image-V4ktOB-h.png');
    await fileInputs[0].uploadFile(testImg);
    await new Promise(r => setTimeout(r, 2000));
  }

  await page.screenshot({ path: 'scripts/forever_proposal_preview.png' });
  console.log('Saved screenshot to scripts/forever_proposal_preview.png');

  await browser.close();
}

inspectPagePreview().catch(console.error);

