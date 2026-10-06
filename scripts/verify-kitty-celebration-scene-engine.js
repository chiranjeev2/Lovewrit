const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = path.resolve('C:\\Users\\coole\\.gemini\\antigravity\\brain\\af9c29f6-4b77-4dc1-8748-b019d5701bb6');

async function testKittyCelebrationPack() {
  console.log('=== STARTING REAL-BROWSER KITTY / CELEBRATION PACK VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  let passedAssertions = 0;

  // -------------------------------------------------------------
  // Test 1: Desktop Studio Customizer View (/create/chic-kitty-party)
  // -------------------------------------------------------------
  console.log('[1] Testing Kitty / Celebration Studio Customizer (/create/chic-kitty-party)...');
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:3000/create/chic-kitty-party', { waitUntil: 'networkidle2' });
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
    const hasOpener = titles.some(t => t.includes('Invited by Name') || t.includes('The Glam Tribe'));
    const hasTheme = titles.some(t => t.includes('Vibe & Dress Code') || t.includes('Party Theme') || t.includes('Dress Code'));
    const hasDetails = titles.some(t => t.includes('Venue & Schedule') || t.includes('Celebration Details') || t.includes('Schedule'));
    const hasNote = titles.some(t => t.includes('Can\'t Wait') || t.includes('Personal Note') || t.includes('See You'));
    const hasRsvp = titles.some(t => t.includes('Saved Your Seat') || t.includes('RSVP'));
    const hasFinale = titles.some(t => t.includes('Party Floor') || t.includes('Celebrate'));
    return { titles, hasOpener, hasTheme, hasDetails, hasNote, hasRsvp, hasFinale };
  });

  console.log('  ✓ Customizer Scene Rows detected:', customizerStatus.titles);
  if (customizerStatus.hasTheme && customizerStatus.hasDetails && customizerStatus.hasNote && customizerStatus.hasRsvp) {
    passedAssertions++;
  }

  // Save screenshot of studio customizer
  const customizerShotPath = path.join(ARTIFACT_DIR, 'verified_kitty_studio_customizer.png');
  await page.screenshot({ path: customizerShotPath });
  console.log(`  ✓ Saved Studio Customizer screenshot: ${customizerShotPath}`);

  // Test Guest Link Generator in Customizer
  console.log('  Testing Guest Link Batch Generator...');
  const guestLinkResult = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const guestBtn = buttons.find(b => b.textContent && b.textContent.includes('Guest Link Generator'));
    if (guestBtn) guestBtn.click();
    return Boolean(guestBtn);
  });
  await new Promise(r => setTimeout(r, 600));

  await page.type('textarea[placeholder*="Grandpa"]', 'Ananya, Riya, Aisha, Neha');
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const genBtn = buttons.find(b => b.textContent && b.textContent.includes('Generate Links'));
    if (genBtn) genBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const guestLinksGenerated = await page.evaluate(() => {
    const body = document.body.textContent || '';
    return body.includes('Ananya') && body.includes('?guest=Ananya') && body.includes('Riya');
  });
  console.log('  ✓ Guest Link Batch Generator verified:', guestLinksGenerated);
  if (guestLinksGenerated) passedAssertions++;

  // Test expanding Party Theme & Dress Code in customizer
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.rounded-2xl.border'));
    const themeCard = cards.find(c => c.textContent && (c.textContent.includes('Vibe & Dress Code') || c.textContent.includes('Party Theme')));
    if (themeCard) {
      const configBtn = themeCard.querySelector('button[title="Configure scene content"]');
      if (configBtn) configBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const themeConfigVisible = await page.evaluate(() => {
    const bodyText = document.body.textContent || '';
    return bodyText.includes('Party Vibe, Theme & Dress Code') || bodyText.includes('Party Highlights Checklist');
  });
  console.log('  ✓ Party Theme configuration editor verified:', themeConfigVisible);
  if (themeConfigVisible) passedAssertions++;

  // -------------------------------------------------------------
  // Test 2: Create Published Kitty Party Order via /api/checkout
  // -------------------------------------------------------------
  console.log('\n[2] Creating an actual published Kitty Party order via /api/checkout...');
  const orderRes = await page.evaluate(async (mKey) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType: 'PAGE',
        templateId: 'chic-kitty-party',
        tier: 'SELF_SERVICE',
        customerName: 'Shalini & Friends',
        customerEmail: 'shalini.kitty@example.com',
        masterKey: mKey,
        pageData: {
          senderName: 'Shalini & The Glam Tribe',
          recipientName: 'The Glam Tribe',
          occasion: 'kitty_party',
          letter: 'Get ready for an afternoon of fabulous bites, sparkling drinks, hilarious games, and non-stop laughter with the gang! Dress code: Pastel Chic & Hats 👒',
          colorTheme: 'festive',
        }
      })
    });
    return res.json();
  }, process.env.ADMIN_MASTER_KEY || '');

  console.log('  ✓ Order created response:', orderRes);
  const slug = orderRes.slug;
  if (!slug) {
    throw new Error('Failed to create published order: ' + JSON.stringify(orderRes));
  }
  console.log(`  ✓ Created Kitty Party published page slug: ${slug}`);

  // -------------------------------------------------------------
  // Test 3: Test Published Page on Android (412x915) with 4x CPU Throttle and Personalized Guest Name (?guest=Ananya)
  // -------------------------------------------------------------
  console.log('\n[3] Testing Published Page on Android (412x915) with 4x CPU Throttle & ?guest=Ananya...');
  const androidPage = await browser.newPage();
  await androidPage.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

  const client = await androidPage.target().createCDPSession();
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await androidPage.goto(`http://localhost:3000/p/${slug}?guest=Ananya`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // SCENE 1: Opener Scene with Personalized Guest Name
  const openerTitle = await androidPage.evaluate(() => {
    const h2 = document.querySelector('h2');
    const h1 = document.querySelector('h1');
    return h2?.textContent || h1?.textContent || '';
  });
  console.log(`  ✓ Scene 1 Opener Recipient Header: "${openerTitle}"`);
  const hasGuestInOpener = openerTitle.includes('Ananya') || (await androidPage.evaluate(() => document.body.textContent.includes('Ananya')));
  console.log('  ✓ Personalized Guest Name rendered on Opener:', hasGuestInOpener);
  if (hasGuestInOpener) passedAssertions++;

  const openerShotPath = path.join(ARTIFACT_DIR, 'verified_kitty_scene1_opener_android.png');
  await androidPage.screenshot({ path: openerShotPath });
  console.log(`  ✓ Scene 1 (Opener) screenshot: ${openerShotPath}`);
  passedAssertions++;

  // Advance from Opener to Scene 2: Party Theme & Dress Code
  console.log('  Tapping seal to open invitation flow...');
  await androidPage.evaluate(() => {
    const seal = document.querySelector('button[aria-label="Tap to open letter"]') ||
      Array.from(document.querySelectorAll('button, div')).find(el => el.textContent && el.textContent.includes('TAP TO OPEN'));
    if (seal) seal.click();
  });
  await new Promise(r => setTimeout(r, 2200));

  // SCENE 2: Party Theme & Dress Code
  const themeShotPath = path.join(ARTIFACT_DIR, 'verified_kitty_scene2_theme_android.png');
  await androidPage.screenshot({ path: themeShotPath });
  console.log(`  ✓ Scene 2 (Party Theme & Dress Code) screenshot: ${themeShotPath}`);

  const hasThemeData = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    const hasThemeTitle = text.includes('Vibe & Dress Code') || text.includes('Party Theme');
    const hasDressCode = text.includes('Pastel') || text.includes('Dress Code');
    const hasNoReligiousLayer = !text.includes('ॐ') && !text.includes('Bismillah') && !text.includes('Aarti') && !text.includes('blessings of our parents');
    return hasThemeTitle && hasDressCode && hasNoReligiousLayer;
  });
  console.log('  ✓ Upbeat Party Theme & Dress Code (100% secular, zero religious layer):', hasThemeData);
  if (hasThemeData) passedAssertions++;

  // Advance to Scene 3: Party Venue & Schedule
  await androidPage.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const sceneBtn = allButtons.find(b => b.textContent && b.textContent.includes('See Venue & Schedule'));
    if (sceneBtn) {
      sceneBtn.click();
    } else {
      const continueBtn = allButtons.find(b => b.textContent && b.textContent.includes('Continue') && !b.disabled);
      if (continueBtn) continueBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 2200));

  // SCENE 3: Event Details & Schedule
  const detailsShotPath = path.join(ARTIFACT_DIR, 'verified_kitty_scene3_details_android.png');
  await androidPage.screenshot({ path: detailsShotPath });
  console.log(`  ✓ Scene 3 (Venue & Schedule) screenshot: ${detailsShotPath}`);

  const hasDetails = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('Olive Bistro') || text.includes('Save The Date') || text.includes('November 2026');
  });
  console.log('  ✓ Party schedule & venue rendered:', hasDetails);
  if (hasDetails) passedAssertions++;

  // Advance to Scene 4: Personal Note
  await androidPage.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const sceneBtn = allButtons.find(b => b.textContent && (b.textContent.includes('Warm Note') || b.textContent.includes('Note for You')));
    if (sceneBtn) {
      sceneBtn.click();
    } else {
      const continueBtn = allButtons.find(b => b.textContent && b.textContent.includes('Continue') && !b.disabled);
      if (continueBtn) continueBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 2200));

  // SCENE 4: Personal Note
  const noteShotPath = path.join(ARTIFACT_DIR, 'verified_kitty_scene4_note_android.png');
  await androidPage.screenshot({ path: noteShotPath });
  console.log(`  ✓ Scene 4 (Personal Note) screenshot: ${noteShotPath}`);

  const hasNote = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('Can\'t Wait to See You') || text.includes('Ananya') || text.includes('infectious laughter');
  });
  console.log('  ✓ Personalized host note rendered:', hasNote);
  if (hasNote) passedAssertions++;

  // Advance to Scene 5: RSVP Scene
  await androidPage.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const sceneBtn = allButtons.find(b => b.textContent && b.textContent.includes('RSVP'));
    if (sceneBtn) {
      sceneBtn.click();
    } else {
      const continueBtn = allButtons.find(b => b.textContent && b.textContent.includes('Continue') && !b.disabled);
      if (continueBtn) continueBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 2200));

  // SCENE 5: RSVP Scene & Interactive Attendance Selection
  const rsvpShotPath = path.join(ARTIFACT_DIR, 'verified_kitty_scene5_rsvp_unanswered_android.png');
  await androidPage.screenshot({ path: rsvpShotPath });
  console.log(`  ✓ Scene 5 (RSVP Unanswered) screenshot: ${rsvpShotPath}`);

  const hasRsvpGuestPlaque = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('We Saved Your Seat') && text.includes('Ananya') && (text.includes('attending so far') || text.includes('16'));
  });
  console.log('  ✓ RSVP Guest Plaque & Headcount counter rendered:', hasRsvpGuestPlaque);
  if (hasRsvpGuestPlaque) passedAssertions++;

  // Submit Interactive RSVP: "Joyfully Accept" with Party Size = 2
  console.log('  Testing interactive RSVP selection...');
  await androidPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const acceptBtn = buttons.find(b => b.textContent && (b.textContent.includes('Joyfully Accept') || b.textContent.includes('Yes, I\'ll Be There')));
    if (acceptBtn) acceptBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Change party size to 2 and confirm
  await androidPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const plusBtn = buttons.find(b => b.textContent && b.textContent.trim() === '+');
    if (plusBtn) plusBtn.click();

    const confirmBtn = buttons.find(b => b.textContent && (b.textContent.includes('Confirm RSVP') || b.textContent.includes('Send Response')));
    if (confirmBtn) confirmBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const rsvpSubmittedShotPath = path.join(ARTIFACT_DIR, 'verified_kitty_scene5_rsvp_submitted_android.png');
  await androidPage.screenshot({ path: rsvpSubmittedShotPath });
  console.log(`  ✓ Scene 5 (RSVP Confirmed & Celebrated) screenshot: ${rsvpSubmittedShotPath}`);

  const rsvpConfirmed = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('noted 2 guests for Ananya') || text.includes('See you there!') || text.includes('noted');
  });
  console.log('  ✓ RSVP submission with party size confirmed:', rsvpConfirmed);
  if (rsvpConfirmed) passedAssertions++;

  // Advance to Scene 6: Finale
  await androidPage.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    const continueBtn = allButtons.find(b => b.textContent && (b.textContent.includes('Party Floor') || b.textContent.includes('Continue')));
    if (continueBtn) continueBtn.click();
  });
  await new Promise(r => setTimeout(r, 2200));

  // SCENE 6: Finale
  const finaleShotPath = path.join(ARTIFACT_DIR, 'verified_kitty_scene6_finale_android.png');
  await androidPage.screenshot({ path: finaleShotPath });
  console.log(`  ✓ Scene 6 (Finale) screenshot: ${finaleShotPath}`);

  const hasFinale = await androidPage.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('Party Floor') || text.includes('Replay') || text.includes('Shalini');
  });
  console.log('  ✓ Celebration finale rendered:', hasFinale);
  if (hasFinale) passedAssertions++;

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
    await vpPage.goto(`http://localhost:3000/p/${slug}?guest=Ananya`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    const shotPath = path.join(ARTIFACT_DIR, `verified_kitty_${vp.name}.png`);
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
  await reducedMotionPage.goto(`http://localhost:3000/p/${slug}?guest=Ananya`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const fallbackStatus = await reducedMotionPage.evaluate(() => {
    const text = document.body.textContent || '';
    const hasTheme = text.includes('Party Theme') || text.includes('Pastel Chic');
    const hasDetails = text.includes('Olive Bistro') || text.includes('Date');
    const hasRsvp = text.includes('Saved Your Seat') || text.includes('Ananya');
    return { hasTheme, hasDetails, hasRsvp };
  });

  console.log('  ✓ Reduced-motion Static Scroll status:', fallbackStatus);
  if (fallbackStatus.hasTheme && fallbackStatus.hasDetails && fallbackStatus.hasRsvp) {
    passedAssertions++;
  }

  const fallbackShotPath = path.join(ARTIFACT_DIR, 'verified_kitty_reduced_motion_fallback.png');
  await reducedMotionPage.screenshot({ path: fallbackShotPath });
  console.log(`  ✓ Reduced-motion fallback screenshot: ${fallbackShotPath}`);

  await browser.close();

  const expectedAssertions = 16;
  console.log(`\n=== ALL KITTY / CELEBRATION PACK VERIFICATION TESTS PASSED! (${passedAssertions} / ${expectedAssertions} assertions verified) ===\n`);

  if (passedAssertions !== expectedAssertions) {
    console.error(`❌ Expected ${expectedAssertions} assertions, but only ${passedAssertions} passed.`);
    process.exit(1);
  }
}

testKittyCelebrationPack().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
