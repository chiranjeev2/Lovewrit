import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:3000';
const QA_SCREENSHOTS_DIR = path.resolve('qa-screenshots');

if (!fs.existsSync(QA_SCREENSHOTS_DIR)) {
  fs.mkdirSync(QA_SCREENSHOTS_DIR, { recursive: true });
}

const OCCASIONS = [
  { id: 'apology', name: 'Apology', templateId: 'sincere-apology', occasion: 'apology', letter: 'I am truly sorry. Please forgive me.' },
  { id: 'proposal', name: 'Proposal', templateId: 'forever-proposal', occasion: 'proposal', letter: 'You are my once-in-a-lifetime.' },
  { id: 'romantic', name: 'Romantic', templateId: 'golden-anniversary', occasion: 'anniversary', letter: 'Every single day with you is a celebration of love.' },
  { id: 'wedding', name: 'Royal Wedding', templateId: 'royal-monogram-invite', occasion: 'wedding_invite', letter: 'Join us as we unite in holy matrimony.' },
  { id: 'birthday', name: 'Birthday', templateId: 'golden-celebration', occasion: 'birthday', letter: 'Wishing you a magnificent birthday filled with joy.' },
  { id: 'godhbharai', name: 'Godhbharai', templateId: 'auspicious-godhbharai', occasion: 'godhbharai', letter: 'Shower the mother and arriving child with divine blessings.' },
  { id: 'tribute', name: 'Sacred Tribute', templateId: 'sacred-tribute-memorial', occasion: 'memorial', letter: 'In loving memory of a life lived with honor and kindness.' },
  { id: 'kitty', name: 'Kitty Party', templateId: 'chic-kitty-party', occasion: 'kitty_party', letter: 'Get ready for an afternoon of glamour, laughter, and high tea!' },
  { id: 'devotional', name: 'Devotional', templateId: 'jagrata-kirtan-invitation', occasion: 'general_devotional', letter: 'Sadar Nimantran for devotional satsang and kirtan.' },
];

const VIEWPORTS = [
  { width: 375, height: 812, name: '375_Mobile', isMobile: true },
  { width: 768, height: 1024, name: '768_Tablet', isMobile: false },
  { width: 1024, height: 768, name: '1024_Laptop', isMobile: false },
  { width: 1440, height: 900, name: '1440_Desktop', isMobile: false },
];

