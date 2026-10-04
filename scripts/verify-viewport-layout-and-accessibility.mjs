import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:3000';

async function runLayoutAndA11yAudit() {
  console.log('================================================================');
  console.log('   📐 MULTI-VIEWPORT LAYOUT & ACCESSIBILITY AUDIT (PORT 3000)   ');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test occasions on published sample URLs or studio customizer
  const testRoutes = [
    { name: 'Published Scene Page (/p/imbyA-MMQ6)', url: `${BASE_URL}/p/imbyA-MMQ6` },
    { name: 'Card Experience (Anniversary)', url: `${BASE_URL}/c/anniversary-demo` },
    { name: 'Birthday Customizer', url: `${BASE_URL}/create/festive-birthday` },
    { name: 'Memorial Customizer', url: `${BASE_URL}/create/in-loving-memory` },
  ];

  const viewports = [
    { width: 375, height: 812, name: '375 Mobile' },
    { width: 768, height: 1024, name: '768 Tablet' },
    { width: 1024, height: 1366, name: '1024 Laptop' },
    { width: 1440, height: 900, name: '1440 Desktop' }
  ];

  const auditReport = [];

  for (const route of testRoutes) {
    console.log(`\nAuditing [${route.name}]...`);
    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(route.url, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 1200));

      const evaluation = await page.evaluate((isMobile) => {
        const issues = [];
        const winW = window.innerWidth;
        const scrollW = document.documentElement.scrollWidth;

        // 1. Check Horizontal Overflow
        const hasHorizontalOverflow = scrollW > winW + 2;
        if (hasHorizontalOverflow) {
          issues.push({
            type: 'HORIZONTAL_OVERFLOW',
            message: `Document scrollWidth (${scrollW}px) exceeds window width (${winW}px)`
          });
        }

        // 2. Check for elements clipped off-screen horizontally
        const allVisible = Array.from(document.querySelectorAll('button, a, input, h1, h2, h3, h4, p, div'));
        let clippedCount = 0;
        for (const el of allVisible) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            if (rect.left < -4 || rect.right > winW + 4) {
              // Ignore body, html, or full width root containers
              if (el.tagName !== 'HTML' && el.tagName !== 'BODY' && !el.classList.contains('w-full') && !el.classList.contains('min-w-full')) {
                clippedCount++;
              }
            }
          }
        }
        if (clippedCount > 0) {
          issues.push({
            type: 'CLIPPED_ELEMENTS',
            message: `${clippedCount} elements clipped outside viewport boundary`
          });
        }

        // 3. Tap targets check (Mobile 375 only)
        let tapTargetFailures = [];
        if (isMobile) {
          const interactives = Array.from(document.querySelectorAll('button, a[href], input[type="button"], input[type="submit"]'));
          for (const btn of interactives) {
            const rect = btn.getBoundingClientRect();
            // Check only visible elements
            if (rect.width > 0 && rect.height > 0 && btn.offsetParent !== null) {
              const text = btn.textContent?.trim() || btn.getAttribute('aria-label') || btn.title || 'unlabeled button';
              // Check computed touch target (including padding)
              if (rect.width < 44 || rect.height < 44) {
                tapTargetFailures.push({
                  label: text.slice(0, 30),
                  dimensions: `${Math.round(rect.width)}x${Math.round(rect.height)}px`
                });
              }
            }
          }
        }

        // 4. Text contrast check
        function parseRgb(colorStr) {
          const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (!m) return null;
          return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
        }

        function getLuminance(rgb) {
          const a = rgb.map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
        }

        function getContrastRatio(rgb1, rgb2) {
          const l1 = getLuminance(rgb1);
          const l2 = getLuminance(rgb2);
          const lighter = Math.max(l1, l2);
          const darker = Math.min(l1, l2);
          return (lighter + 0.05) / (darker + 0.05);
        }

        const textEls = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, span, label'));
        const contrastIssues = [];

        for (const el of textEls.slice(0, 50)) { // Sample first 50 text elements
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && el.textContent?.trim()) {
            const style = window.getComputedStyle(el);
            const fg = parseRgb(style.color);
            // Search upward for non-transparent background color
            let bgNode = el;
            let bg = null;
            while (bgNode && bgNode !== document.documentElement) {
              const bStyle = window.getComputedStyle(bgNode);
              const parsed = parseRgb(bStyle.backgroundColor);
              if (parsed && !bStyle.backgroundColor.includes('rgba(0, 0, 0, 0)')) {
                bg = parsed;
                break;
              }
              bgNode = bgNode.parentElement;
            }
            if (!bg) bg = [255, 255, 255]; // Default white background if transparent

            if (fg && bg) {
              const ratio = getContrastRatio(fg, bg);
              if (ratio < 4.5 && style.fontSize && parseInt(style.fontSize) < 18) {
                contrastIssues.push({
                  text: el.textContent.trim().slice(0, 25),
                  ratio: ratio.toFixed(2),
                  fg: style.color,
                  bg: `rgb(${bg.join(',')})`
                });
              }
            }
          }
        }

        return {
          winW,
          scrollW,
          hasHorizontalOverflow,
          clippedCount,
          tapTargetFailures: tapTargetFailures.slice(0, 5),
          contrastIssues: contrastIssues.slice(0, 5),
          issues
        };
      }, vp.width === 375);

      auditReport.push({
        route: route.name,
        viewport: vp.name,
        ...evaluation
      });

      console.log(`  [${vp.name}]: ScrollW=${evaluation.scrollW}px, Overflow=${evaluation.hasHorizontalOverflow}, Clipped=${evaluation.clippedCount}, TapTargetFails=${evaluation.tapTargetFailures.length}, ContrastIssues=${evaluation.contrastIssues.length}`);
    }
  }

  await browser.close();

  console.log('\n================================================================');
  console.log('               📊 LAYOUT & ACCESSIBILITY SUMMARY                ');
  console.log('================================================================');
  console.table(auditReport.map(r => ({
    route: r.route,
    viewport: r.viewport,
    overflow: r.hasHorizontalOverflow ? 'FAIL' : 'PASS',
    clipped: r.clippedCount > 0 ? `FAIL (${r.clippedCount})` : 'PASS',
    tapTargets: r.tapTargetFailures.length > 0 ? `${r.tapTargetFailures.length} < 44px` : 'PASS',
    contrast: r.contrastIssues.length > 0 ? `${r.contrastIssues.length} low` : 'PASS'
  })));

  return auditReport;
}

runLayoutAndA11yAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
