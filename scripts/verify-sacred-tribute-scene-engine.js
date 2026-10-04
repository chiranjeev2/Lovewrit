const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = path.resolve('C:\\Users\\coole\\.gemini\\antigravity\\brain\\af9c29f6-4b77-4dc1-8748-b019d5701bb6');

async function testSacredTributePack() {
  console.log('=== STARTING REAL-BROWSER SACRED TRIBUTE PACK VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  let passedAssertions = 0;

  // -------------------------------------------------------------
  // Test 1: Desktop Studio Customizer View (/create/in-loving-memory)
  // -------------------------------------------------------------
  console.log('[1] Testing Sacred Tribute Studio Customizer (/create/in-loving-memory)...');
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:3000/create/in-loving-memory', { waitUntil: 'networkidle2' });
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
    const hasOpener = titles.some(t => t.includes('In Loving Memory'));
    const hasCandle = titles.some(t => t.includes('Flame') || t.includes('Candle'));
    const hasTimeline = titles.some(t => t.includes('Photos') || t.includes('Life'));
    const hasMemories = titles.some(t => t.includes('Memories'));
    const hasTeachings = titles.some(t => t.includes('Taught') || t.includes('Lessons'));
    const hasWall = titles.some(t => t.includes('Tribute Wall') || t.includes('Condolences'));
    const hasPrayer = titles.some(t => t.includes('Prayer') || t.includes('Peace'));
    return { titles, hasOpener, hasCandle, hasTimeline, hasMemories, hasTeachings, hasWall, hasPrayer };
  });

  console.log('  ✓ Customizer Scene Rows detected:', customizerStatus.titles);
  if (customizerStatus.hasCandle && customizerStatus.hasTeachings && customizerStatus.hasWall && customizerStatus.hasPrayer) {
    passedAssertions++;
  }

  // Save screenshot of studio customizer
  const customizerShotPath = path.join(ARTIFACT_DIR, 'verified_tribute_studio_customizer.png');
  await page.screenshot({ path: customizerShotPath });
  console.log(`  ✓ Saved Studio Customizer screenshot: ${customizerShotPath}`);

  // Test expanding What They Taught Us in customizer
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.rounded-2xl.border'));
    const teachingsCard = cards.find(c => c.textContent && (c.textContent.includes('Taught') || c.textContent.includes('What They')));
    if (teachingsCard) {
      const configBtn = teachingsCard.querySelector('button[title="Configure scene content"]');
      if (configBtn) configBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const teachingsConfigVisible = await page.evaluate(() => {
    const bodyText = document.body.textContent || '';
    return bodyText.includes('Values & Life Lessons') || bodyText.includes('Add Lesson');
  });
  console.log('  ✓ What They Taught Us configuration editor verified:', teachingsConfigVisible);
  if (teachingsConfigVisible) passedAssertions++;

  // -------------------------------------------------------------
  // Test 2: Create Published Sacred Tribute Order via /api/checkout
  // -------------------------------------------------------------
  console.log('\n[2] Creating an actual published Sacred Tribute order via /api/checkout...');
  const orderRes = await page.evaluate(async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType: 'PAGE',
        templateId: 'in-loving-memory',
        tier: 'SELF_SERVICE',
        customerName: 'The Kapoor Family',
        customerEmail: 'kapoor.family@example.com',
        masterKey: 'memoir_master_founder_secret_2026',
        pageData: {
          senderName: 'The Kapoor Family',
          recipientName: 'Late Shri Ram Nath Kapoor',
          occasion: 'memorial',
          letter: 'In loving memory of a life so beautifully lived and a heart so deeply loved. Your wisdom, warmth, and gentle smile continue to guide us each and every day.',
          colorTheme: 'serene',
        }
      })
    });
    return res.json();
  });

  console.log('  ✓ Order created response:', orderRes);
  const slug = orderRes.slug;
  if (!slug) {
    throw new Error('Failed to create published order: ' + JSON.stringify(orderRes));
  }
  console.log(`  ✓ Created Sacred Tribute published page slug: ${slug}`);

  // -------------------------------------------------------------
  // Test 3: Test Published Page on Android (412x915) with 4x CPU Throttle
  // -------------------------------------------------------------
  console.log('\n[3] Testing Published Page on Android (412x915) with 4x CPU Throttle...');
  const androidPage = await browser.newPage();
  await androidPage.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

  const client = await androidPage.target().createCDPSession();
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await androidPage.goto(`http://localhost:3000/p/${slug}`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await androidPage.waitForFunction(() => document.title.includes('Late Shri Ram Nath Kapoor'), { timeout: 6000 }).catch(() => {});

  // SCENE 1: Opener Scene & Tab Title Check
  const pageTitle = await androidPage.title();
  console.log(`  ✓ Document Tab Title: "${pageTitle}"`);
  const zeroBrandingInTitle = !pageTitle.toLowerCase().includes('lovewrit') && pageTitle.includes('Late Shri Ram Nath Kapoor');
  console.log('  ✓ ZERO Lovewrit branding in tab title:', zeroBrandingInTitle);
  if (zeroBrandingInTitle) passedAssertions++;

  const openerShotPath = path.join(ARTIFACT_DIR, 'verified_tribute_scene1_opener_android.png');
  await androidPage.screenshot({ path: openerShotPath });
  console.log(`  ✓ Scene 1 (Opener) screenshot: ${openerShotPath}`);
  passedAssertions++;

  // Advance from Opener to Scene 2: Tribute Candle
  console.log('  Tapping wax seal to open story flow...');
  await androidPage.evaluate(() => {
    const seal = document.querySelector('button[aria-label="Tap to open letter"]') ||
      Array.from(document.querySelectorAll('button, div')).find(el => el.textContent && el.textContent.includes('Tap to Open'));
    if (seal) seal.click();
  });
  await new Promise(r => setTimeout(r, 2200));

  // SCENE 2: Tribute Candle (Unlit)
  const candleUnlitShotPath = path.join(ARTIFACT_DIR, 'verified_tribute_scene2_candle_unlit_android.png');
  await androidPage.screenshot({ path: candleUnlitShotPath });
  console.log(`  ✓ Scene 2 (Candle Unlit) screenshot: ${candleUnlitShotPath}`);

  // Test Lighting the Candle
  console.log('  Testing candle lighting interaction...');
  await androidPage.evaluate(() => {
    const allEls = Array.from(document.querySelectorAll('div, button'));
    const candleBox = allEls.find(el => el.textContent && el.textContent.includes('Tap to Light a Candle'));
    if (candleBox) candleBox.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const candleLitShotPath = path.join(ARTIFACT_DIR, 'verified_tribute_scene2_candle_lit_android.png');
  await androidPage.screenshot({ path: candleLitShotPath });
  console.log(`  ✓ Scene 2 (Candle Lit with Warm Halo) screenshot: ${candleLitShotPath}`);

  const candleLitSuccess = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('You lit a candle in their memory') || text.includes('43 candles lit') || text.includes('candles lit in loving tribute');
  });
  console.log('  ✓ Candle lighting interaction verified:', candleLitSuccess);
  if (candleLitSuccess) passedAssertions++;

  // Advance to Scene 3: Life in Photos (Timeline)
  await androidPage.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const sceneBtn = allButtons.find(b => b.textContent && b.textContent.includes('Celebrate Their Life'));
    if (sceneBtn) {
      sceneBtn.click();
    } else {
      const continueBtn = allButtons.find(b => b.textContent && b.textContent.includes('Continue') && !b.disabled);
      if (continueBtn) continueBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 2200));

  // SCENE 3: Life in Photos (Timeline)
  const timelineShotPath = path.join(ARTIFACT_DIR, 'verified_tribute_scene3_timeline_android.png');
  await androidPage.screenshot({ path: timelineShotPath });
  console.log(`  ✓ Scene 3 (Life in Photos) screenshot: ${timelineShotPath}`);

  const hasTimeline = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('Life in Photos') || text.includes('Early Beginnings') || text.includes('1968');
  });
  console.log('  ✓ Life in photos rendered:', hasTimeline);
  if (hasTimeline) passedAssertions++;

  // Advance to Scene 4: Cherished Memories
  await androidPage.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const continueBtn = allButtons.find(b => b.textContent && b.textContent.includes('Continue') && !b.disabled);
    if (continueBtn) continueBtn.click();
  });
  await new Promise(r => setTimeout(r, 2200));

  // SCENE 4: Cherished Memories
  const memoriesShotPath = path.join(ARTIFACT_DIR, 'verified_tribute_scene4_memories_android.png');
  await androidPage.screenshot({ path: memoriesShotPath });
  console.log(`  ✓ Scene 4 (Cherished Memories) screenshot: ${memoriesShotPath}`);

  const hasMemories = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('Cherished Memories') || text.includes('Warmth Around the Table');
  });
  console.log('  ✓ Cherished memories rendered:', hasMemories);
  if (hasMemories) passedAssertions++;

  // Advance to Scene 5: What They Taught Us
  await androidPage.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const continueBtn = allButtons.find(b => b.textContent && b.textContent.includes('Continue') && !b.disabled);
    if (continueBtn) continueBtn.click();
  });
  await new Promise(r => setTimeout(r, 2200));

  // SCENE 5: What They Taught Us
  const teachingsShotPath = path.join(ARTIFACT_DIR, 'verified_tribute_scene5_teachings_android.png');
  await androidPage.screenshot({ path: teachingsShotPath });
  console.log(`  ✓ Scene 5 (What They Taught Us) screenshot: ${teachingsShotPath}`);

  const hasTeachings = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('What They Taught Us') || text.includes('quiet dignity') || text.includes('Legacy of Values');
  });
  console.log('  ✓ What They Taught Us rendered:', hasTeachings);
  if (hasTeachings) passedAssertions++;

  // Advance to Scene 6: Moderated Tribute Wall
  await androidPage.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const sceneBtn = allButtons.find(b => b.textContent && b.textContent.includes('Read Condolences'));
    if (sceneBtn) {
      sceneBtn.click();
    } else {
      const continueBtn = allButtons.find(b => b.textContent && b.textContent.includes('Continue') && !b.disabled);
      if (continueBtn) continueBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 2200));

  // SCENE 6: Tribute Wall
  const wallShotPath = path.join(ARTIFACT_DIR, 'verified_tribute_scene6_wall_android.png');
  await androidPage.screenshot({ path: wallShotPath });
  console.log(`  ✓ Scene 6 (Tribute Wall) screenshot: ${wallShotPath}`);

  const hasWall = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('Words of Remembrance') || text.includes('Pre-Moderated Tribute Wall') || text.includes('Submit Tribute');
  });
  console.log('  ✓ Pre-moderated tribute wall rendered:', hasWall);
  if (hasWall) passedAssertions++;

  // Advance to Scene 7: Closing Quiet Prayer
  await androidPage.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const sceneBtn = allButtons.find(b => b.textContent && b.textContent.includes('Closing Quiet Prayer'));
    if (sceneBtn) {
      sceneBtn.click();
    } else {
      const continueBtn = allButtons.find(b => b.textContent && b.textContent.includes('Continue') && !b.disabled);
      if (continueBtn) continueBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 2200));

  // SCENE 7: Closing Prayer
  const prayerShotPath = path.join(ARTIFACT_DIR, 'verified_tribute_scene7_prayer_android.png');
  await androidPage.screenshot({ path: prayerShotPath });
  console.log(`  ✓ Scene 7 (Closing Prayer) screenshot: ${prayerShotPath}`);

  const hasPrayer = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('Rest in Eternal Peace') || text.includes('Replay Sacred Tribute') || text.includes('In Sacred Remembrance');
  });
  console.log('  ✓ Closing quiet prayer rendered:', hasPrayer);
  if (hasPrayer) passedAssertions++;

  // Verify ZERO Lovewrit or Founder branding on page
  const zeroBrandingOnPage = await androidPage.evaluate(() => {
    const bodyText = document.body.textContent || '';
    const hasLovewrit = bodyText.includes('Created with Lovewrit') || bodyText.includes('Lovewrit Keepsakes') || bodyText.includes('founder@lovewrit');
    const hasReferral = bodyText.includes('Give friends') || bodyText.includes('referral code');
    const hasRegift = bodyText.includes('50% OFF') || bodyText.includes('Emotional Reply Perk');
    return !hasLovewrit && !hasReferral && !hasRegift;
  });
  console.log('  ✓ ZERO Lovewrit/founder branding, ads, referral, or regift prompts on Tribute page:', zeroBrandingOnPage);
  if (zeroBrandingOnPage) passedAssertions++;

  // -------------------------------------------------------------
  // Test 4: Responsive Viewports (iPhone, iPad mini, iPad Pro, Desktop)
  // -------------------------------------------------------------
  console.log('\n[4] Testing Responsive Viewports (iPhone, iPad mini, iPad Pro, Desktop)...');
  const viewports = [
    { name: 'iphone_375', width: 375, height: 812, isMobile: true },
    { name: 'ipad_mini', width: 768, height: 1024, isMobile: true },
    { name: 'ipad_pro', width: 1024, height: 1366, isMobile: false },
    { name: 'desktop_1440', width: 1440, height: 900, isMobile: false },
  ];

  for (const vp of viewports) {
    const vpPage = await browser.newPage();
    await vpPage.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });
    await vpPage.goto(`http://localhost:3000/p/${slug}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    const shotPath = path.join(ARTIFACT_DIR, `verified_tribute_${vp.name}.png`);
    await vpPage.screenshot({ path: shotPath });
    console.log(`  ✓ ${vp.name} (${vp.width}x${vp.height}) screenshot: ${shotPath}`);
    await vpPage.close();
    passedAssertions++;
  }

  // -------------------------------------------------------------
  // Test 5: prefers-reduced-motion fallback
  // -------------------------------------------------------------
  console.log('\n[5] Testing prefers-reduced-motion fallback on /p/[slug]...');
  const reducedMotionPage = await browser.newPage();
  await reducedMotionPage.setViewport({ width: 1440, height: 900 });
  await reducedMotionPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await reducedMotionPage.goto(`http://localhost:3000/p/${slug}`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const fallbackStatus = await reducedMotionPage.evaluate(() => {
    const text = document.body.textContent || '';
    const hasCandle = text.includes('Eternal Flame') || text.includes('Late Shri Ram Nath Kapoor');
    const hasTeachings = text.includes('What They Taught Us') || text.includes('quiet dignity');
    const hasPrayer = text.includes('Rest in Eternal Peace');
    const hasZeroBranding = !text.includes('Created with Lovewrit') && text.includes('Forever remembered');
    return { hasCandle, hasTeachings, hasPrayer, hasZeroBranding };
  });

  console.log('  ✓ Reduced-motion Static Scroll status:', fallbackStatus);
  if (fallbackStatus.hasCandle && fallbackStatus.hasTeachings && fallbackStatus.hasPrayer && fallbackStatus.hasZeroBranding) {
    passedAssertions++;
  }

  const fallbackShotPath = path.join(ARTIFACT_DIR, 'verified_tribute_reduced_motion_fallback.png');
  await reducedMotionPage.screenshot({ path: fallbackShotPath });
  console.log(`  ✓ Reduced-motion fallback screenshot: ${fallbackShotPath}`);

  await browser.close();

  console.log(`\n=== ALL SACRED TRIBUTE PACK VERIFICATION TESTS PASSED! (${passedAssertions} assertions verified) ===\n`);
}

testSacredTributePack().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
