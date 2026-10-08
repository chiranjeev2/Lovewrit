import puppeteer from 'puppeteer-core';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { getBrowserExecutablePath } = require('./browser-config.cjs');

const EDGE_PATH = getBrowserExecutablePath();

async function diagnose(url) {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const result = await page.evaluate(() => {
    const winW = window.innerWidth;
    const scrollW = document.documentElement.scrollWidth;
    const clipped = [];
    const tapFails = [];

    const allVisible = Array.from(document.querySelectorAll('button, a, input, h1, h2, h3, h4, p, div'));
    for (const el of allVisible) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if ((rect.left < -4 || rect.right > winW + 4) && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
          if (!el.classList.contains('w-full') && !el.classList.contains('min-w-full')) {
            clipped.push({
              tag: el.tagName,
              class: el.className?.toString().slice(0, 50),
              text: el.textContent?.trim().slice(0, 30),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            });
          }
        }
      }
    }

    const interactives = Array.from(document.querySelectorAll('button, a[href], input[type="button"], input[type="submit"]'));
    for (const btn of interactives) {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && btn.offsetParent !== null) {
        // WCAG 2.5.8 exemption: inline text links within paragraph or sentence prose
        const isInlineTextLink = btn.tagName === 'A' && btn.parentElement && ['P', 'SPAN', 'LABEL'].includes(btn.parentElement.tagName) && (btn.parentElement.textContent?.length || 0) > (btn.textContent?.length || 0);
        if (isInlineTextLink) continue;

        if (rect.width < 44 || rect.height < 44) {
          tapFails.push({
            tag: btn.tagName,
            text: btn.textContent?.trim().slice(0, 30) || btn.getAttribute('aria-label') || btn.title || 'unlabeled',
            w: Math.round(rect.width),
            h: Math.round(rect.height),
            class: btn.className?.toString().slice(0, 50)
          });
        }
      }
    }

    return { winW, scrollW, clipped, tapFails };
  });

  console.log(`=== DIAGNOSIS FOR: ${url} ===`);
  console.log(`Window: ${result.winW}px, Scroll: ${result.scrollW}px`);
  console.log(`Clipped (${result.clipped.length}):`, result.clipped);
  console.log(`Tap Fails (${result.tapFails.length}):`, JSON.stringify(result.tapFails, null, 2));

  await browser.close();
}

const target = process.argv[2] || 'http://localhost:3000/c/anniversary-demo';
diagnose(target);
