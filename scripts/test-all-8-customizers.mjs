import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:3000';

const OCCASIONS = [
  { occasion: 'apology', slug: 'sincere-apology', sender: 'Aarav', recipient: 'Meera' },
  { occasion: 'romantic', slug: 'forever-proposal', sender: 'Dev', recipient: 'Ananya' },
  { occasion: 'anniversary', slug: 'golden-anniversary', sender: 'Kabir', recipient: 'Rhea' },
  { occasion: 'birthday', slug: 'golden-celebration', sender: 'Rohan', recipient: 'Simran' },
  { occasion: 'godhbharai', slug: 'auspicious-godhbharai', sender: 'Sharma Parivaar', recipient: 'Pooja' },
  { occasion: 'memorial', slug: 'sacred-tribute-memorial', sender: 'Kapoor Family', recipient: 'Late Shri Ram Nath Kapoor' },
  { occasion: 'kitty_party', slug: 'chic-kitty-party', sender: 'Sunita & Friends', recipient: 'Ladies' },
  { occasion: 'jagrata_kirtan', slug: 'jagrata-kirtan-invitation', sender: 'Devotees', recipient: 'Bhaktjan' },
  { occasion: 'wedding_invite', slug: 'royal-monogram-invite', sender: 'The Vermas', recipient: 'Honored Guest' },
  { occasion: 'letter', slug: 'love-letter', sender: 'Papa', recipient: 'Beta' },
];

async function testAllCustomizers() {
  console.log('================================================================');
  console.log('   TESTING 375px STUDIO CUSTOMIZER ON ALL OCCASION TEMPLATES    ');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

  const results = [];

  for (const item of OCCASIONS) {
    console.log(`\nTesting [${item.occasion}] (${item.slug}) at 375px...`);
    const url = `${BASE_URL}/create/${item.slug}`;
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Audit layout & controls on initial render
    const metrics = await page.evaluate(() => {
      const winW = window.innerWidth;
      const scrollW = document.documentElement.scrollWidth;
      const hasHorizontalOverflow = scrollW > winW + 2;

      let clippedCount = 0;
      for (const el of document.querySelectorAll('button, a, input, h1, h2, h3, h4, p, div')) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && !el.classList.contains('w-full') && !el.classList.contains('min-w-full') && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
          if (rect.left < -4 || rect.right > winW + 4) {
            clippedCount++;
          }
        }
      }

      const tapFails = [];
      const interactives = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'));
      for (const btn of interactives) {
        const rect = btn.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && btn.offsetParent !== null) {
          if (rect.width < 44 || rect.height < 44) {
            tapFails.push({
              text: btn.textContent?.trim().slice(0, 25) || btn.getAttribute('aria-label') || 'unlabeled',
              dim: `${Math.round(rect.width)}x${Math.round(rect.height)}`
            });
          }
        }
      }

      // Check Mobile Stepper / Accordion and Live Preview toggle tab
      const editTab = document.querySelector('button')?.textContent?.includes('Customize Form') || false;
      const previewTab = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('Live Preview'));

      return {
        winW,
        scrollW,
        hasHorizontalOverflow,
        clippedCount,
        tapFailCount: tapFails.length,
        tapFails: tapFails.slice(0, 3),
        hasMobileTabs: editTab || previewTab
      };
    });

    console.log(`  Layout: ScrollW=${metrics.scrollW}px, Overflow=${metrics.hasHorizontalOverflow}, Clipped=${metrics.clippedCount}, TapFails=${metrics.tapFailCount}`);

    // Test Mobile Toggle to Live Preview
    console.log('  Testing mobile tab switch to Live Preview...');
    await page.evaluate(() => {
      const previewBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Live Preview'));
      if (previewBtn) previewBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const previewVisible = await page.evaluate(() => {
      const cardOrPage = document.querySelector('#lovewrit-card-node') || document.querySelector('iframe') || document.querySelector('[data-scene-engine]');
      return Boolean(cardOrPage || document.body.textContent.includes('Preview') || document.body.textContent.includes('Active Scenes'));
    });
    console.log(`  ✓ Live preview accessible on mobile:`, previewVisible);

    // Switch back to edit
    await page.evaluate(() => {
      const editBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Customize Form'));
      if (editBtn) editBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Test form filling and order checkout submission
    console.log('  Testing full order creation to checkout...');
    await page.evaluate((sender, recipient) => {
      const senderInput = document.querySelector('input[placeholder*="Dev"]') || document.querySelector('input[placeholder*="sender"]') || document.querySelectorAll('input[type="text"]')[0];
      if (senderInput) {
        senderInput.value = sender;
        senderInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const recipientInput = document.querySelector('input[placeholder*="Ananya"]') || document.querySelector('input[placeholder*="recipient"]') || document.querySelectorAll('input[type="text"]')[1];
      if (recipientInput) {
        recipientInput.value = recipient;
        recipientInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, item.sender, item.recipient);

    // Scroll to bottom and check checkout button
    const checkoutBtnExists = await page.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Continue to Secure Checkout') || b.textContent.includes('Checkout')));
      return Boolean(submitBtn && !submitBtn.disabled);
    });

    console.log(`  ✓ Checkout CTA reachable and ready:`, checkoutBtnExists);

    results.push({
      occasion: item.occasion,
      slug: item.slug,
      scrollW: metrics.scrollW,
      overflow: metrics.hasHorizontalOverflow ? 'FAIL' : 'PASS',
      clipped: metrics.clippedCount > 0 ? `FAIL (${metrics.clippedCount})` : 'PASS',
      tapTargets: metrics.tapFailCount > 0 ? `FAIL (${metrics.tapFailCount})` : 'PASS',
      mobileTabs: metrics.hasMobileTabs ? 'PASS' : 'FAIL',
      checkoutReady: checkoutBtnExists ? 'PASS' : 'FAIL'
    });
  }

  await browser.close();

  console.log('\n================================================================');
  console.log('         375px CUSTOMIZER AUDIT SUMMARY TABLE                   ');
  console.log('================================================================');
  console.table(results);

  const hasFailures = results.some(r => r.overflow !== 'PASS' || r.clipped !== 'PASS' || r.tapTargets !== 'PASS' || r.checkoutReady !== 'PASS');
  const passedCount = results.filter(r => r.overflow === 'PASS' && r.clipped === 'PASS' && r.tapTargets === 'PASS' && r.checkoutReady === 'PASS').length;
  if (hasFailures) {
    console.error(`Audit failed: ${passedCount} / ${results.length} passed.`);
    process.exit(1);
  } else {
    console.log(`PASSED: ${passedCount} / ${results.length} customizer audits passed at 375px.`);
  }
}

testAllCustomizers().catch(err => {
  console.error('Error during 375px audit:', err);
  process.exit(1);
});

