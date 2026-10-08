const { execSync, spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const QA_SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'qa-screenshots');
if (!fs.existsSync(QA_SCREENSHOTS_DIR)) {
  fs.mkdirSync(QA_SCREENSHOTS_DIR, { recursive: true });
}

const QA_TEST_ADMIN_KEY = process.env.ADMIN_MASTER_KEY || crypto.randomBytes(24).toString('hex');
process.env.ADMIN_MASTER_KEY = QA_TEST_ADMIN_KEY;

function getRepoTemplateCount() {
  const tsPath = path.resolve(__dirname, '..', 'src', 'lib', 'templates-data.ts');
  const tsContent = fs.readFileSync(tsPath, 'utf-8');
  const templatesSection = tsContent.split('export const TEMPLATES')[1]?.split('export function getTemplateById')[0] || '';
  const matches = templatesSection.match(/^\s{4}id:\s*['"][^'"]+['"]/gm);
  const regexCount = matches ? matches.length : 0;

  // Real TEMPLATES.length evaluated dynamically via tsx
  const tsxOut = execSync('npx tsx -e "import { TEMPLATES } from \'./src/lib/templates-data\'; console.log(TEMPLATES.length)"', {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf-8',
  }).trim();
  const realCount = parseInt(tsxOut, 10);

  if (isNaN(realCount) || realCount <= 0) {
    throw new Error('Unable to evaluate real TEMPLATES.length via tsx');
  }
  if (regexCount !== realCount) {
    throw new Error(`Template count mismatch: regex parsed ${regexCount} but real TEMPLATES.length is ${realCount}`);
  }
  return realCount;
}

const TEMPLATE_COUNT = getRepoTemplateCount();
const EXPECTED_LAYOUT_CHECKS = TEMPLATE_COUNT * 3 * 4; // 21 templates x 3 page types x 4 viewports = 252

function checkServerListening() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServerRunning() {
  const isUp = await checkServerListening();
  if (isUp) {
    console.error('  [FAIL] Port 3000 is already in use by an external server.');
    console.error('         Please stop any running server before running QA so QA can manage its own isolated server instance.');
    process.exit(1);
  }
  console.log('  Launching Next.js dev server for browser QA checks (isolated QA server)...');
  const serverProcess = spawn('npx.cmd', ['next', 'dev', '-p', '3000'], {
    detached: false,
    stdio: 'ignore',
    shell: true,
    env: { ...process.env, VERCEL: '1', ADMIN_MASTER_KEY: QA_TEST_ADMIN_KEY },
  });

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const ready = await checkServerListening();
    if (ready) {
      console.log('  Server is active and healthy on http://localhost:3000\n');
      return serverProcess;
    }
  }
  throw new Error('Server failed to start within 30 seconds');
}

const EXPECTED_SUITE_IDS = [
  'tsc',
  'currency-matrix',
  'guest-sanitization',
  'client-ip-trust',
  'sim-session-guard',
  'client-secret-leak',
  'env-check',
  'razorpay-flow',
  'admin-key-security',
  'guestbook-auth',
  'referral-candle',
  'browser-exports',
  'pdf-rasterization',
  'layout-audit',
  'customizer-audit',
  'pack-birthday',
  'pack-godhbharai',
  'pack-sacred-tribute',
  'pack-kitty',
  'pack-devotional',
  'growth-phase-c1',
  'policy-compliance',
  'public-api-safety',
  'security-headers',
  'error-empty-states',
  'a11y-mobile',
  'performance-bundles',
];

