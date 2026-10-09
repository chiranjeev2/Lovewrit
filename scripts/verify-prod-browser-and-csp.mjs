import puppeteer from 'puppeteer-core';
import assert from 'assert';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { getBrowserExecutablePath } = require('./browser-config.cjs');

const EDGE_PATH = getBrowserExecutablePath();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function verifyProdBrowserAndCSP() {
  console.log('=== VERIFYING PRODUCTION BUILD: CSP, HEADERS & BROWSER EXECUTION ===\n');

  let passed = 0;
  let total = 0;
  function check(desc, cond) {
    total++;
    assert(Boolean(cond), `[FAILED] ${desc}`);
    passed++;
    console.log(`  [PASS] ${desc}`);
  }

  // ---------------------------------------------------------------------------
  // 1. LIVE HTTP SECURITY HEADERS & CSP AUDIT
  // ---------------------------------------------------------------------------
  console.log('[1/5] Auditing Live Security Headers on Production Server...');
  const res = await fetch(`${BASE_URL}/`);
  check('Production server responds with HTTP 200', res.status === 200);

  const csp = res.headers.get('content-security-policy') || '';
  check('Content-Security-Policy header is present', Boolean(csp));
  check('CSP script-src does NOT contain unsafe-eval in production', !csp.includes('unsafe-eval'));
  check('CSP script-src allows Razorpay checkout script host', csp.includes('https://checkout.razorpay.com'));
  check('CSP frame-src allows Razorpay checkout and API hosts', csp.includes('frame-src') && csp.includes('https://checkout.razorpay.com') && csp.includes('https://api.razorpay.com'));
  check('CSP connect-src allows Razorpay endpoints', csp.includes('connect-src') && csp.includes('https://api.razorpay.com'));
  check('CSP img-src allows Razorpay and image hosts', csp.includes('img-src') && csp.includes('https://checkout.razorpay.com'));
  check('X-Content-Type-Options is nosniff', res.headers.get('x-content-type-options') === 'nosniff');
  check('Strict-Transport-Security is present', Boolean(res.headers.get('strict-transport-security')));
  check('Referrer-Policy is strict-origin-when-cross-origin', res.headers.get('referrer-policy') === 'strict-origin-when-cross-origin');
  check('X-Frame-Options is SAMEORIGIN', res.headers.get('x-frame-options') === 'SAMEORIGIN');
  check('Permissions-Policy is present', Boolean(res.headers.get('permissions-policy')));

  // ---------------------------------------------------------------------------
  // 2. BROWSER SETUP WITH CSP VIOLATION AND CONSOLE ERROR TRAPPING
  // ---------------------------------------------------------------------------
  console.log('\n[2/5] Launching Browser with Active CSP & Console Error Trap...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const allCSPViolations = [];
  const allConsoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore non-fatal favicon or expected 404 network response logs
      if (!text.includes('favicon.ico') && !text.includes('status of 404')) {
        allConsoleErrors.push({ url: page.url(), text });
      }
    }
  });

  await page.evaluateOnNewDocument(() => {
    window.__cspViolations = [];
    window.addEventListener('securitypolicyviolation', (e) => {
      window.__cspViolations.push({
        blockedURI: e.blockedURI,
        violatedDirective: e.violatedDirective,
        effectiveDirective: e.effectiveDirective,
        originalPolicy: e.originalPolicy,
      });
    });
  });

  async function collectPageCSPViolations() {
    const pageViolations = await page.evaluate(() => window.__cspViolations || []);
    if (pageViolations && pageViolations.length > 0) {
      allCSPViolations.push(...pageViolations);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. ERROR & EMPTY STATES UNDER PRODUCTION SERVER
  // ---------------------------------------------------------------------------
  console.log('\n[3/5] Testing 404 / Error State in Production Browser...');
  await page.setViewport({ width: 375, height: 667 });
  await page.goto(`${BASE_URL}/non-existent-slug-verification-999`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('main', { timeout: 5000 });
  const notFoundText = await page.evaluate(() => document.body.textContent || '');
  check('Custom 404 page renders calmly with 404 identifier', notFoundText.includes('404') && notFoundText.includes('Not Found'));
  check('Custom 404 page renders return button', notFoundText.includes('Return to Homepage'));
  await collectPageCSPViolations();

  // ---------------------------------------------------------------------------
  // 4. STUDIO CUSTOMIZER 375px FLOW UNDER PRODUCTION SERVER
  // ---------------------------------------------------------------------------
  console.log('\n[4/5] Testing Studio Customizer 375px Flow in Production Browser...');
  await page.goto(`${BASE_URL}/create/festive-birthday`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('main', { timeout: 8000 });

  const customizerText = await page.evaluate(() => document.body.textContent || '');
  check('Studio customizer loads on production build', customizerText.includes('Birthday') || customizerText.includes('Festive'));

  // Test mobile tab toggle to Live Preview
  const tabSwitched = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const previewBtn = btns.find(b => b.textContent && b.textContent.includes('Preview') && !b.textContent.includes('VIP'));
    if (previewBtn) {
      previewBtn.click();
      return true;
    }
    return false;
  });
  check('Mobile tab switch to live preview is responsive', tabSwitched);
  await new Promise(r => setTimeout(r, 500));
  await collectPageCSPViolations();

  // ---------------------------------------------------------------------------
  // 5. SCENE ENGINE & LAYOUT VIEWPORT AUDIT UNDER PRODUCTION SERVER
  // ---------------------------------------------------------------------------
  console.log('\n[5/5] Auditing Viewports (375px, 768px, 1440px) and Scene Engine in Production Browser...');
  const viewports = [
    { name: '375_Mobile', width: 375, height: 667 },
    { name: '768_Tablet', width: 768, height: 1024 },
    { name: '1440_Desktop', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(`${BASE_URL}/create/sacred-tribute`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('main', { timeout: 8000 });

    const overflowCheck = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth + 2;
    });
    check(`No horizontal overflow on sacred-tribute at ${vp.name}`, overflowCheck);
    await collectPageCSPViolations();
  }

  await browser.close();

  // ---------------------------------------------------------------------------
  // FINAL VIOLATION & CONSOLE AUDIT VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n--- CSP VIOLATIONS & CONSOLE ERRORS SUMMARY ---');
  console.log(`Total CSP Violations Detected: ${allCSPViolations.length}`);
  if (allCSPViolations.length > 0) {
    console.error('CSP Violations:', JSON.stringify(allCSPViolations, null, 2));
  }
  check('Zero CSP securitypolicyviolation events observed in production browser', allCSPViolations.length === 0);

  console.log(`Total Console Errors Detected: ${allConsoleErrors.length}`);
  if (allConsoleErrors.length > 0) {
    console.error('Console Errors:', JSON.stringify(allConsoleErrors, null, 2));
  }
  check('Zero fatal console errors observed in production browser', allConsoleErrors.length === 0);

  console.log(`\nPRODUCTION CSP & BROWSER VERIFICATION COMPLETE: ${passed} / ${total} assertions green across live build.`);
}

verifyProdBrowserAndCSP().catch((err) => {
  console.error('\nProduction CSP verification failed:', err);
  process.exit(1);
});
