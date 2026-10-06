import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { TEMPLATES } from '../src/lib/templates-data.ts';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:3000';
const QA_SCREENSHOTS_DIR = path.resolve('qa-screenshots');

if (!fs.existsSync(QA_SCREENSHOTS_DIR)) {
  fs.mkdirSync(QA_SCREENSHOTS_DIR, { recursive: true });
}

const VIEWPORTS = [
  { width: 375, height: 812, name: '375_Mobile', isMobile: true },
  { width: 768, height: 1024, name: '768_Tablet', isMobile: false },
  { width: 1024, height: 768, name: '1024_Laptop', isMobile: false },
  { width: 1440, height: 900, name: '1440_Desktop', isMobile: false },
];

export async function runLayoutAndA11yAudit() {
  console.log('================================================================');
  console.log('  📐 COMPREHENSIVE LAYOUT & ACCESSIBILITY AUDIT (ALL TEMPLATES) ');
  console.log('================================================================\n');

  if (!Array.isArray(TEMPLATES) || TEMPLATES.length === 0) {
    console.error('Fatal: TEMPLATES is empty or invalid.');
    process.exit(1);
  }

  // Print Table of occasion -> template id -> formats
  console.log('--- REPO TEMPLATE MATRIX ---');
  console.table(
    TEMPLATES.map(t => ({
      occasion: t.occasion,
      templateId: t.id,
      name: t.name,
      formats: t.supportedFormats.join(', ')
    }))
  );

  // Assert uniqueness of template IDs in TEMPLATES
  const seenTemplateIds = new Set();
  for (const t of TEMPLATES) {
    if (seenTemplateIds.has(t.id)) {
      console.error(`Fatal: Duplicate template ID detected in TEMPLATES: ${t.id}`);
      process.exit(1);
    }
    seenTemplateIds.add(t.id);
  }

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

  // 1. Seed demo orders for all templates via API
  console.log(`Seeding demo orders for all ${TEMPLATES.length} templates via API...`);
  const testEntities = [];

  for (const t of TEMPLATES) {
    const pageRes = await page.evaluate(async (data) => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'PAGE',
          templateId: data.id,
          tier: 'SELF_SERVICE',
          customerName: `QA ${data.name}`,
          customerEmail: `qa.${data.id}@example.com`,
          masterKey: 'memoir_master_founder_secret_2026',
          pageData: {
            senderName: data.sampleSender || 'QA Sender',
            recipientName: data.sampleRecipient || 'QA Recipient',
            occasion: data.occasion,
            letter: data.sampleMessage || 'A heartfelt message of joy and celebration.',
            colorTheme: data.defaultTheme || 'rose',
          }
        })
      });
      return res.json();
    }, t);

    const cardRes = await page.evaluate(async (data) => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'CARD',
          templateId: data.id,
          tier: 'SELF_SERVICE',
          customerName: `QA Card ${data.name}`,
          customerEmail: `qa.card.${data.id}@example.com`,
          masterKey: 'memoir_master_founder_secret_2026',
          cardData: {
            senderName: data.sampleSender || 'QA Sender',
            recipientName: data.sampleRecipient || 'QA Recipient',
            occasion: data.occasion,
            message: data.sampleMessage || 'A heartfelt message of joy and celebration.',
            colorTheme: data.defaultTheme || 'rose',
          }
        })
      });
      return res.json();
    }, t);

    testEntities.push({
      ...t,
      pageSlug: pageRes.slug,
      cardSlug: cardRes.slug,
    });
    console.log(`  ✓ Seeded [${t.id}] Page: /p/${pageRes.slug} | Card: /c/${cardRes.slug}`);
  }

  // 2. Build list of all routes to audit
  const routesToAudit = [];

  // A. All Studio Customizers
  for (const entity of testEntities) {
    routesToAudit.push({
      category: 'Customizer',
      occasion: entity.name,
      templateId: entity.id,
      expectedOccasion: entity.occasion,
      url: `${BASE_URL}/create/${entity.id}`,
    });
  }

  // B. All Published Scene Pages
  for (const entity of testEntities) {
    routesToAudit.push({
      category: 'Published Page',
      occasion: entity.name,
      templateId: entity.id,
      expectedOccasion: entity.occasion,
      url: `${BASE_URL}/p/${entity.pageSlug}`,
    });
  }

  // C. All Card Pages
  for (const entity of testEntities) {
    routesToAudit.push({
      category: 'Card Page',
      occasion: entity.name,
      templateId: entity.id,
      expectedOccasion: entity.occasion,
      url: `${BASE_URL}/c/${entity.cardSlug}`,
    });
  }

  // Track unique template resolution per category to prevent duplicate resolution
  const resolvedTemplatesByCategory = {
    'Customizer': new Set(),
    'Published Page': new Set(),
    'Card Page': new Set(),
  };

  const auditResults = [];
  let totalAudits = 0;
  let passedAudits = 0;
  let failedAudits = 0;

  for (let rIdx = 0; rIdx < routesToAudit.length; rIdx++) {
    const route = routesToAudit[rIdx];
    console.log(`\n[${rIdx + 1}/${routesToAudit.length}] Auditing ${route.category} - ${route.occasion} (${route.templateId})...`);

    await page.goto(route.url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 400));

    // Assert that the loaded page's template id AND occasion match requested row
    const loadedMeta = await page.evaluate(() => {
      const el = document.querySelector('[data-template-id]');
      return {
        templateId: el ? el.getAttribute('data-template-id') : null,
        occasion: el ? el.getAttribute('data-occasion') : null,
      };
    });

    const metaMatches = loadedMeta.templateId === route.templateId && loadedMeta.occasion === route.expectedOccasion;
    if (!metaMatches) {
      console.error(`  ❌ Mismatch for ${route.url}: loaded ID="${loadedMeta.templateId}", Occasion="${loadedMeta.occasion}" (expected "${route.templateId}" / "${route.expectedOccasion}")`);
    }

    if (resolvedTemplatesByCategory[route.category].has(loadedMeta.templateId)) {
      console.error(`  ❌ Duplicate template resolution in category "${route.category}": ${loadedMeta.templateId}`);
    }
    if (loadedMeta.templateId) {
      resolvedTemplatesByCategory[route.category].add(loadedMeta.templateId);
    }

    for (const vp of VIEWPORTS) {
      totalAudits++;
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.isMobile });
      await new Promise(r => setTimeout(r, 200));

      // Regenerate qa-screenshots for Card Pages across all viewports
      if (route.category === 'Card Page') {
        const shotVpName = vp.width === 375 ? '375_mobile' : vp.width === 768 ? '768_tablet' : vp.width === 1024 ? '1024_laptop' : '1440_desktop';
        const shotName = `${route.templateId}_${shotVpName}.png`;
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
        let smallTapTargets = 0;
        if (isMobile) {
          const interactives = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'));
          for (const el of interactives) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && el.offsetParent !== null) {
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

      const checkPassed = metaMatches && res.passed;

      const record = {
        category: route.category,
        occasion: route.occasion,
        templateId: route.templateId,
        viewport: vp.name,
        metaMatch: metaMatches ? 'PASS' : 'FAIL',
        overflow: res.hasOverflow ? `FAIL (${res.scrollW}px)` : 'PASS',
        elementBoundary: res.overflowingElements > 0 ? `FAIL (${res.overflowingElements} els, ${Math.round(res.worstOverflowRight)}px)` : 'PASS',
        clipped: res.clipped > 0 ? `FAIL (${res.clipped})` : 'PASS',
        tapTargets: res.smallTapTargets > 0 ? `FAIL (${res.smallTapTargets})` : 'PASS',
        status: checkPassed ? 'PASSED' : 'FAILED'
      };

      auditResults.push(record);
      if (checkPassed) {
        passedAudits++;
      } else {
        failedAudits++;
        console.error(`  ❌ FAIL: [${route.category}] ${route.occasion} at ${vp.name}: Meta=${record.metaMatch}, ScrollOverflow=${record.overflow}, ElementBoundary=${record.elementBoundary}, Clipped=${record.clipped}, TapTargets=${record.tapTargets}`);
      }
    }
  }

  await browser.close();

  // Validate coverage across all 3 categories
  let coverageFailed = false;
  for (const cat of ['Customizer', 'Published Page', 'Card Page']) {
    if (resolvedTemplatesByCategory[cat].size !== TEMPLATES.length) {
      console.error(`  ❌ Incomplete coverage for category "${cat}": resolved ${resolvedTemplatesByCategory[cat].size} of ${TEMPLATES.length} templates.`);
      coverageFailed = true;
    }
  }

  console.log('\n================================================================');
  console.log('            📊 LAYOUT & ACCESSIBILITY AUDIT SUMMARY              ');
  console.log('================================================================');
  console.log(`Total Checks Executed : ${totalAudits}`);
  console.log(`Passed Checks         : ${passedAudits}`);
  console.log(`Failed Checks         : ${failedAudits}`);
  console.log(`Pass Rate             : ${((passedAudits / totalAudits) * 100).toFixed(1)}%`);
  console.log(`Coverage              : ${TEMPLATES.length} / ${TEMPLATES.length} templates audited across 3 categories`);
  console.log('================================================================\n');

  if (failedAudits > 0 || coverageFailed) {
    console.error(`❌ Layout & Accessibility Audit FAILED: ${passedAudits} / ${totalAudits} passed, coverageFailed=${coverageFailed}`);
    process.exit(1);
  }

  console.log(`PASSED: ${passedAudits} / ${totalAudits} layout & accessibility audit checks passed green.\n`);
  return { totalAudits, passedAudits, failedAudits };
}

if (process.argv[1]?.endsWith('verify-viewport-layout-and-accessibility.mjs')) {
  runLayoutAndA11yAudit().catch(err => {
    console.error('Fatal audit error:', err);
    process.exit(1);
  });
}