const SUITE_REGISTRY = [
  {
    id: 'tsc',
    name: 'TypeScript Typecheck',
    command: 'npx tsc --noEmit',
    requiresServer: false,
    minAssertions: 0,
    parse: (output, exitCode) => {
      if (exitCode !== 0) return { passed: false, details: 'Typecheck failed with non-zero exit' };
      return { passed: true, assertionsPassed: 0, totalAssertions: 0, details: '0 errors across all ts/tsx files' };
    },
  },
  {
    id: 'currency-matrix',
    name: 'Currency Matrix Audit',
    command: 'node test-currency-matrix.mjs',
    requiresServer: false,
    minAssertions: 28,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 28) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green across 4 regions` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: `Assertion count below required minimum (28)` };
    },
  },
  {
    id: 'guest-sanitization',
    name: 'Guest Security & Sanitization',
    command: 'node scripts/test-guest-sanitization.mjs',
    requiresServer: false,
    minAssertions: 10,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 10) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (tags stripped, emojis/RTL preserved, capped 60 chars)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Sanitization assertions below minimum' };
    },
  },
  {
    id: 'client-ip-trust',
    name: 'Client IP Trust Model',
    command: 'node scripts/test-client-ip-trust.mjs',
    requiresServer: false,
    minAssertions: 13,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 13) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (Vercel-only trust, non-shared fallback)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'IP trust assertions below minimum' };
    },
  },
  {
    id: 'sim-session-guard',
    name: 'Simulated Session Production Guard',
    command: 'node scripts/test-sim-session-security.mjs',
    requiresServer: false,
    minAssertions: 3,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 3) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (unreachable when NODE_ENV=production)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Simulated session assertions below minimum' };
    },
  },
  {
    id: 'client-secret-leak',
    name: 'Client Secret Leak Audit',
    command: 'node scripts/test-client-secret-leak.mjs',
    requiresServer: false,
    minAssertions: 5,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 5) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (zero secret leaks, server-only keys)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Client secret leak audit below minimum' };
    },
  },
  {
    id: 'env-check',
    name: 'Startup Environment Verification',
    command: 'node scripts/test-env-check.mjs',
    requiresServer: false,
    minAssertions: 17,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 17) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (fail-closed, zero leaks)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Startup environment verification below minimum' };
    },
  },
  {
    id: 'razorpay-flow',
    name: 'Razorpay Flow & Security Suite',
    command: 'node scripts/test-razorpay-flow.mjs',
    requiresServer: false,
    minAssertions: 65,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 65) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (HMAC-SHA256 signatures, webhooks, amounts)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Razorpay flow assertions below minimum' };
    },
  },
  {
    id: 'admin-key-security',
    name: 'Admin Master Key Security',
    command: 'node scripts/test-admin-key-security.mjs',
    requiresServer: true,
    env: { ADMIN_MASTER_KEY: QA_TEST_ADMIN_KEY },
    minAssertions: 28,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 28) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (timing-safe, zero leaks, fail-closed)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Admin key security assertions below minimum' };
    },
  },
  {
    id: 'guestbook-auth',
    name: 'Guestbook Auth & Admin Security',
    command: 'node scripts/test-guestbook-auth.mjs',
    requiresServer: true,
    env: { ADMIN_MASTER_KEY: QA_TEST_ADMIN_KEY },
    minAssertions: 18,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 18) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (public posting, host token, admin session)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Guestbook auth assertions below minimum' };
    },
  },
  {
    id: 'referral-candle',
    name: 'Referral & Candle Anti-Abuse',
    command: 'node scripts/test-referral-and-candle.mjs',
    requiresServer: true,
    minAssertions: 24,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 24) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (20 concurrent requests atomic)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Referral & candle assertions below minimum' };
    },
  },
  {
    id: 'browser-exports',
    name: 'Browser Exports (PDF/PNG/JPG)',
    command: 'node scripts/verify-real-browser-exports.js',
    requiresServer: true,
    minAssertions: 4,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)\s*exports/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 4) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} exports valid; Foldable PDF < 10 MB` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Browser exports below minimum' };
    },
  },
  {
    id: 'pdf-rasterization',
    name: 'PDF Rasterization & Sharpness',
    command: 'node scripts/verify-pdf-rasterization.mjs',
    requiresServer: false,
    minAssertions: 2,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)\s*pages/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 2) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} pages non-blank, effective photo DPI >= 150` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'PDF rasterization below minimum' };
    },
  },
  {
    id: 'layout-audit',
    name: `Layout & Accessibility Audit (${TEMPLATE_COUNT} Templates x 3 Types x 4 Viewports)`,
    command: 'node scripts/verify-viewport-layout-and-accessibility.mjs',
    requiresServer: true,
    minAssertions: EXPECTED_LAYOUT_CHECKS,
    parse: (output, exitCode) => {
      const pMatch = output.match(/Passed Checks\s*:\s*(\d+)/i);
      const tMatch = output.match(/Total Checks Executed\s*:\s*(\d+)/i);
      const cMatch = output.match(/Coverage\s*:\s*(\d+)\s*\/\s*(\d+)\s*templates/i);
      const passed = pMatch ? parseInt(pMatch[1], 10) : 0;
      const total = tMatch ? parseInt(tMatch[1], 10) : 0;
      if (exitCode === 0 && pMatch && tMatch && passed >= EXPECTED_LAYOUT_CHECKS) {
        const tCount = cMatch ? cMatch[1] : TEMPLATE_COUNT;
        return {
          passed: true,
          assertionsPassed: passed,
          totalAssertions: total,
          details: `${passed} / ${total} checks passed (0 overflow, 0 clipped, 0 tap target failures)`,
          customName: `Layout & Accessibility Audit (${tCount} Templates x 3 Types x 4 Viewports)`,
        };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Layout & accessibility violation detected or count below minimum' };
    },
  },
  {
    id: 'customizer-audit',
    name: 'Studio Customizer 375px & Order Flow',
    command: 'node scripts/test-all-8-customizers.mjs',
    requiresServer: true,
    minAssertions: TEMPLATE_COUNT,
    parse: (output, exitCode) => {
      const match = output.match(/PASSED:\s*(\d+)\s*\/\s*(\d+)/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= TEMPLATE_COUNT) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} templates verified (0 overflow, 0 clipped, mobile preview, checkout ready)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Customizer audit below minimum' };
    },
  },
  {
    id: 'pack-birthday',
    name: 'B1 Birthday Pack',
    command: 'node scripts/verify-birthday-scene-engine.js',
    requiresServer: true,
    minAssertions: 18,
    parse: (output, exitCode) => {
      const match = output.match(/\((\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 18) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions verified` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'B1 Birthday pack failed' };
    },
  },
  {
    id: 'pack-godhbharai',
    name: 'B2 Godhbharai Pack',
    command: 'node scripts/verify-godhbharai-scene-engine.js',
    requiresServer: true,
    minAssertions: 16,
    parse: (output, exitCode) => {
      const match = output.match(/\((\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 16) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions verified` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'B2 Godhbharai pack failed' };
    },
  },
  {
    id: 'pack-sacred-tribute',
    name: 'B3 Sacred Tribute Pack',
    command: 'node scripts/verify-sacred-tribute-scene-engine.js',
    requiresServer: true,
    minAssertions: 23,
    parse: (output, exitCode) => {
      const match = output.match(/\((\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 23) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions verified` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'B3 Sacred Tribute pack failed' };
    },
  },
  {
    id: 'pack-kitty',
    name: 'B4 Kitty Celebration Pack',
    command: 'node scripts/verify-kitty-celebration-scene-engine.js',
    requiresServer: true,
    minAssertions: 16,
    parse: (output, exitCode) => {
      const match = output.match(/\((\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 16) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions verified` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'B4 Kitty pack failed' };
    },
  },
  {
    id: 'pack-devotional',
    name: 'B5 Religious Devotional Pack',
    command: 'node scripts/verify-devotional-scene-engine.js',
    requiresServer: true,
    minAssertions: 20,
    parse: (output, exitCode) => {
      const match = output.match(/\((\d+)\s*\/\s*(\d+)\s*assertions/i) || output.match(/(\d+)\s*\/\s*(\d+)/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 20) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions verified` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'B5 Devotional pack failed' };
    },
  },
  {
    id: 'growth-phase-c1',
    name: 'Phase C1 Growth Suite',
    command: 'node scripts/verify-phase-c1-growth.js',
    requiresServer: true,
    minAssertions: 15,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 15) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions verified` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Phase C1 Growth suite failed' };
    },
  },
  {
    id: 'policy-compliance',
    name: 'Policy Compliance Suite',
    command: 'node scripts/test-policy-compliance.mjs',
    requiresServer: false,
    minAssertions: 18,
    parse: (output, exitCode) => {
      const match = output.match(/(\d+)\s*\/\s*(\d+)\s*assertions/i);
      const passed = match ? parseInt(match[1], 10) : 0;
      const total = match ? parseInt(match[2], 10) : 0;
      if (exitCode === 0 && match && passed >= 18) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (11 non-negotiables enforced)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Policy compliance suite failed' };
    },
  },
  {
    id: 'public-api-safety',
    name: 'Public API Safety & Hostile Input Suite',
    command: 'node scripts/test-public-api-safety.mjs',
    requiresServer: false,
    minAssertions: 30,
    parse: (output, exitCode) => {
      const pMatch = output.match(/PASSED ASSERTIONS:\s*(\d+)/i);
      const tMatch = output.match(/TOTAL ASSERTIONS:\s*(\d+)/i);
      const passed = pMatch ? parseInt(pMatch[1], 10) : 0;
      const total = tMatch ? parseInt(tMatch[1], 10) : 0;
      if (exitCode === 0 && passed >= 30) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (hostile input, rate limits, schema safety)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Public API safety suite failed or assertions below minimum' };
    },
  },
  {
    id: 'security-headers',
    name: 'Security Headers, CSP & Privacy Suite',
    command: 'node scripts/test-security-headers-and-privacy.mjs',
    requiresServer: false,
    minAssertions: 28,
    parse: (output, exitCode) => {
      const pMatch = output.match(/PASSED ASSERTIONS:\s*(\d+)/i);
      const tMatch = output.match(/TOTAL ASSERTIONS:\s*(\d+)/i);
      const passed = pMatch ? parseInt(pMatch[1], 10) : 0;
      const total = tMatch ? parseInt(tMatch[1], 10) : 0;
      if (exitCode === 0 && passed >= 28) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (CSP, HSTS, PII redaction, guest safety)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Security headers & privacy suite failed or assertions below minimum' };
    },
  },
  {
    id: 'error-empty-states',
    name: 'Error Boundaries & Empty States Suite',
    command: 'node scripts/test-error-and-empty-states.mjs',
    requiresServer: false,
    minAssertions: 30,
    parse: (output, exitCode) => {
      const pMatch = output.match(/PASSED ASSERTIONS:\s*(\d+)/i);
      const tMatch = output.match(/TOTAL ASSERTIONS:\s*(\d+)/i);
      const passed = pMatch ? parseInt(pMatch[1], 10) : 0;
      const total = tMatch ? parseInt(tMatch[1], 10) : 0;
      if (exitCode === 0 && passed >= 30) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (error boundaries, 404, loading, PIN lockout, scene fallbacks)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Error & empty states suite failed or assertions below minimum' };
    },
  },
  {
    id: 'a11y-mobile',
    name: 'Accessibility & Mobile Standards Audit',
    command: 'node scripts/test-accessibility-and-mobile.mjs',
    requiresServer: false,
    minAssertions: 10,
    parse: (output, exitCode) => {
      const pMatch = output.match(/PASSED ASSERTIONS:\s*(\d+)/i);
      const tMatch = output.match(/TOTAL ASSERTIONS:\s*(\d+)/i);
      const passed = pMatch ? parseInt(pMatch[1], 10) : 0;
      const total = tMatch ? parseInt(tMatch[1], 10) : 0;
      if (exitCode === 0 && passed >= 10) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (WCAG 2.1 contrast, reduced motion, focus-visible, 44px tap targets)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Accessibility & mobile standards audit failed or assertions below minimum' };
    },
  },
  {
    id: 'performance-bundles',
    name: 'Performance & Bundle Efficiency Audit',
    command: 'node scripts/test-performance-and-bundles.mjs',
    requiresServer: false,
    minAssertions: 5,
    parse: (output, exitCode) => {
      const pMatch = output.match(/PASSED ASSERTIONS:\s*(\d+)/i);
      const tMatch = output.match(/TOTAL ASSERTIONS:\s*(\d+)/i);
      const passed = pMatch ? parseInt(pMatch[1], 10) : 0;
      const total = tMatch ? parseInt(tMatch[1], 10) : 0;
      if (exitCode === 0 && passed >= 5) {
        return { passed: true, assertionsPassed: passed, totalAssertions: total, details: `${passed} / ${total} assertions green (static assets < 300KB, build manifest, scene efficiency)` };
      }
      return { passed: false, assertionsPassed: passed, totalAssertions: total, details: 'Performance & bundle audit failed or assertions below minimum' };
    },
  },
];

async function runQa() {
  console.log('================================================================');
  console.log('         LOVEWRIT PRE-MERGE COMPREHENSIVE QA RUNNER             ');
  console.log('================================================================\n');

  // Guard: Confirm port 3000 is clean
  const isPortOccupied = await checkServerListening();
  if (isPortOccupied) {
    console.error('  [FAIL] Port 3000 is already in use by an external server.');
    console.error('         Please stop any running server before running QA so QA can manage its own isolated server instance.');
    process.exit(1);
  }

  const summary = [];
  let spawnedServer = null;
  const executedSuiteIds = new Set();

  const registeredIds = new Set(SUITE_REGISTRY.map((s) => s.id));
  const missingExpected = EXPECTED_SUITE_IDS.filter((id) => !registeredIds.has(id));
  if (missingExpected.length > 0) {
    console.error(`REGISTRY ERROR: Expected suite(s) missing from registry: ${missingExpected.join(', ')}\n`);
    summary.push({
      suite: 'Expected Suites Registry Guard',
      status: 'FAILED',
      details: `Expected suite(s) missing from registry: ${missingExpected.join(', ')}`,
    });
    console.log('\n================================================================');
    console.log('                     PRE-MERGE QA SUMMARY TABLE                 ');
    console.log('================================================================');
    console.table(summary);
    console.log('================================================================\n');
    console.error('SOME QA CHECKS FAILED. PLEASE REVIEW TABLE ABOVE.\n');
    process.exit(1);
  }

  try {
    for (const suite of SUITE_REGISTRY) {
      executedSuiteIds.add(suite.id);
      if (suite.requiresServer && !spawnedServer) {
        console.log('Starting isolated dev server for browser suites...\n');
        spawnedServer = await ensureServerRunning();
      }

      console.log(`[Executing] ${suite.name}...`);
      let output = '';
      let exitCode = 0;

      try {
        output = execSync(suite.command, {
          encoding: 'utf-8',
          env: { ...process.env, ...(suite.env || {}) },
        });
      } catch (err) {
        exitCode = typeof err.status === 'number' ? err.status : 1;
        output = (err.stdout ? err.stdout.toString() : '') + '\n' + (err.stderr ? err.stderr.toString() : err.message);
      }

      const parsed = suite.parse(output, exitCode);
      const suiteName = parsed.customName || suite.name;

      if (exitCode === 0 && parsed.passed) {
        console.log(`  PASS: ${suiteName} (${parsed.details})\n`);
        summary.push({
          suite: suiteName,
          status: 'PASSED',
          details: parsed.details,
        });
      } else {
        console.error(`  FAIL: ${suiteName} (exitCode: ${exitCode}, details: ${parsed.details})\n`);
        summary.push({
          suite: suiteName,
          status: 'FAILED',
          details: parsed.details || `Process exited with code ${exitCode}`,
        });
        break;
      }
    }
  } finally {
    if (spawnedServer) {
      spawnedServer.kill();
    }
  }

  // Print Summary Table
  console.log('\n================================================================');
  console.log('                     PRE-MERGE QA SUMMARY TABLE                 ');
  console.log('================================================================');
  console.table(summary);
  console.log('================================================================\n');

  // Verification checks:
  // 1. Registry completeness: Every suite in SUITE_REGISTRY must be in summary
  if (summary.length !== SUITE_REGISTRY.length) {
    console.error(`REGISTRY MISMATCH: Expected ${SUITE_REGISTRY.length} suites, but executed ${summary.length}.\n`);
    process.exit(1);
  }

  for (const expectedId of EXPECTED_SUITE_IDS) {
    if (!executedSuiteIds.has(expectedId)) {
      console.error(`EXECUTION MISMATCH: Expected suite "${expectedId}" was not executed.\n`);
      process.exit(1);
    }
  }

  // 2. Status check: Every suite must be PASSED
  const allPassed = summary.every((s) => s.status === 'PASSED');
  if (allPassed && missingExpected.length === 0) {
    console.log('ALL PRE-MERGE QA CHECKS PASSED.\n');
    process.exit(0);
  } else {
    console.error('SOME QA CHECKS FAILED. PLEASE REVIEW TABLE ABOVE.\n');
    process.exit(1);
  }
}

runQa().catch((err) => {
  console.error('Fatal QA error:', err);
  process.exit(1);
});
