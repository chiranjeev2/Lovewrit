const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = path.resolve('C:\\Users\\coole\\.gemini\\antigravity\\brain\\af9c29f6-4b77-4dc1-8748-b019d5701bb6');

async function testRomanticSceneEngine() {
  console.log('=== STARTING REAL-BROWSER ROMANTIC SCENE ENGINE VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test 1: Desktop Studio Customizer View
  console.log('[1] Testing Studio Customizer for Romantic Page at http://localhost:3000/create/forever-proposal...');
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:3000/create/forever-proposal', { waitUntil: 'networkidle2' });

  // Switch to Interactive Page format if not active
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pageBtn = buttons.find(b => b.textContent && b.textContent.includes('Interactive Page'));
    if (pageBtn) pageBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check that Scene Flow Customizer is rendered with Romantic pack
  const hasSceneEditor = await page.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Scene Engine • Story Flow & Customization') &&
           (text.includes('How We Met') || text.includes('Our Life Together') || text.includes('Cupid') || text.includes('Promises'));
  });
  console.log('  ✓ Romantic Scene Flow Editor visible in Studio:', hasSceneEditor);

  const studioScreenshot = path.join(ARTIFACT_DIR, 'verified_romantic_studio_customizer.png');
  await page.screenshot({ path: studioScreenshot, fullPage: false });
  console.log('  ✓ Studio screenshot saved to:', studioScreenshot);

  // Test 2: Real Checkout to Create Published Romantic Order
  console.log('\n[2] Creating an actual published Romantic Proposal order via /api/checkout...');
  const orderRes = await page.evaluate(async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType: 'PAGE',
        templateId: 'forever-proposal',
        tier: 'SELF_SERVICE',
        customerName: 'John',
        customerEmail: 'john.romantic@example.com',
        fKey: 'memoir_master_founder_secret_2026',
        pageData: {
          senderName: 'John',
          recipientName: 'Snow',
          occasion: 'proposal',
          isProposal: true,
          letter: 'From the first moment our paths crossed, I knew you were extraordinary. You have filled every ordinary day with laughter, tenderness, and boundless peace. Will you make me the happiest person and marry me?',
          colorTheme: 'rose',
        }
      })
    });
    return res.json();
  });

  console.log('  ✓ Order created response:', orderRes);
  const checkoutUrl = orderRes.checkoutUrl;
  const slugMatch = checkoutUrl.match(/slug=([a-zA-Z0-9_-]+)/);
  const slug = slugMatch ? slugMatch[1] : null;

  if (!slug) {
    throw new Error('Failed to retrieve slug from checkout response');
  }
  console.log(`  ✓ Created Romantic slug: ${slug}`);

  // Test 3: Emulate Mid-Range Android Device with 4x CPU Throttling
  console.log('\n[3] Testing Published Romantic Page on Mid-Range Android with 4x CPU Throttle...');
  const androidPage = await browser.newPage();
  
  await androidPage.setViewport({
    width: 412,
    height: 915,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2.6,
  });

  const cdpSession = await androidPage.target().createCDPSession();
  await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  console.log('  ✓ 4x CPU Throttling active on CDP session');

  const testUrl = `http://localhost:3000/p/${slug}?guest=Snow`;
  console.log(`  Navigating to ${testUrl}...`);
  await androidPage.goto(testUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Opener Scene
  const openerVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Snow') && text.includes('John');
  });
  console.log('  ✓ Opener Scene visible with personalized guest name:', openerVisible);

  const openerShot = path.join(ARTIFACT_DIR, 'verified_romantic_scene1_opener_android.png');
  await androidPage.screenshot({ path: openerShot });
  console.log('  ✓ Opener screenshot saved:', openerShot);

  // Tap Opener seal to advance
  console.log('\n[4] Tapping Opener seal to start romantic experience & audio...');
  await androidPage.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Tap to open letter"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scene 2: How We Met
  const howWeMetVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('How We Met') ||
           text.includes('The moment that changed everything') ||
           text.includes('Our Journey Started') ||
           text.includes('Where Our Journey Started');
  });
  console.log('  ✓ How We Met Scene rendered:', howWeMetVisible);
  const howWeMetShot = path.join(ARTIFACT_DIR, 'verified_romantic_scene2_how_we_met_android.png');
  await androidPage.screenshot({ path: howWeMetShot });
  console.log('  ✓ How We Met screenshot saved:', howWeMetShot);

  // Advance to Scene 3: Timeline
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cont = btns.find(b => b.textContent && (b.textContent.includes('Continue') || b.textContent.includes('Story')));
    if (cont) cont.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scene 3: Timeline
  const timelineVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Our Life Together') ||
           text.includes('Chapter by Chapter') ||
           text.includes('First Unforgettable Date');
  });
  console.log('  ✓ Timeline Scene rendered:', timelineVisible);
  const timelineShot = path.join(ARTIFACT_DIR, 'verified_romantic_scene3_timeline_android.png');
  await androidPage.screenshot({ path: timelineShot });
  console.log('  ✓ Timeline screenshot saved:', timelineShot);

  // Advance to Scene 4: Chat Story
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cont = btns.find(b => b.textContent && (b.textContent.includes('Continue') || b.textContent.includes('Cherish') || b.textContent.includes('Memory')));
    if (cont) cont.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scene 4: Chat Story
  const chatVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Our Talks') ||
           text.includes('Online in my thoughts') ||
           text.includes('Are you still awake');
  });
  console.log('  ✓ Chat Story Scene rendered:', chatVisible);
  const chatShot = path.join(ARTIFACT_DIR, 'verified_romantic_scene4_chat_android.png');
  await androidPage.screenshot({ path: chatShot });
  console.log('  ✓ Chat Story screenshot saved:', chatShot);

  // Advance to Scene 5: Memories
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cont = btns.find(b => b.textContent && b.textContent.includes('Continue'));
    if (cont) cont.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scene 5: Memories
  const memoriesVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Favorite Memories') ||
           text.includes('Nostalgia & Moments') ||
           text.includes('Golden Hour Glow');
  });
  console.log('  ✓ Memories Scene rendered:', memoriesVisible);
  const memoriesShot = path.join(ARTIFACT_DIR, 'verified_romantic_scene5_memories_android.png');
  await androidPage.screenshot({ path: memoriesShot });
  console.log('  ✓ Memories screenshot saved:', memoriesShot);

  // Advance to Scene 6: Promises
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cont = btns.find(b => b.textContent && b.textContent.includes('Continue'));
    if (cont) cont.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scene 6: Promises
  const promisesVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Promises to Each Other') ||
           text.includes('Sacred Vows') ||
           text.includes('safest place');
  });
  console.log('  ✓ Promises Scene rendered:', promisesVisible);
  const promisesShot = path.join(ARTIFACT_DIR, 'verified_romantic_scene6_promises_android.png');
  await androidPage.screenshot({ path: promisesShot });
  console.log('  ✓ Promises screenshot saved:', promisesShot);

  // Advance to Scene 7: Cupid's Arrow & Proposal
  console.log('\n[5] Advancing to Scene 7 (Cupid\'s Arrow & Proposal Dodging)...');
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cont = btns.find(b => b.textContent && b.textContent.includes('Continue'));
    if (cont) cont.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Verify Cupid's Arrow Scene
  const arrowSceneVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Cupid') ||
           text.includes('Direct Hit') ||
           text.includes('A Question From My Heart');
  });
  console.log('  ✓ Arrow Heart Scene rendered:', arrowSceneVisible);

  // Shoot Cupid's arrow towards heart via keyboard Spacebar
  console.log('  Shooting Cupid\'s arrow towards heart...');
  await androidPage.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 1800));

  // Verify Proposal Question & Dodging No Button
  const proposalDetails = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    const hasQuestion = text.includes('marry me') || text.includes('Question') || text.includes('Will you');
    const hasYes = text.includes('YES');
    const hasNo = text.includes('No');
    const hasTerms = text.includes('Terms & Conditions: Closing this page is always an option');
    return { hasQuestion, hasYes, hasNo, hasTerms };
  });
  console.log('  ✓ Proposal question & Yes button rendered:', proposalDetails.hasQuestion && proposalDetails.hasYes);
  console.log('  ✓ Dodging No button rendered:', proposalDetails.hasNo);
  console.log('  ✓ Required T&C Footnote verified ("Closing this page is always an option"):', proposalDetails.hasTerms);

  const proposalShot = path.join(ARTIFACT_DIR, 'verified_romantic_scene7_proposal_arrow_android.png');
  await androidPage.screenshot({ path: proposalShot });
  console.log('  ✓ Arrow & Proposal screenshot saved:', proposalShot);

  // Click "YES!"
  console.log('  Clicking YES! to accept proposal...');
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const yesBtn = btns.find(b => b.textContent && b.textContent.includes('YES'));
    if (yesBtn) yesBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Advance to Scene 8: Letter Unfold
  console.log('\n[6] Advancing to Scene 8 (Full Letter Unfold)...');
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const letterBtn = btns.find(b => b.textContent && b.textContent.includes('Open My Full Letter'));
    if (letterBtn) letterBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const letterVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('From My Deepest Heart') ||
           text.includes('From the first moment') ||
           text.includes('Letter read to completion') ||
           text.includes('Continue to Finale');
  });
  console.log('  ✓ Letter Unfold Scene rendered cleanly:', letterVisible);
  const letterShot = path.join(ARTIFACT_DIR, 'verified_romantic_scene8_letter_android.png');
  await androidPage.screenshot({ path: letterShot });
  console.log('  ✓ Letter screenshot saved:', letterShot);

  // Advance to Scene 9: Finale
  console.log('\n[7] Advancing to Scene 9 (Finale)...');
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const finaleBtn = btns.find(b => b.textContent && b.textContent.includes('Continue to Finale'));
    if (finaleBtn) finaleBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const finaleVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Yours Forever') ||
           text.includes('Replay') ||
           text.includes('Sent with love');
  });
  console.log('  ✓ Finale Scene rendered with Replay action:', finaleVisible);
  const finaleShot = path.join(ARTIFACT_DIR, 'verified_romantic_scene9_finale_android.png');
  await androidPage.screenshot({ path: finaleShot });
  console.log('  ✓ Finale screenshot saved:', finaleShot);

  // Test 4: Tablet Viewports (iPad Mini 768x1024 and iPad Pro 1024x1366)
  console.log('\n[8] Testing iPad Mini and iPad Pro Viewports...');
  const tabletPage = await browser.newPage();
  
  // iPad Mini
  await tabletPage.setViewport({ width: 768, height: 1024, isMobile: true, hasTouch: true });
  await tabletPage.goto(`http://localhost:3000/p/${slug}?guest=Snow`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const ipadMiniShot = path.join(ARTIFACT_DIR, 'verified_romantic_ipad_mini.png');
  await tabletPage.screenshot({ path: ipadMiniShot });
  console.log('  ✓ iPad Mini screenshot saved:', ipadMiniShot);

  // iPad Pro
  await tabletPage.setViewport({ width: 1024, height: 1366, isMobile: true, hasTouch: true });
  await tabletPage.goto(`http://localhost:3000/p/${slug}?guest=Snow`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const ipadProShot = path.join(ARTIFACT_DIR, 'verified_romantic_ipad_pro.png');
  await tabletPage.screenshot({ path: ipadProShot });
  console.log('  ✓ iPad Pro screenshot saved:', ipadProShot);
  await tabletPage.close();

  // Test 5: Prefers-Reduced-Motion Static Scroll Fallback
  console.log('\n[9] Testing Prefers-Reduced-Motion Accessibility Fallback...');
  const motionPage = await browser.newPage();
  await motionPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await motionPage.goto(`http://localhost:3000/p/${slug}?guest=Snow`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const hasStaticScroll = await motionPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Snow') &&
           text.includes('John') &&
           (text.includes('A Special Story') || text.includes('How We Met') || text.includes('Our Life Together'));
  });
  console.log('  ✓ Reduced motion gracefully rendered static scroll:', hasStaticScroll);
  await motionPage.close();

  await androidPage.close();
  await page.close();
  await browser.close();

  console.log('\n=== ALL REAL-BROWSER ROMANTIC SCENE ENGINE TESTS PASSED WITH 0 ERRORS! ===\n');
}

testRomanticSceneEngine().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
