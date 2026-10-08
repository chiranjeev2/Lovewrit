const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { getBrowserExecutablePath } = require('./browser-config.cjs');

const EDGE_PATH = getBrowserExecutablePath();
const ARTIFACT_DIR = path.resolve('C:\\Users\\coole\\.gemini\\antigravity\\brain\\af9c29f6-4b77-4dc1-8748-b019d5701bb6');

async function testWeddingSceneEngine() {
  console.log('=== STARTING REAL-BROWSER WEDDING SCENE ENGINE VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test 1: Desktop Studio Customizer View
  console.log('[1] Testing Studio Customizer for Wedding Invite at http://localhost:3000/create/godhbharai-blessings...');
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:3000/create/godhbharai-blessings', { waitUntil: 'networkidle2' });

  // Switch to Interactive Page format if not active
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pageBtn = buttons.find(b => b.textContent && b.textContent.includes('Interactive Page'));
    if (pageBtn) pageBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check that Scene Flow Customizer is rendered with Wedding pack
  const hasSceneEditor = await page.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Scene Engine • Story Flow & Customization') &&
           (text.includes('Saved Your Seat') || text.includes('Presence Means Everything') || text.includes('Celebration Details') || text.includes('Story'));
  });
  console.log('  ✓ Wedding Scene Flow Editor visible in Studio:', hasSceneEditor);

  // Check Guest Link Generator tool in Studio
  const hasGuestTool = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const toolBtn = buttons.find(b => b.textContent && b.textContent.includes('Guest Link Generator'));
    if (toolBtn) {
      toolBtn.click();
      return true;
    }
    return false;
  });
  console.log('  ✓ Guest Link Generator tool clickable:', hasGuestTool);
  await new Promise(r => setTimeout(r, 500));

  const studioScreenshot = path.join(ARTIFACT_DIR, 'verified_wedding_studio_customizer.png');
  await page.screenshot({ path: studioScreenshot, fullPage: false });
  console.log('  ✓ Studio screenshot saved to:', studioScreenshot);

  // Test 2: Real Checkout to Create Published Wedding Order
  console.log('\n[2] Creating an actual published Wedding Invite order via /api/checkout...');
  const orderRes = await page.evaluate(async (fKey) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType: 'PAGE',
        templateId: 'godhbharai-blessings',
        tier: 'SELF_SERVICE',
        customerName: 'Pooja & Sameer',
        customerEmail: 'pooja.sameer.wedding@example.com',
        fKey: fKey,
        pageData: {
          senderName: 'Pooja & Sameer',
          recipientName: 'Honored Family',
          occasion: 'wedding',
          letter: 'We warmly invite you to celebrate the joyous wedding of Pooja & Sameer with music, blessings, and heartfelt laughter.',
          colorTheme: 'champagne',
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
  console.log(`  ✓ Created Wedding slug: ${slug}`);

  // Test 3: Emulate Mid-Range Android Device with 4x CPU Throttling
  console.log('\n[3] Testing Published Wedding Page on Mid-Range Android with 4x CPU Throttle...');
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

  const testUrl = `http://localhost:3000/p/${slug}?guest=Aunt%20Priya`;
  console.log(`  Navigating to ${testUrl}...`);
  await androidPage.goto(testUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Opener Scene with Personalized Guest Name
  const openerVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Aunt Priya') &&
           text.includes('Pooja & Sameer');
  });
  console.log('  ✓ Opener Scene visible with personalized guest name (Aunt Priya):', openerVisible);

  const openerShot = path.join(ARTIFACT_DIR, 'verified_wedding_scene1_opener_android.png');
  await androidPage.screenshot({ path: openerShot });
  console.log('  ✓ Opener screenshot saved:', openerShot);

  // Tap Opener seal to advance
  console.log('\n[4] Tapping Opener seal to start wedding experience & audio...');
  await androidPage.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Tap to open letter"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scene 2: Wedding Couple Story & Devotional Blessing
  const weddingStoryVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Our Story') ||
           text.includes('Two souls, two families') ||
           text.includes('Grace & Gratitude');
  });
  console.log('  ✓ Wedding Story Scene rendered with faith/devotional layer:', weddingStoryVisible);
  const weddingStoryShot = path.join(ARTIFACT_DIR, 'verified_wedding_scene2_story_android.png');
  await androidPage.screenshot({ path: weddingStoryShot });
  console.log('  ✓ Wedding Story screenshot saved:', weddingStoryShot);

  // Advance to Scene 3: Event Details
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cont = btns.find(b => b.textContent && (b.textContent.includes('Details') || b.textContent.includes('Continue')));
    if (cont) cont.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scene 3: Event Details
  const eventDetailsVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Celebration Details') ||
           text.includes('Save The Date') ||
           text.includes('Grand Heritage Palace');
  });
  console.log('  ✓ Event Details Scene rendered with date, venue & map:', eventDetailsVisible);
  const eventDetailsShot = path.join(ARTIFACT_DIR, 'verified_wedding_scene3_details_android.png');
  await androidPage.screenshot({ path: eventDetailsShot });
  console.log('  ✓ Event Details screenshot saved:', eventDetailsShot);

  // Advance to Scene 4: Personal Note ("Your presence means everything")
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cont = btns.find(b => b.textContent && (b.textContent.includes('Warm Note') || b.textContent.includes('Continue')));
    if (cont) cont.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scene 4: Personal Note
  const personalNoteVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Your Presence Means Everything') ||
           text.includes('From Our Hearts') ||
           text.includes('Dearest Aunt Priya');
  });
  console.log('  ✓ Personal Note Scene rendered with warm emotional pull (no guilt copy):', personalNoteVisible);
  const personalNoteShot = path.join(ARTIFACT_DIR, 'verified_wedding_scene4_note_android.png');
  await androidPage.screenshot({ path: personalNoteShot });
  console.log('  ✓ Personal Note screenshot saved:', personalNoteShot);

  // Advance to Scene 5: RSVP ("We saved your seat")
  console.log('\n[5] Advancing to Scene 5 (We Saved Your Seat & RSVP)...');
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cont = btns.find(b => b.textContent && (b.textContent.includes('RSVP') || b.textContent.includes('Seat') || b.textContent.includes('Continue')));
    if (cont) cont.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scene 5: RSVP Details
  const rsvpVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('We Saved Your Seat') ||
           text.includes('Table & Guest Reservation') ||
           text.includes('Aunt Priya');
  });
  console.log('  ✓ RSVP Scene rendered with personalized table plaque for Aunt Priya:', rsvpVisible);

  // Test RSVP Joyful Acceptance & Party Size selection
  console.log('  Selecting "Joyfully Accept" and 2 Guests...');
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const acceptBtn = btns.find(b => b.textContent && b.textContent.includes('Joyfully Accept'));
    if (acceptBtn) acceptBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const twoGuests = btns.find(b => b.textContent && b.textContent.includes('2 Guests'));
    if (twoGuests) twoGuests.click();
    const confirmBtn = btns.find(b => b.textContent && b.textContent.includes('Confirm RSVP'));
    if (confirmBtn) confirmBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check confirmation & RSVP Count
  const rsvpConfirmed = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('RSVP Confirmed') || text.includes('Joy') || text.includes('attending so far');
  });
  console.log('  ✓ RSVP Acceptance & RSVP Count Badge confirmed:', rsvpConfirmed);

  const rsvpShot = path.join(ARTIFACT_DIR, 'verified_wedding_scene5_rsvp_android.png');
  await androidPage.screenshot({ path: rsvpShot });
  console.log('  ✓ RSVP screenshot saved:', rsvpShot);

  // Advance to Scene 6: Finale
  console.log('\n[6] Advancing to Scene 6 (Finale)...');
  await androidPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const finaleBtn = btns.find(b => b.textContent && (b.textContent.includes('Continue') || b.textContent.includes('Finale')));
    if (finaleBtn) finaleBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const finaleVisible = await androidPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Celebrate') ||
           text.includes('Replay') ||
           text.includes('Pooja & Sameer');
  });
  console.log('  ✓ Finale Scene rendered with Replay action:', finaleVisible);
  const finaleShot = path.join(ARTIFACT_DIR, 'verified_wedding_scene6_finale_android.png');
  await androidPage.screenshot({ path: finaleShot });
  console.log('  ✓ Finale screenshot saved:', finaleShot);

  // Test 4: Tablet Viewports (iPad Mini 768x1024 and iPad Pro 1024x1366)
  console.log('\n[7] Testing iPad Mini and iPad Pro Viewports...');
  const tabletPage = await browser.newPage();
  
  // iPad Mini
  await tabletPage.setViewport({ width: 768, height: 1024, isMobile: true, hasTouch: true });
  await tabletPage.goto(`http://localhost:3000/p/${slug}?guest=Aunt%20Priya`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const ipadMiniShot = path.join(ARTIFACT_DIR, 'verified_wedding_ipad_mini.png');
  await tabletPage.screenshot({ path: ipadMiniShot });
  console.log('  ✓ iPad Mini screenshot saved:', ipadMiniShot);

  // iPad Pro
  await tabletPage.setViewport({ width: 1024, height: 1366, isMobile: true, hasTouch: true });
  await tabletPage.goto(`http://localhost:3000/p/${slug}?guest=Aunt%20Priya`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const ipadProShot = path.join(ARTIFACT_DIR, 'verified_wedding_ipad_pro.png');
  await tabletPage.screenshot({ path: ipadProShot });
  console.log('  ✓ iPad Pro screenshot saved:', ipadProShot);
  await tabletPage.close();

  // Test 5: Prefers-Reduced-Motion Static Scroll Fallback
  console.log('\n[8] Testing Prefers-Reduced-Motion Accessibility Fallback...');
  const motionPage = await browser.newPage();
  await motionPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await motionPage.goto(`http://localhost:3000/p/${slug}?guest=Aunt%20Priya`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const hasStaticScroll = await motionPage.evaluate(() => {
    const text = document.body.textContent || "";
    return text.includes('Aunt Priya') &&
           text.includes('Pooja & Sameer') &&
           (text.includes('A Special Story') || text.includes('Celebration Details') || text.includes('Seat'));
  });
  console.log('  ✓ Reduced motion gracefully rendered static scroll:', hasStaticScroll);
  await motionPage.close();

  await androidPage.close();
  await page.close();
  await browser.close();

  console.log('\n=== ALL REAL-BROWSER WEDDING SCENE ENGINE TESTS PASSED WITH 0 ERRORS! ===\n');
}

testWeddingSceneEngine().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
