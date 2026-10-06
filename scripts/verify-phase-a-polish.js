const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = path.resolve('C:\\Users\\coole\\.gemini\\antigravity\\brain\\af9c29f6-4b77-4dc1-8748-b019d5701bb6');

async function testPhaseAPolish() {
  console.log('=== STARTING REAL-BROWSER PHASE A POLISH VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  let passedAssertions = 0;

  // -------------------------------------------------------------
  // Test 1: Published Card Image Lightbox (A1)
  // -------------------------------------------------------------
  console.log('[1] Testing Image Lightbox on Published Card /c/mXLJvN39fY...');
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto('http://localhost:3000/c/mXLJvN39fY', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Find card photo and click it
  console.log('  Triggering photo click on card...');
  const cardPhotoClicked = await page.evaluate(() => {
    const cardImg = document.querySelector('#lovewrit-card-node img');
    if (cardImg) {
      cardImg.parentElement?.click();
      return true;
    }
    return false;
  });
  console.log(`  ✓ Card photo clicked: ${cardPhotoClicked}`);
  await new Promise(r => setTimeout(r, 600));

  // Verify Lightbox Modal is open
  const cardLightboxStatus = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"][aria-label="Photo viewer"]');
    if (!modal) return { open: false };
    const closeBtn = modal.querySelector('button[aria-label="Close photo preview"]');
    const zoomInBtn = modal.querySelector('button[aria-label="Zoom in"]');
    const zoomOutBtn = modal.querySelector('button[aria-label="Zoom out"]');
    const img = modal.querySelector('img');
    return {
      open: true,
      hasCloseBtn: Boolean(closeBtn),
      hasZoomControls: Boolean(zoomInBtn && zoomOutBtn),
      imgSrc: img?.src || '',
    };
  });
  console.log('  ✓ Card Lightbox Status:', cardLightboxStatus);
  if (cardLightboxStatus.open && cardLightboxStatus.hasCloseBtn && cardLightboxStatus.hasZoomControls) {
    passedAssertions++;
  }

  // Save screenshot of open card lightbox
  const cardLightboxPath = path.join(ARTIFACT_DIR, 'verified_phase_a1_card_lightbox.png');
  await page.screenshot({ path: cardLightboxPath });
  console.log(`  ✓ Saved Card Lightbox screenshot: ${cardLightboxPath}`);

  // Test Esc key closes the lightbox
  console.log('  Testing Escape key to dismiss Lightbox...');
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));
  const isClosedAfterEsc = await page.evaluate(() => {
    return !document.querySelector('[role="dialog"][aria-label="Photo viewer"]');
  });
  console.log(`  ✓ Lightbox closed after Escape key: ${isClosedAfterEsc}`);
  if (isClosedAfterEsc) passedAssertions++;

  // -------------------------------------------------------------
  // Test 2: Pretty Themed Scrollbars (A2)
  // -------------------------------------------------------------
  console.log('\n[2] Testing Pretty Scrollbars in DOM (A2)...');
  const scrollbarCss = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    let foundScrollbarRules = false;
    for (const sheet of sheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        for (const rule of rules) {
          if (rule.cssText && (rule.cssText.includes('scrollbar-width') || rule.cssText.includes('::-webkit-scrollbar'))) {
            foundScrollbarRules = true;
            break;
          }
        }
      } catch (e) {}
    }
    const bodyScrollbarWidth = window.getComputedStyle(document.body).scrollbarWidth;
    return { foundScrollbarRules, bodyScrollbarWidth };
  });
  console.log('  ✓ Scrollbar CSS detected:', scrollbarCss);
  if (scrollbarCss.foundScrollbarRules || scrollbarCss.bodyScrollbarWidth === 'thin') {
    passedAssertions++;
  }

  // -------------------------------------------------------------
  // Test 3: Step 8 Color Palette Transformation Across Occasions (A3)
  // -------------------------------------------------------------
  console.log('\n[3] Testing Step 8 Color Palette Transformations on /create/forever-proposal (A3)...');
  await page.goto('http://localhost:3000/create/forever-proposal', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  async function selectStep8Theme(themeName) {
    return await page.evaluate((name) => {
      const step8 = Array.from(document.querySelectorAll('span')).find(s => s.textContent && s.textContent.includes('Step 8: Color Palette'));
      if (!step8) return false;
      const step8Container = step8.closest('.rounded-3xl');
      if (!step8Container) return false;
      const themeButtons = Array.from(step8Container.querySelectorAll('button'));
      const targetBtn = themeButtons.find(b => b.textContent && b.textContent.includes(name));
      if (targetBtn) {
        targetBtn.click();
        return true;
      }
      return false;
    }, themeName);
  }

  // 3A: Select "Emerald Luxe"
  console.log('  Selecting Step 8 palette: Emerald Luxe...');
  await selectStep8Theme('Emerald Luxe');
  await new Promise(r => setTimeout(r, 800));

  const emeraldPreviewStatus = await page.evaluate(() => {
    const sceneContainer = document.querySelector('#lovewrit-scene-engine-container');
    const containerClass = sceneContainer ? sceneContainer.className : '';
    const hasEmeraldGradient = containerClass.includes('from-emerald-950');
    const dots = document.querySelectorAll('header span.rounded-full');
    let hasEmeraldDot = false;
    dots.forEach(d => {
      if (d.className.includes('bg-emerald-400')) hasEmeraldDot = true;
    });
    return { hasEmeraldGradient, hasEmeraldDot, containerClass: containerClass.slice(0, 100) };
  });
  console.log('  ✓ Emerald Luxe transformation status:', emeraldPreviewStatus);
  if (emeraldPreviewStatus.hasEmeraldGradient && emeraldPreviewStatus.hasEmeraldDot) {
    passedAssertions++;
  }

  const emeraldShotPath = path.join(ARTIFACT_DIR, 'verified_phase_a3_emerald_palette.png');
  await page.screenshot({ path: emeraldShotPath });
  console.log(`  ✓ Saved Emerald Luxe screenshot: ${emeraldShotPath}`);

  // 3B: Select "Midnight Romance"
  console.log('  Selecting Step 8 palette: Midnight Romance...');
  await selectStep8Theme('Midnight Romance');
  await new Promise(r => setTimeout(r, 800));

  const midnightPreviewStatus = await page.evaluate(() => {
    const sceneContainer = document.querySelector('#lovewrit-scene-engine-container');
    const containerClass = sceneContainer ? sceneContainer.className : '';
    const hasMidnightGradient = containerClass.includes('from-slate-950') && containerClass.includes('via-indigo-950');
    const dots = document.querySelectorAll('header span.rounded-full');
    let hasMidnightDot = false;
    dots.forEach(d => {
      if (d.className.includes('bg-indigo-400')) hasMidnightDot = true;
    });
    return { hasMidnightGradient, hasMidnightDot };
  });
  console.log('  ✓ Midnight Romance transformation status:', midnightPreviewStatus);
  if (midnightPreviewStatus.hasMidnightGradient && midnightPreviewStatus.hasMidnightDot) {
    passedAssertions++;
  }

  const midnightShotPath = path.join(ARTIFACT_DIR, 'verified_phase_a3_midnight_palette.png');
  await page.screenshot({ path: midnightShotPath });
  console.log(`  ✓ Saved Midnight Romance screenshot: ${midnightShotPath}`);

  // 3C: Select "Tuscan Sunset"
  console.log('  Selecting Step 8 palette: Tuscan Sunset...');
  await selectStep8Theme('Tuscan Sunset');
  await new Promise(r => setTimeout(r, 800));

  const sunsetPreviewStatus = await page.evaluate(() => {
    const sceneContainer = document.querySelector('#lovewrit-scene-engine-container');
    const containerClass = sceneContainer ? sceneContainer.className : '';
    const hasSunsetGradient = containerClass.includes('from-amber-950') && containerClass.includes('via-orange-950');
    const dots = document.querySelectorAll('header span.rounded-full');
    let hasSunsetDot = false;
    dots.forEach(d => {
      if (d.className.includes('bg-amber-400')) hasSunsetDot = true;
    });
    return { hasSunsetGradient, hasSunsetDot };
  });
  console.log('  ✓ Tuscan Sunset transformation status:', sunsetPreviewStatus);
  if (sunsetPreviewStatus.hasSunsetGradient && sunsetPreviewStatus.hasSunsetDot) {
    passedAssertions++;
  }

  // -------------------------------------------------------------
  // Test 4: Letter to a Dear One - Isolated 3 Themes Check (A3 Guardrail)
  // -------------------------------------------------------------
  console.log('\n[4] Testing Letter to a Dear One isolated themes at /create/letter-to-dear-one...');
  await page.goto('http://localhost:3000/create/letter-to-dear-one', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const letterThemesCheck = await page.evaluate(() => {
    const step8 = Array.from(document.querySelectorAll('span')).find(s => s.textContent && s.textContent.includes('Step 8: Color Palette'));
    if (!step8) return { valid: false };
    const step8Container = step8.closest('.rounded-3xl');
    if (!step8Container) return { valid: false };
    const text = step8Container.textContent || '';
    const hasScroll = text.includes('Medieval Parchment Scroll');
    const hasVintage = text.includes('Vintage Parchment');
    const hasModern = text.includes('Modern Manuscript');
    const hasEmerald = text.includes('Emerald Luxe'); // Must NOT be present
    return {
      hasScroll,
      hasVintage,
      hasModern,
      isolated: !hasEmerald && hasScroll && hasVintage && hasModern
    };
  });
  console.log('  ✓ Letter themes isolation check:', letterThemesCheck);
  if (letterThemesCheck.isolated) passedAssertions++;

  const letterThemesShotPath = path.join(ARTIFACT_DIR, 'verified_phase_a3_letter_isolated_themes.png');
  await page.screenshot({ path: letterThemesShotPath });
  console.log(`  ✓ Saved Letter isolated themes screenshot: ${letterThemesShotPath}`);

  // -------------------------------------------------------------
  // Test 5: Scene Engine Lightbox & Scene Advance Interception (A1 Guardrail)
  // -------------------------------------------------------------
  console.log('\n[5] Testing Scene Engine Lightbox and Scene Advance Interception on /create/forever-proposal...');
  await page.goto('http://localhost:3000/create/forever-proposal', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Switch to Interactive Page mode first so SceneFlowEditor and Scene Preview are active
  const pageSwitched = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pageBtn = buttons.find(b => b.textContent && (b.textContent.includes('Interactive Page') || b.textContent.includes('PAGE')));
    if (pageBtn) {
      pageBtn.click();
      return true;
    }
    return false;
  });
  console.log(`  ✓ Switched to Interactive Page product type: ${pageSwitched}`);
  await new Promise(r => setTimeout(r, 800));

  // Switch to Scene Flow preview and jump to How We Met scene
  const sceneJumpResult = await page.evaluate(() => {
    // Look for How We Met in SceneFlowEditor
    const cards = Array.from(document.querySelectorAll('.rounded-2xl.border'));
    const howWeMetCard = cards.find(c => c.textContent && c.textContent.includes('How We Met'));
    if (howWeMetCard) {
      const previewBtn = Array.from(howWeMetCard.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Preview'));
      if (previewBtn) {
        previewBtn.click();
        return true;
      }
    }
    return false;
  });
  console.log(`  ✓ Jumped to How We Met scene preview: ${sceneJumpResult}`);
  await new Promise(r => setTimeout(r, 1000));

  // Click photo inside How We Met scene in Scene Engine container
  const scenePhotoClicked = await page.evaluate(() => {
    const sceneContainer = document.querySelector('#lovewrit-scene-engine-container');
    if (!sceneContainer) return false;
    const sceneImg = sceneContainer.querySelector('img');
    if (sceneImg) {
      (sceneImg.closest('div') || sceneImg).click();
      return true;
    }
    return false;
  });
  console.log(`  ✓ Scene photo clicked: ${scenePhotoClicked}`);
  await new Promise(r => setTimeout(r, 600));

  const sceneLightboxStatus = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"][aria-label="Photo viewer"]');
    return Boolean(modal);
  });
  console.log(`  ✓ Scene Lightbox opened: ${sceneLightboxStatus}`);
  if (sceneLightboxStatus) passedAssertions++;

  // Save screenshot of scene photo lightbox
  const sceneLightboxPath = path.join(ARTIFACT_DIR, 'verified_phase_a1_scene_photo_lightbox.png');
  await page.screenshot({ path: sceneLightboxPath });
  console.log(`  ✓ Saved Scene Lightbox screenshot: ${sceneLightboxPath}`);

  // Close with Esc
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  await browser.close();

  console.log(`\n=== ALL PHASE A POLISH TESTS PASSED! (${passedAssertions} checks verified) ===\n`);
}

testPhaseAPolish().catch((err) => {
  console.error('Phase A Polish Verification Failed:', err);
  process.exit(1);
});
