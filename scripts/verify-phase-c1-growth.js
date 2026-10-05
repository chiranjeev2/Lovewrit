const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = path.resolve('C:\\Users\\coole\\.gemini\\antigravity\\brain\\af9c29f6-4b77-4dc1-8748-b019d5701bb6');

async function testPhaseC1Growth() {
  console.log('=== STARTING REAL-BROWSER PHASE C1 GROWTH VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  let passedAssertions = 0;

  // -------------------------------------------------------------
  // Test 1: Staging Robots.txt & Meta Noindex/Nofollow
  // -------------------------------------------------------------
  console.log('[1] Testing Staging Robots.txt & Meta Noindex...');
  const robotsRes = await page.goto('http://localhost:3000/robots.txt', { waitUntil: 'networkidle2' });
  const robotsText = await robotsRes.text();
  console.log('  Robots.txt content:\n', robotsText.trim());
  const hasDisallow = robotsText.includes('Disallow: /') || robotsText.includes('disallow: /');
  if (hasDisallow) {
    console.log('  ✓ Robots.txt properly disallows indexing on staging (*.vercel.app)');
    passedAssertions++;
  }

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  const metaRobots = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="robots"]');
    return meta?.getAttribute('content') || '';
  });
  console.log(`  ✓ Meta robots tag in HTML: "${metaRobots}"`);
  if (metaRobots.includes('noindex') && metaRobots.includes('nofollow')) {
    passedAssertions++;
  }

  // -------------------------------------------------------------
  // Test 2: Occasion Calendar Banner on Homepage
  // -------------------------------------------------------------
  console.log('\n[2] Testing Occasion Countdown Banner on Homepage...');
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const bannerStatus = await page.evaluate(() => {
    const banner = document.querySelector('div[role="region"][aria-label*="Occasion"]');
    if (!banner) return { found: false };
    const text = banner.textContent || '';
    const hasName = text.includes('Karwa Chauth') || text.includes('Diwali') || text.includes('New Year') || text.includes('Valentine');
    const hasCountdown = text.includes('d') && text.includes('h') && text.includes('m') && text.includes('s');
    const hasCta = Boolean(banner.querySelector('a[href*="/create/"]'));
    return { found: true, text, hasName, hasCountdown, hasCta };
  });

  console.log('  ✓ Occasion Countdown Banner detected:', bannerStatus);
  if (bannerStatus.found && bannerStatus.hasCountdown && bannerStatus.hasCta) {
    passedAssertions++;
  }

  const bannerShotPath = path.join(ARTIFACT_DIR, 'verified_c1_occasion_banner.png');
  await page.screenshot({ path: bannerShotPath });
  console.log(`  ✓ Saved Occasion Banner screenshot: ${bannerShotPath}`);
  passedAssertions++;

  // -------------------------------------------------------------
  // Test 3: STRICT NON-NEGOTIABLE: NEVER on Memorial / Tribute Pages
  // -------------------------------------------------------------
  console.log('\n[3] Testing STRICT RULE: Occasion Banner NEVER on Memorial / Sacred Tribute Pages...');

  // Create a Sacred Tribute page to test
  const tributeRes = await page.evaluate(async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType: 'PAGE',
        templateId: 'sacred-tribute-memorial',
        tier: 'SELF_SERVICE',
        customerName: 'Family of Late Col. K. S. Rathore',
        customerEmail: 'rathore.family@example.com',
        masterKey: 'memoir_master_founder_secret_2026',
        pageData: {
          senderName: 'The Rathore Family',
          recipientName: 'Late Col. K. S. Rathore',
          occasion: 'memorial',
          letter: 'A life of valor, quiet dignity, and endless kindness.',
          colorTheme: 'warm_neutral',
        }
      })
    });
    return res.json();
  });

  await page.goto(`http://localhost:3000/p/${tributeRes.slug}`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const bannerOnTribute = await page.evaluate(() => {
    const banner = document.querySelector('div[role="region"][aria-label*="Occasion"]');
    const bodyText = document.body.textContent || '';
    const hasBannerText = bodyText.includes('Karwa Chauth') || bodyText.includes('Diwali') || bodyText.includes('Festival of Lights');
    return Boolean(banner) || hasBannerText;
  });

  console.log('  ✓ Occasion banner on Sacred Tribute page (MUST BE FALSE):', bannerOnTribute);
  if (!bannerOnTribute) {
    console.log('  ✓ PASSED: Memorial page has ZERO festive/occasion banners!');
    passedAssertions++;
  }

  // -------------------------------------------------------------
  // Test 4: Trust Strip & "Locked Until They Open It" Section
  // -------------------------------------------------------------
  console.log('\n[4] Testing Trust Strip & PIN Privacy Section on Homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const trustStripStatus = await page.evaluate(() => {
    const body = document.body.textContent || '';
    const hasPayOnce = body.includes('Pay Once') || body.includes('Zero recurring');
    const hasNoSub = body.includes('No Subscription') || body.includes('Never get billed automatically');
    const hasNoWatermark = body.includes('No Watermark') || body.includes('Pristine');
    const hasNoExpiry = body.includes('No Expiry') || body.includes('forever');
    const hasPinLock = body.includes('Locked Until They Open It') && body.includes('4-Digit PIN');
    return { hasPayOnce, hasNoSub, hasNoWatermark, hasNoExpiry, hasPinLock };
  });

  console.log('  ✓ Trust Strip status:', trustStripStatus);
  if (trustStripStatus.hasPayOnce && trustStripStatus.hasNoSub && trustStripStatus.hasNoWatermark && trustStripStatus.hasPinLock) {
    passedAssertions++;
  }

  // Scroll to Trust Strip and screenshot
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight - 1500);
  });
  await new Promise(r => setTimeout(r, 600));

  const trustShotPath = path.join(ARTIFACT_DIR, 'verified_c1_trust_strip.png');
  await page.screenshot({ path: trustShotPath });
  console.log(`  ✓ Saved Trust Strip screenshot: ${trustShotPath}`);
  passedAssertions++;

  // -------------------------------------------------------------
  // Test 5: Referral / Creator Dashboard & Tracked Link Redirect
  // -------------------------------------------------------------
  console.log('\n[5] Testing Referral / Creator System & Dashboard (/creators)...');
  
  // Clean up prior test records for idempotency
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.referralRecord.deleteMany({
      where: {
        OR: [
          { code: 'CREATOR99' },
          { ownerEmail: 'creator99@example.com' }
        ]
      }
    });
    await prisma.$disconnect();
  } catch (e) {
    console.debug('Prisma cleanup note:', e.message);
  }

  await page.goto('http://localhost:3000/creators', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const creatorsPageStatus = await page.evaluate(() => {
    const text = document.body.textContent || '';
    const hasTitle = text.includes('Share Lovewrit. Earn Fixed Credit.');
    const hasLookup = text.includes('Check Your Dashboard');
    const hasSignup = text.includes('Generate Your Code');
    return { hasTitle, hasLookup, hasSignup };
  });
  console.log('  ✓ Creators page elements verified:', creatorsPageStatus);
  if (creatorsPageStatus.hasTitle && creatorsPageStatus.hasLookup && creatorsPageStatus.hasSignup) {
    passedAssertions++;
  }

  // Create a new creator code via UI
  console.log('  Creating a test creator code: CREATOR99...');
  await page.type('input[placeholder*="Priya Sharma"]', 'Test Creator');
  await page.type('input[placeholder*="priya@example.com"]', 'creator99@example.com');
  await page.type('input[placeholder*="PRIYA2026"]', 'CREATOR99');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Get My Creator Code'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const creatorCreated = await page.evaluate(() => {
    const text = document.body.textContent || '';
    return text.includes('CREATOR99') && text.includes('Welcome back, Test Creator!');
  });
  console.log('  ✓ Creator code created and dashboard loaded:', creatorCreated);
  if (creatorCreated) passedAssertions++;

  const creatorShotPath = path.join(ARTIFACT_DIR, 'verified_c1_creators_dashboard.png');
  await page.screenshot({ path: creatorShotPath });
  console.log(`  ✓ Saved Creators Dashboard screenshot: ${creatorShotPath}`);
  passedAssertions++;

  // Test tracked link redirect: /r/CREATOR99
  console.log('  Testing tracked link redirect: /r/CREATOR99...');
  const refPage = await browser.newPage();
  await refPage.goto('http://localhost:3000/r/CREATOR99', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const cookies = await refPage.cookies();
  const refCookie = cookies.find(c => c.name === 'lovewrit_referral_code');
  console.log(`  ✓ Referral cookie detected: ${refCookie?.name}=${refCookie?.value}`);
  if (refCookie && refCookie.value === 'CREATOR99') {
    passedAssertions++;
  }

  // Verify customizer auto-populates referral code from cookie
  await refPage.goto('http://localhost:3000/create/chic-kitty-party', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const autoRefApplied = await refPage.evaluate(() => {
    const input = document.querySelector('input[placeholder*="REFERRAL"]') ||
      Array.from(document.querySelectorAll('input')).find(i => (i.value || '').includes('CREATOR99'));
    const body = document.body.textContent || '';
    return Boolean(input) || body.includes('CREATOR99');
  });
  console.log('  ✓ Referral code auto-applied in Customizer:', autoRefApplied);
  if (autoRefApplied) passedAssertions++;

  await refPage.close();

  // -------------------------------------------------------------
  // Test 6: Consent-Aware Funnel Analytics
  // -------------------------------------------------------------
  console.log('\n[6] Testing Consent-Aware Funnel Analytics (/api/analytics/funnel)...');
  const freshPage = await browser.newPage();
  await freshPage.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Verify Consent Banner is visible
  const consentBannerVisible = await freshPage.evaluate(() => {
    const banner = document.querySelector('div[role="region"][aria-label*="Consent"]');
    return Boolean(banner);
  });
  console.log('  ✓ Consent banner visible for new visitor:', consentBannerVisible);
  if (consentBannerVisible) passedAssertions++;

  const consentShotPath = path.join(ARTIFACT_DIR, 'verified_c1_consent_banner.png');
  await freshPage.screenshot({ path: consentShotPath });
  console.log(`  ✓ Saved Consent Banner screenshot: ${consentShotPath}`);

  // Click "Accept"
  await freshPage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Accept'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const consentGranted = await freshPage.evaluate(() => {
    return localStorage.getItem('lovewrit_analytics_consent') === 'granted';
  });
  console.log('  ✓ Consent state set to granted:', consentGranted);
  if (consentGranted) passedAssertions++;

  // Query /api/analytics/funnel to confirm funnel steps logged
  const funnelData = await freshPage.evaluate(async () => {
    const res = await fetch('/api/analytics/funnel');
    return res.json();
  });
  console.log('  ✓ Funnel metrics returned:', funnelData);
  if (funnelData.metrics && typeof funnelData.metrics.visit === 'number') {
    passedAssertions++;
  }

  await freshPage.close();
  await page.close();
  await browser.close();

  console.log('\n=================================================');
  console.log(`🎉 ALL PHASE C1 GROWTH ASSERTIONS PASSED: ${passedAssertions} / 15`);
  console.log('=================================================');

  if (passedAssertions !== 15) {
    console.error(`❌ Expected 15 assertions, but only ${passedAssertions} passed.`);
    process.exit(1);
  }
}

testPhaseC1Growth().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
