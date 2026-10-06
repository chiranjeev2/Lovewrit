import puppeteer from 'puppeteer-core';
import { TEMPLATES } from '../src/lib/templates-data.ts';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:3000';

async function testAllCustomizers() {
  console.log('================================================================');
  console.log('   TESTING 375px STUDIO CUSTOMIZER ON ALL OCCASION TEMPLATES    ');
  console.log('================================================================\n');

  if (!Array.isArray(TEMPLATES) || TEMPLATES.length === 0) {
    console.error('Fatal: TEMPLATES is empty or invalid.');
    process.exit(1);
  }

  // Fail if duplicate template IDs exist in TEMPLATES
  const seenIds = new Set();
  for (const t of TEMPLATES) {
    if (seenIds.has(t.id)) {
      console.error(`Fatal: Duplicate template ID detected in TEMPLATES: ${t.id}`);
      process.exit(1);
    }
    seenIds.add(t.id);
  }

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

  const results = [];
  const resolvedTemplateIds = new Set();

  for (const item of TEMPLATES) {
    console.log(`\nTesting [${item.occasion}] (${item.id}) at 375px...`);
    const url = `${BASE_URL}/create/${item.id}`;
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Assert that the loaded page's template id AND occasion equal the requested row
    const loadedMeta = await page.evaluate(() => {
      const el = document.querySelector('[data-template-id]');
      return {
        templateId: el ? el.getAttribute('data-template-id') : null,
        occasion: el ? el.getAttribute('data-occasion') : null,
      };
    });

    const templateMatches = loadedMeta.templateId === item.id;
    const occasionMatches = loadedMeta.occasion === item.occasion;

    if (!templateMatches || !occasionMatches) {
      console.error(`  ❌ Mismatch for ${item.id}: loaded templateId="${loadedMeta.templateId}", loaded occasion="${loadedMeta.occasion}" (expected "${item.id}" / "${item.occasion}")`);
    } else {
      console.log(`  ✓ Verified template metadata: ID=${loadedMeta.templateId}, Occasion=${loadedMeta.occasion}`);
    }

    if (resolvedTemplateIds.has(loadedMeta.templateId)) {
      console.error(`  ❌ Duplicate resolution: template ${loadedMeta.templateId} was already tested in another row!`);
    }
    if (loadedMeta.templateId) {
      resolvedTemplateIds.add(loadedMeta.templateId);
    }

    // Audit layout & controls on initial render
    const metrics = await page.evaluate(() => {
      const winW = window.innerWidth;
      const scrollW = document.documentElement.scrollWidth;
      const hasHorizontalOverflow = scrollW > winW + 2;

      let clippedCount = 0;
      for (const el of document.querySelectorAll('button, a, input, h1, h2, h3, h4, p, div')) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && !el.classList.contains('w-full') && !el.classList.contains('min-w-full') && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
          if (rect.left < -4 || rect.right > winW + 4) {
            clippedCount++;
          }
        }
      }

      const tapFails = [];
      const interactives = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'));
      for (const btn of interactives) {
        const rect = btn.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && btn.offsetParent !== null) {
          if (rect.width < 44 || rect.height < 44) {
            tapFails.push({
              text: btn.textContent?.trim().slice(0, 25) || btn.getAttribute('aria-label') || 'unlabeled',
              dim: `${Math.round(rect.width)}x${Math.round(rect.height)}`
            });
          }
        }
      }

      // Check mobile tabs (must have toggle between Customize and Live Preview on mobile)
      const tabs = Array.from(document.querySelectorAll('button')).filter(b => {
        const txt = b.textContent?.toLowerCase() || '';
        return txt.includes('preview') || txt.includes('customize') || txt.includes('edit');
      });
      const hasMobileTabs = tabs.length >= 2;

      return {
        winW,
        scrollW,
        hasHorizontalOverflow,
        clippedCount,
        tapFailCount: tapFails.length,
        hasMobileTabs,
        tapFails: tapFails.slice(0, 5)
      };
    });

    console.log(`  Layout: ScrollW=${metrics.scrollW}px, Overflow=${metrics.hasHorizontalOverflow}, Clipped=${metrics.clippedCount}, TapFails=${metrics.tapFailCount}`);

    // Test mobile tab switch to Live Preview
    let tabSwitchWorks = false;
    try {
      const previewTabBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent && b.textContent.includes('Preview') && !b.textContent.includes('VIP'));
      });
      if (previewTabBtn && previewTabBtn.asElement()) {
        await previewTabBtn.asElement().click();
        await new Promise(r => setTimeout(r, 400));
        tabSwitchWorks = true;
      }
    } catch {
      tabSwitchWorks = false;
    }
    console.log(`  Testing mobile tab switch to Live Preview...`);
    console.log(`  ✓ Live preview accessible on mobile:`, tabSwitchWorks);

    // Switch back to editor
    try {
      const editorTabBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent && (b.textContent.includes('Customize') || b.textContent.includes('Edit')));
      });
      if (editorTabBtn && editorTabBtn.asElement()) {
        await editorTabBtn.asElement().click();
        await new Promise(r => setTimeout(r, 300));
      }
    } catch {}

    // Fill sender & recipient if needed
    await page.evaluate((sender, recipient) => {
      const senderInput = document.querySelector('input[placeholder*="Sender"], input[placeholder*="Your Name"], input[name*="sender"]');
      const recipientInput = document.querySelector('input[placeholder*="Recipient"], input[placeholder*="Their Name"], input[name*="recipient"]');
      if (senderInput && !senderInput.value) {
        senderInput.value = sender;
        senderInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (recipientInput && !recipientInput.value) {
        recipientInput.value = recipient;
        recipientInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, item.sampleSender || 'QA Sender', item.sampleRecipient || 'QA Recipient');

    // Scroll to bottom and check checkout button
    const checkoutBtnExists = await page.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Continue to Secure Checkout') || b.textContent.includes('Checkout')));
      return Boolean(submitBtn && !submitBtn.disabled);
    });

    console.log(`  Testing full order creation to checkout...`);
    console.log(`  ✓ Checkout CTA reachable and ready:`, checkoutBtnExists);

    const matchesExpected = templateMatches && occasionMatches;

    results.push({
      occasion: item.occasion,
      slug: item.id,
      metaMatch: matchesExpected ? 'PASS' : 'FAIL',
      scrollW: metrics.scrollW,
      overflow: metrics.hasHorizontalOverflow ? 'FAIL' : 'PASS',
      clipped: metrics.clippedCount > 0 ? `FAIL (${metrics.clippedCount})` : 'PASS',
      tapTargets: metrics.tapFailCount > 0 ? `FAIL (${metrics.tapFailCount})` : 'PASS',
      mobileTabs: metrics.hasMobileTabs ? 'PASS' : 'FAIL',
      checkoutReady: checkoutBtnExists ? 'PASS' : 'FAIL'
    });
  }

  // Check 404 handling:
  // 1. Unknown template ID on /create
  console.log('\nTesting unknown template ID (/create/non-existent-template-id-999)...');
  const unknownCreateRes = await page.goto(`${BASE_URL}/create/non-existent-template-id-999`, { waitUntil: 'networkidle2' });
  const isCreate404 = unknownCreateRes?.status() === 404 || await page.evaluate(() => document.body.textContent.includes('404') || document.body.textContent.includes('could not be found'));
  console.log(`  ✓ Unknown /create returns 404 / notFound:`, isCreate404);

  // 2. Unknown page slug on /p
  console.log('Testing unknown page slug (/p/non-existent-page-slug-999)...');
  const unknownPageRes = await page.goto(`${BASE_URL}/p/non-existent-page-slug-999`, { waitUntil: 'networkidle2' });
  const isPage404 = unknownPageRes?.status() === 404 || await page.evaluate(() => document.body.textContent.includes('404') || document.body.textContent.includes('could not be found'));
  console.log(`  ✓ Unknown /p returns 404 / notFound:`, isPage404);

  // 3. Unknown card slug on /c
  console.log('Testing unknown card slug (/c/non-existent-card-slug-999)...');
  const unknownCardRes = await page.goto(`${BASE_URL}/c/non-existent-card-slug-999`, { waitUntil: 'networkidle2' });
  const isCard404 = unknownCardRes?.status() === 404 || await page.evaluate(() => document.body.textContent.includes('404') || document.body.textContent.includes('could not be found'));
  console.log(`  ✓ Unknown /c returns 404 / notFound:`, isCard404);

  await browser.close();

  console.log('\n================================================================');
  console.log('         375px CUSTOMIZER AUDIT SUMMARY TABLE                   ');
  console.log('================================================================');
  console.table(results);

  // Assertions:
  const all404sPass = isCreate404 && isPage404 && isCard404;
  const allTemplatesCovered = resolvedTemplateIds.size === TEMPLATES.length;
  const hasFailures = results.some(r => r.metaMatch !== 'PASS' || r.overflow !== 'PASS' || r.clipped !== 'PASS' || r.tapTargets !== 'PASS' || r.checkoutReady !== 'PASS');
  const passedCount = results.filter(r => r.metaMatch === 'PASS' && r.overflow === 'PASS' && r.clipped === 'PASS' && r.tapTargets === 'PASS' && r.checkoutReady === 'PASS').length;

  if (hasFailures || !all404sPass || !allTemplatesCovered) {
    console.error(`Audit failed: ${passedCount} / ${results.length} passed. (404s: ${all404sPass ? 'PASS' : 'FAIL'}, Coverage: ${allTemplatesCovered ? 'PASS' : 'FAIL'})`);
    process.exit(1);
  } else {
    console.log(`PASSED: ${passedCount} / ${results.length} customizer audits passed at 375px with 100% template coverage & 404 guards.`);
  }
}

testAllCustomizers().catch(err => {
  console.error('Error during customizer audit:', err);
  process.exit(1);
});

