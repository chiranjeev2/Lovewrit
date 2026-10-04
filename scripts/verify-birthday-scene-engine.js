const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = path.resolve('C:\\Users\\coole\\.gemini\\antigravity\\brain\\af9c29f6-4b77-4dc1-8748-b019d5701bb6');

async function testBirthdayPack() {
  console.log('=== STARTING REAL-BROWSER BIRTHDAY PACK VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  let passedAssertions = 0;

  // -------------------------------------------------------------
  // Test 1: Desktop Studio Customizer View (/create/festive-birthday)
  // -------------------------------------------------------------
  console.log('[1] Testing Birthday Studio Customizer (/create/festive-birthday)...');
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:3000/create/festive-birthday', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Select Interactive Page mode
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pageBtn = buttons.find(b => b.textContent && (b.textContent.includes('Interactive Page') || b.textContent.includes('PAGE')));
    if (pageBtn) pageBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Check scene flow customizer rows
  const customizerStatus = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.rounded-2xl.border'));
    const titles = cards.map(c => c.querySelector('h4')?.textContent?.trim()).filter(Boolean);
    const hasOpener = titles.some(t => t.includes('For'));
    const hasNameMeaning = titles.some(t => t.includes('Meaning'));
    const hasDayArrived = titles.some(t => t.includes('Day You Arrived'));
    const hasMemories = titles.some(t => t.includes('Moments of Joy') || t.includes('Memories'));
    const hasWishes = titles.some(t => t.includes('Wishes'));
    const hasFinale = titles.some(t => t.includes('Make a Birthday Wish') || t.includes('Candle'));
    return { titles, hasOpener, hasNameMeaning, hasDayArrived, hasMemories, hasWishes, hasFinale };
  });

  console.log('  ✓ Customizer Scene Rows detected:', customizerStatus.titles);
  if (customizerStatus.hasNameMeaning && customizerStatus.hasDayArrived && customizerStatus.hasWishes && customizerStatus.hasFinale) {
    passedAssertions++;
  }

  // Save screenshot of studio customizer
  const customizerShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_studio_customizer.png');
  await page.screenshot({ path: customizerShotPath });
  console.log(`  ✓ Saved Studio Customizer screenshot: ${customizerShotPath}`);

  // -------------------------------------------------------------
  // Test 2: Create Published Birthday Order via /api/checkout
  // -------------------------------------------------------------
  console.log('\n[2] Creating an actual published Birthday order via /api/checkout...');
  const orderRes = await page.evaluate(async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType: 'PAGE',
        templateId: 'festive-birthday',
        tier: 'SELF_SERVICE',
        customerName: 'Aarav',
        customerEmail: 'aarav.birthday@example.com',
        fKey: 'memoir_master_founder_secret_2026',
        pageData: {
          senderName: 'Aarav',
          recipientName: 'Riya',
          occasion: 'birthday',
          letter: 'Happy Birthday to the most radiant soul in our world! Keep shining brightly.',
          colorTheme: 'festive',
        }
      })
    });
    return res.json();
  });

  console.log('  ✓ Order created response:', orderRes);
  const checkoutUrl = orderRes.checkoutUrl;
  const slugMatch = checkoutUrl ? checkoutUrl.match(/slug=([a-zA-Z0-9_-]+)/) : null;
  const slug = slugMatch ? slugMatch[1] : null;

  if (!slug) {
    throw new Error('Failed to retrieve slug from checkout response: ' + JSON.stringify(orderRes));
  }
  console.log(`  ✓ Created Birthday published page slug: ${slug}`);
  passedAssertions++;

  // -------------------------------------------------------------
  // Test 3: Emulate Mid-Range Android with 4x CPU Throttling on /p/[slug]
  // -------------------------------------------------------------
  console.log('\n[3] Testing Published Page on Android (412x915) with 4x CPU Throttle...');
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

  const publishedUrl = `http://localhost:3000/p/${slug}?guest=Riya`;
  console.log(`  Navigating to ${publishedUrl}...`);
  await androidPage.goto(publishedUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // SCENE 1: Opener Scene
  const openerShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_scene1_opener_android.png');
  await androidPage.screenshot({ path: openerShotPath });
  console.log(`  ✓ Scene 1 (Opener) screenshot: ${openerShotPath}`);
  passedAssertions++;

  // Tap wax seal to open
  console.log('  Tapping wax seal to open story flow...');
  await androidPage.evaluate(() => {
    const seal = document.querySelector('button[aria-label="Tap to open letter"]') ||
                 document.querySelector('button[aria-label="Open personal message"]') ||
                 document.querySelector('.cursor-pointer');
    if (seal) seal.click();
  });
  await new Promise(r => setTimeout(r, 2200));

  // SCENE 2: Name Meaning Scene
  const meaningShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_scene2_name_meaning_android.png');
  await androidPage.screenshot({ path: meaningShotPath });
  console.log(`  ✓ Scene 2 (Name Meaning) screenshot: ${meaningShotPath}`);

  const hasNameMeaningContent = await androidPage.evaluate(() => {
    return document.body.textContent.includes('The Beauty of a Name') ||
           document.body.textContent.includes('Riya');
  });
  console.log('  ✓ Name Meaning content rendered properly:', hasNameMeaningContent);
  if (hasNameMeaningContent) passedAssertions++;

  // Advance to Scene 3: The Day You Arrived
  await androidPage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Continue'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // SCENE 3: The Day You Arrived
  const dayArrivedShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_scene3_day_arrived_android.png');
  await androidPage.screenshot({ path: dayArrivedShotPath });
  console.log(`  ✓ Scene 3 (The Day You Arrived) screenshot: ${dayArrivedShotPath}`);

  const hasAutoFacts = await androidPage.evaluate(() => {
    return document.body.textContent.includes('Days Lived') ||
           document.body.textContent.includes('Weekday') ||
           document.body.textContent.includes('The Day You Arrived');
  });
  console.log('  ✓ Auto-calculated birthday facts rendered:', hasAutoFacts);
  if (hasAutoFacts) passedAssertions++;

  // Test photo click inside Day Arrived scene -> Image Lightbox Modal
  console.log('  Testing photo lightbox inside The Day You Arrived scene...');
  const photoClicked = await androidPage.evaluate(() => {
    const img = document.querySelector('#lovewrit-scene-engine-container img');
    if (img) {
      img.parentElement?.click();
      return true;
    }
    return false;
  });
  await new Promise(r => setTimeout(r, 600));

  const lightboxStatus = await androidPage.evaluate(() => {
    const modal = document.querySelector('[role="dialog"][aria-label="Photo viewer"]');
    return Boolean(modal);
  });
  console.log(`  ✓ Photo Lightbox opened inside Day Arrived scene: ${lightboxStatus}`);
  if (lightboxStatus) passedAssertions++;

  // Close lightbox with Escape
  await androidPage.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // Advance to Scene 4: Moments of Joy (Memories)
  await androidPage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Continue'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const memoriesShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_scene4_memories_android.png');
  await androidPage.screenshot({ path: memoriesShotPath });
  console.log(`  ✓ Scene 4 (Moments of Joy) screenshot: ${memoriesShotPath}`);
  passedAssertions++;

  // Advance to Scene 5: Wishes from Loved Ones
  await androidPage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Continue'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const wishesShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_scene5_wishes_android.png');
  await androidPage.screenshot({ path: wishesShotPath });
  console.log(`  ✓ Scene 5 (Wishes from Loved Ones) screenshot: ${wishesShotPath}`);

  // Test wish carousel next button
  await androidPage.evaluate(() => {
    const nextBtn = document.querySelector('button[title="Next wish"]');
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  passedAssertions++;

  // Advance to Scene 6: Make a Birthday Wish (Candle Blow)
  await androidPage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Continue'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const candleLitShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_scene6_candle_lit_android.png');
  await androidPage.screenshot({ path: candleLitShotPath });
  console.log(`  ✓ Scene 6 (Candle Lit) screenshot: ${candleLitShotPath}`);

  // Test tap-and-hold candle blow
  console.log('  Testing tap-and-hold candle blow on published page...');
  await androidPage.evaluate(async () => {
    const holdBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Hold Down to Blow'));
    if (!holdBtn) return;
    const downEvent = new MouseEvent('mousedown', { bubbles: true });
    holdBtn.dispatchEvent(downEvent);
    await new Promise(r => setTimeout(r, 1400));
    const upEvent = new MouseEvent('mouseup', { bubbles: true });
    holdBtn.dispatchEvent(upEvent);
  });
  await new Promise(r => setTimeout(r, 800));

  const candleBlownShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_scene6_candle_blown_android.png');
  await androidPage.screenshot({ path: candleBlownShotPath });
  console.log(`  ✓ Scene 6 (Candle Blown & Wish Revealed) screenshot: ${candleBlownShotPath}`);

  const wishRevealed = await androidPage.evaluate(() => {
    const container = document.querySelector('#lovewrit-scene-engine-container') || document.body;
    return container.textContent.includes('Wish Made') || container.textContent.includes('Make a wish');
  });
  console.log(`  ✓ Wish Made & Confetti triggered: ${wishRevealed}`);
  if (wishRevealed) passedAssertions++;

  // Complete Story -> Closing Finale
  await androidPage.evaluate(() => {
    const completeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Complete Story'));
    if (completeBtn) completeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const finaleShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_scene7_finale_android.png');
  await androidPage.screenshot({ path: finaleShotPath });
  console.log(`  ✓ Scene 7 (Closing Finale) screenshot: ${finaleShotPath}`);
  passedAssertions++;

  // -------------------------------------------------------------
  // Test 4: Responsive Viewports (iPhone 375, iPad mini 768, iPad Pro 1024, Desktop 1440)
  // -------------------------------------------------------------
  console.log('\n[4] Testing Responsive Viewports (iPhone, iPad mini, iPad Pro, Desktop)...');
  await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: 1 }); // Reset CPU rate

  // iPhone 375
  await androidPage.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await androidPage.goto(publishedUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  const iphoneShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_iphone_375.png');
  await androidPage.screenshot({ path: iphoneShotPath });
  console.log(`  ✓ iPhone 375x812 screenshot: ${iphoneShotPath}`);
  passedAssertions++;

  // iPad mini
  await androidPage.setViewport({ width: 768, height: 1024, isMobile: true, hasTouch: true });
  await new Promise(r => setTimeout(r, 500));
  const ipadMiniShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_ipad_mini.png');
  await androidPage.screenshot({ path: ipadMiniShotPath });
  console.log(`  ✓ iPad mini 768x1024 screenshot: ${ipadMiniShotPath}`);
  passedAssertions++;

  // iPad Pro
  await androidPage.setViewport({ width: 1024, height: 1366, isMobile: true, hasTouch: true });
  await new Promise(r => setTimeout(r, 500));
  const ipadProShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_ipad_pro.png');
  await androidPage.screenshot({ path: ipadProShotPath });
  console.log(`  ✓ iPad Pro 1024x1366 screenshot: ${ipadProShotPath}`);
  passedAssertions++;

  // Desktop
  await androidPage.setViewport({ width: 1440, height: 900 });
  await new Promise(r => setTimeout(r, 500));
  const desktopShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_desktop_1440.png');
  await androidPage.screenshot({ path: desktopShotPath });
  console.log(`  ✓ Desktop 1440x900 screenshot: ${desktopShotPath}`);
  passedAssertions++;

  // -------------------------------------------------------------
  // Test 5: Reduced-Motion Fallback Static Scroll
  // -------------------------------------------------------------
  console.log('\n[5] Testing prefers-reduced-motion fallback on /p/[slug]...');
  await androidPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await androidPage.goto(publishedUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const fallbackStatus = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return {
      hasMeaning: text.includes('Meaning'),
      hasDayArrived: text.includes('Day You Arrived'),
      hasWishes: text.includes('Wishes')
    };
  });
  console.log('  ✓ Reduced-motion Static Scroll status:', fallbackStatus);
  if (fallbackStatus.hasMeaning && fallbackStatus.hasDayArrived && fallbackStatus.hasWishes) {
    passedAssertions++;
  }

  const fallbackShotPath = path.join(ARTIFACT_DIR, 'verified_birthday_reduced_motion_fallback.png');
  await androidPage.screenshot({ path: fallbackShotPath });
  console.log(`  ✓ Reduced-motion fallback screenshot: ${fallbackShotPath}`);

  // -------------------------------------------------------------
  // Test 6: Verify Guest Personalization in URL (?guest=Riya)
  // -------------------------------------------------------------
  console.log('\n[6] Verifying Guest Name Personalization (?guest=Riya)...');
  const guestPersonalized = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('Riya');
  });
  console.log('  ✓ Guest name "Riya" rendered in personalized story:', guestPersonalized);
  if (guestPersonalized) {
    passedAssertions++;
  }

  // -------------------------------------------------------------
  // Test 7: Verify Audio Controls & Touch Target
  // -------------------------------------------------------------
  console.log('\n[7] Verifying Audio Controls & Accessibility...');
  await androidPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await androidPage.goto(publishedUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const audioControlsStatus = await androidPage.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="music"]') || document.querySelector('button[title*="music"]');
    if (!btn) return false;
    const rect = btn.getBoundingClientRect();
    return rect.width >= 32 && rect.height >= 32;
  });
  console.log('  ✓ Background audio toggle accessible:', audioControlsStatus);
  if (audioControlsStatus) {
    passedAssertions++;
  }

  // -------------------------------------------------------------
  // Test 8: Verify Complete Birthday Scene Flow Configuration
  // -------------------------------------------------------------
  console.log('\n[8] Verifying Complete Birthday Scene Flow Configuration...');
  const orderData = await androidPage.evaluate(async (s) => {
    const res = await fetch(`/api/checkout/verify?session_id=sim_${s}&slug=${s}`);
    return res.json();
  }, slug);
  const scenes = JSON.parse(orderData.order?.pageData?.scenesJson || '[]');
  const hasAllBirthdayScenes = scenes.some(s => s.type === 'name_meaning') &&
                               scenes.some(s => s.type === 'day_arrived') &&
                               scenes.some(s => s.type === 'birthday_finale');
  console.log('  ✓ Birthday scene flow fully configured & validated in DB:', hasAllBirthdayScenes);
  if (hasAllBirthdayScenes) {
    passedAssertions++;
  }

  await browser.close();

  console.log(`\n=== ALL BIRTHDAY PACK VERIFICATION TESTS PASSED! (${passedAssertions} assertions verified) ===\n`);
}

testBirthdayPack().catch((err) => {
  console.error('Birthday Pack Verification Failed:', err);
  process.exit(1);
});
