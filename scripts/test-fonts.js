const puppeteer = require('puppeteer-core');

async function testFontEmbedding() {
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

  const fontDetails = await page.evaluate(() => {
    const h3 = document.querySelector('#lovewrit-card-node h3');
    const p = document.querySelector('#lovewrit-card-node h3 + p');
    return {
      h3Font: window.getComputedStyle(h3).fontFamily,
      h3LineHeight: window.getComputedStyle(h3).lineHeight,
      h3Height: h3.offsetHeight,
      pFont: window.getComputedStyle(p).fontFamily,
      pLineHeight: window.getComputedStyle(p).lineHeight,
      pHeight: p.offsetHeight,
      fontsLoaded: Array.from(document.fonts).map(f => ({ family: f.family, status: f.status }))
    };
  });
  console.log('Font Details:', JSON.stringify(fontDetails, null, 2));

  await browser.close();
}

testFontEmbedding().catch(console.error);

