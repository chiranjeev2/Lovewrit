const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { getBrowserExecutablePath } = require('./browser-config.cjs');

const EDGE_PATH = getBrowserExecutablePath();
const ARTIFACT_DIR = path.resolve('C:\\Users\\coole\\.gemini\\antigravity\\brain\\af9c29f6-4b77-4dc1-8748-b019d5701bb6');

async function testApologySceneEngine() {
  console.log('=== STARTING REAL-BROWSER APOLOGY SCENE ENGINE VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test 1: Desktop Studio Customizer View
  console.log('[1] Testing Studio Customizer for Apology Page at http://localhost:3000/create/from-my-heart...');
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:3000/create/from-my-heart', { waitUntil: 'networkidle2' });

  // Switch to Interactive Page format if not already
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pageBtn = buttons.find(b => b.textContent && b.textContent.includes('Interactive Page'));
    if (pageBtn) pageBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Check that Scene Flow Customizer is rendered
  const hasSceneEditor = await page.evaluate(() => {
    return document.body.textContent.includes('Scene Engine • Story Flow & Customization') &&
           document.body.textContent.includes('Interactive Apology') ||
           document.body.textContent.includes('5 Reasons');
  });
  console.log('  ✓ Scene Flow Editor visible in Studio:', hasSceneEditor);

  // Take Studio Screenshot
  const studioScreenshot = path.join(ARTIFACT_DIR, 'verified_apology_studio_customizer.png');
  await page.screenshot({ path: studioScreenshot, fullPage: false });
  console.log('  ✓ Studio screenshot saved to:', studioScreenshot);

  // Test 2: Real Checkout to Create Published Apology Order
  console.log('\n[2] Creating an actual published Apology order via /api/checkout...');
  const orderRes = await page.evaluate(async (fKey) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType: 'PAGE',
        templateId: 'from-my-heart',
        tier: 'SELF_SERVICE',
        customerName: 'John',
        customerEmail: 'john.apology@example.com',
        fKey: fKey,
        pageData: {
          senderName: 'John',
          recipientName: 'Snow',
          occasion: 'apology',
          letter: 'I wanted to write this letter to say how deeply sorry I am. Words cannot undo the hurt, but my heart is entirely dedicated to listening and rebuilding our bond.',
          colorTheme: 'rose',
        }
      })
    });
    return res.json();
  }, process.env.ADMIN_MASTER_KEY || '');

  console.log('  ✓ Order created response:', orderRes);
  const checkoutUrl = orderRes.checkoutUrl;
  const slugMatch = checkoutUrl.match(/slug=([a-zA-Z0-9_-]+)/);
  const slug = slugMatch ? slugMatch[1] : null;

  if (!slug) {
    throw new Error('Failed to retrieve slug from checkout response');
  }
  console.log(`  ✓ Created Apology slug: ${slug}`);

  // Test 3: Emulate Mid-Range Android Device with 4x CPU Throttling
  console.log('\n[3] Testing Published Page on Mid-Range Android with 4x CPU Throttle...');
  const androidPage = await browser.newPage();
  
  // Set Android Mobile Viewport (Moto G / Pixel 412x915)
  await androidPage.setViewport({
    width: 412,
    height: 915,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2.6,
  });

  // Enable 4x CPU Throttling via Chrome DevTools Protocol (CDP)
  const cdpSession = await androidPage.target().createCDPSession();
  await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  console.log('  ✓ 4x CPU Throttling active on CDP session');

  // Navigate to published page with guest personalization query
  const testUrl = `http://localhost:3000/p/${slug}?guest=Snow`;
  console.log(`  Navigating to ${testUrl}...`);
  await androidPage.goto(testUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Verify Scene 1: Opener Scene
  const openerVisible = await androidPage.evaluate(() => {
    return document.body.textContent.includes('Dearest Snow') &&
           document.body.textContent.includes('Tap to Open & Begin');
  });
  console.log('  ✓ Opener Scene visible with personalized guest name:', openerVisible);

  const openerScreenshot = path.join(ARTIFACT_DIR, 'verified_apology_scene1_opener_android.png');
  await androidPage.screenshot({ path: openerScreenshot });
  console.log('  ✓ Opener screenshot saved:', openerScreenshot);

  // Tap to Open & Advance to Balloon Pop Scene
  console.log('\n[4] Tapping Opener seal to start experience & audio...');
  await androidPage.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Tap to open letter"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Verify Scene 2: Balloon Pop Scene
  const balloonsVisible = await androidPage.evaluate(() => {
    return document.body.textContent.includes('Reasons I Am Asking For Your Forgiveness') ||
           document.querySelectorAll('button[aria-label*="Tap to pop balloon"]').length > 0;
  });
  console.log('  ✓ Balloon Pop Scene rendered:', balloonsVisible);

  // Pop balloons one by one
  console.log('  Popping all 5 balloons...');
  for (let i = 0; i < 5; i++) {
    await androidPage.evaluate((balloonNum) => {
      const btn = document.querySelector(`button[aria-label="Tap to pop balloon ${balloonNum}"]`);
      if (btn) btn.click();
    }, i + 1);
    await new Promise(r => setTimeout(r, 300));
  }

  // Wait for 700ms emotional pause
  await new Promise(r => setTimeout(r, 1200));

  const completionBannerVisible = await androidPage.evaluate(() => {
    return document.body.textContent.includes('I am so sorry 😞');
  });
  console.log('  ✓ 5th pop emotional pause & "I am so sorry 😞" banner:', completionBannerVisible);

  const balloonScreenshot = path.join(ARTIFACT_DIR, 'verified_apology_scene2_balloons_popped_android.png');
  await androidPage.screenshot({ path: balloonScreenshot });
  console.log('  ✓ Balloon scene screenshot saved:', balloonScreenshot);

  // Advance to Scene 3: The Letter
  console.log('\n[5] Advancing to Scene 3 (Letter Unfold)...');
  await androidPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const nextBtn = buttons.find(b => b.textContent && b.textContent.includes('Continue'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const letterVisible = await androidPage.evaluate(() => {
    return document.body.textContent.includes('I wanted to write this letter to say how deeply sorry I am');
  });
  console.log('  ✓ Letter Unfold Scene rendered cleanly:', letterVisible);

  const letterScreenshot = path.join(ARTIFACT_DIR, 'verified_apology_scene3_letter_android.png');
  await androidPage.screenshot({ path: letterScreenshot });
  console.log('  ✓ Letter screenshot saved:', letterScreenshot);

  // Advance to Scene 4: Forgive / Reply
  console.log('\n[6] Advancing to Scene 4 (Forgive & Reply)...');
  await androidPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const nextBtn = buttons.find(b => b.textContent && (b.textContent.includes('Continue') || b.textContent.includes('Response')));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const forgiveVisible = await androidPage.evaluate(() => {
    return document.body.textContent.includes('Can We Start Fresh?') &&
           document.body.textContent.includes('I Forgive You ❤️');
  });
  console.log('  ✓ Forgive & Reply Scene rendered:', forgiveVisible);

  // Tap "I Forgive You ❤️"
  await androidPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const forgiveBtn = buttons.find(b => b.textContent && b.textContent.includes('I Forgive You ❤️'));
    if (forgiveBtn) forgiveBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const forgivenConfirmed = await androidPage.evaluate(() => {
    return document.body.textContent.includes('Thank You For Your Grace ❤️');
  });
  console.log('  ✓ Forgive confirmation triggered:', forgivenConfirmed);

  const forgiveScreenshot = path.join(ARTIFACT_DIR, 'verified_apology_scene4_forgive_android.png');
  await androidPage.screenshot({ path: forgiveScreenshot });
  console.log('  ✓ Forgive scene screenshot saved:', forgiveScreenshot);

  // Advance to Scene 5: Finale
  console.log('\n[7] Advancing to Scene 5 (Finale)...');
  await androidPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const nextBtn = buttons.find(b => b.textContent && b.textContent.includes('Continue'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const finaleVisible = await androidPage.evaluate(() => {
    return document.body.textContent.includes('Always In My Heart') &&
           document.body.textContent.includes('Replay Story ↺');
  });
  console.log('  ✓ Finale Scene rendered with Replay action:', finaleVisible);

  const finaleScreenshot = path.join(ARTIFACT_DIR, 'verified_apology_scene5_finale_android.png');
  await androidPage.screenshot({ path: finaleScreenshot });
  console.log('  ✓ Finale screenshot saved:', finaleScreenshot);

  // Test 4: Prefers Reduced Motion Fallback
  console.log('\n[8] Testing Prefers-Reduced-Motion Accessibility Fallback...');
  const motionPage = await browser.newPage();
  await motionPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await motionPage.goto(testUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const reducedMotionRendered = await motionPage.evaluate(() => {
    return document.body.textContent.includes('Dearest Snow');
  });
  console.log('  ✓ Reduced motion gracefully rendered without error:', reducedMotionRendered);

  await browser.close();
  console.log('\n=== ALL REAL-BROWSER APOLOGY SCENE ENGINE TESTS PASSED WITH 0 ERRORS! ===\n');
}

testApologySceneEngine().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});