export async function runLayoutAndA11yAudit() {
  console.log('================================================================');
  console.log('  📐 COMPREHENSIVE LAYOUT & ACCESSIBILITY AUDIT (8 OCCASIONS)  ');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

  // 1. Create Published Pages & Card Pages for each occasion
  console.log('Creating test orders for all 8 occasions via API...');
  const testEntities = [];

  for (const occ of OCCASIONS) {
    // Published Scene Page
    const pageRes = await page.evaluate(async (data) => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'PAGE',
          templateId: data.templateId,
          tier: 'SELF_SERVICE',
          customerName: `QA ${data.name}`,
          customerEmail: `qa.${data.id}@example.com`,
          masterKey: 'memoir_master_founder_secret_2026',
          pageData: {
            senderName: 'QA Sender',
            recipientName: 'QA Recipient',
            occasion: data.occasion,
            letter: data.letter,
            colorTheme: 'rose',
          }
        })
      });
      return res.json();
    }, occ);

    // Card Experience Page
    const cardRes = await page.evaluate(async (data) => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'CARD',
          templateId: data.templateId,
          tier: 'SELF_SERVICE',
          customerName: `QA Card ${data.name}`,
          customerEmail: `qa.card.${data.id}@example.com`,
          masterKey: 'memoir_master_founder_secret_2026',
          cardData: {
            senderName: 'QA Sender',
            recipientName: 'QA Recipient',
            occasion: data.occasion,
            message: data.letter,
            colorTheme: 'rose',
          }
        })
      });
      return res.json();
    }, occ);

    testEntities.push({
      ...occ,
      pageSlug: pageRes.slug,
      cardSlug: cardRes.slug,
    });
    console.log(`  ✓ Created [${occ.name}] Page: /p/${pageRes.slug} | Card: /c/${cardRes.slug}`);
  }

  // 2. Build list of all routes to audit
  const routesToAudit = [];

  // A. All Studio Customizers
  for (const entity of testEntities) {
    routesToAudit.push({
      category: 'Customizer',
      occasion: entity.name,
      occasionId: entity.id,
      url: `${BASE_URL}/create/${entity.templateId}`,
    });
  }

  // B. All Published Scene Pages
  for (const entity of testEntities) {
    routesToAudit.push({
      category: 'Published Page',
      occasion: entity.name,
      occasionId: entity.id,
      url: `${BASE_URL}/p/${entity.pageSlug}`,
    });
  }

  // C. All Card Pages
  for (const entity of testEntities) {
    routesToAudit.push({
      category: 'Card Page',
      occasion: entity.name,
      occasionId: entity.id,
      url: `${BASE_URL}/c/${entity.cardSlug}`,
    });
  }

  console.log(`\nAuditing ${routesToAudit.length} routes across ${VIEWPORTS.length} viewports (Total: ${routesToAudit.length * VIEWPORTS.length} checks)...\n`);

  const auditResults = [];
  let totalAudits = 0;
  let passedAudits = 0;
  let failedAudits = 0;

  for (let idx = 0; idx < routesToAudit.length; idx++) {
    const route = routesToAudit[idx];
    console.log(`[${idx + 1}/${routesToAudit.length}] Auditing ${route.category} - ${route.occasion}...`);

    // Load initial page at standard mobile width
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto(route.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise(r => setTimeout(r, 600));

    for (const vp of VIEWPORTS) {
      totalAudits++;
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.isMobile });
      await new Promise(r => setTimeout(r, 200));

      // Regenerate qa-screenshots for Card Pages across all viewports
      if (route.category === 'Card Page' && route.occasionId) {
        const shotPrefix = route.occasionId === 'devotional' ? 'religious' : route.occasionId;
        const shotVpName = vp.width === 375 ? '375_mobile' : vp.width === 768 ? '768_tablet' : vp.width === 1024 ? '1024_laptop' : '1440_desktop';
        const shotName = `${shotPrefix}_${shotVpName}.png`;
        const shotPath = path.join(QA_SCREENSHOTS_DIR, shotName);
        await page.screenshot({ path: shotPath });
      }

      const res = await page.evaluate((isMobile) => {
        const winW = window.innerWidth;
        const scrollW = document.documentElement.scrollWidth;

        // 1. Horizontal Overflow check (document scrollWidth)
        const hasOverflow = scrollW > winW + 2;

        // 2. Element boundary check: check every element's getBoundingClientRect (right edge <= viewport width)
        const allElements = Array.from(document.querySelectorAll('*'));
        let overflowingElements = 0;
        let worstOverflowRight = 0;
        let worstOverflowTag = '';
        for (const el of allElements) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && el.offsetParent !== null) {
            if (rect.right > winW + 2) {
              overflowingElements++;
              if (rect.right > worstOverflowRight) {
                worstOverflowRight = rect.right;
                worstOverflowTag = `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.toString().split(' ')[0] : ''}`;
              }
            }
          }
        }

        // 3. Clipped interactive/content elements check
        const visibleEls = Array.from(document.querySelectorAll('button, a, input, h1, h2, h3, h4, p, label'));
        let clipped = 0;
        for (const el of visibleEls) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && el.offsetParent !== null) {
            if (rect.left < -4 || rect.right > winW + 4) {
              clipped++;
            }
          }
        }

        // 4. Mobile tap targets check (at 375px only)
        // Exempt standard inline links inside paragraphs per WCAG 2.5.8
        let smallTapTargets = 0;
        if (isMobile) {
          const interactives = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'));
          for (const el of interactives) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && el.offsetParent !== null) {
              // WCAG 2.5.8 touch target >= 44x44
              if (rect.width < 44 || rect.height < 44) {
                smallTapTargets++;
              }
            }
          }
        }

        return {
          scrollW,
          winW,
          hasOverflow,
          overflowingElements,
          worstOverflowRight,
          worstOverflowTag,
          clipped,
          smallTapTargets,
          passed: !hasOverflow && overflowingElements === 0 && clipped === 0 && smallTapTargets === 0
        };
      }, vp.isMobile);

      const record = {
        category: route.category,
        occasion: route.occasion,
        viewport: vp.name,
        overflow: res.hasOverflow ? `FAIL (${res.scrollW}px)` : 'PASS',
        elementBoundary: res.overflowingElements > 0 ? `FAIL (${res.overflowingElements} els, ${Math.round(res.worstOverflowRight)}px)` : 'PASS',
        clipped: res.clipped > 0 ? `FAIL (${res.clipped})` : 'PASS',
        tapTargets: res.smallTapTargets > 0 ? `FAIL (${res.smallTapTargets})` : 'PASS',
        status: res.passed ? 'PASSED' : 'FAILED'
      };

      auditResults.push(record);
      if (res.passed) {
        passedAudits++;
      } else {
        failedAudits++;
        console.error(`  ❌ FAIL: [${route.category}] ${route.occasion} at ${vp.name}: ScrollOverflow=${record.overflow}, ElementBoundary=${record.elementBoundary}, Clipped=${record.clipped}, TapTargets=${record.tapTargets}`);
      }
    }
  }

  await browser.close();

  console.log('\n================================================================');
  console.log('            📊 LAYOUT & ACCESSIBILITY AUDIT SUMMARY              ');
  console.log('================================================================');
  console.log(`Total Checks Executed : ${totalAudits}`);
  console.log(`Passed Checks         : ${passedAudits}`);
  console.log(`Failed Checks         : ${failedAudits}`);
  console.log(`Pass Rate             : ${((passedAudits / totalAudits) * 100).toFixed(1)}%`);
  console.log('================================================================\n');

  if (failedAudits > 0) {
    console.error(`❌ Layout & Accessibility Audit FAILED with ${failedAudits} failures.`);
    process.exit(1);
  }

  console.log(`🎉 ALL ${passedAudits} / ${totalAudits} LAYOUT & ACCESSIBILITY AUDIT CHECKS PASSED GREEN!\n`);
  return { totalAudits, passedAudits, failedAudits };
}

// If executed directly
if (process.argv[1]?.endsWith('verify-viewport-layout-and-accessibility.mjs')) {
  runLayoutAndA11yAudit().catch(err => {
    console.error('Fatal audit error:', err);
    process.exit(1);
  });
}
