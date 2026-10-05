import { getClientIp, getDeviceFingerprintLite } from '../src/lib/security.ts';

console.log('================================================================');
console.log('       🧪 UNIT TESTS: getClientIp TRUST MODEL & FALLBACKS       ');
console.log('================================================================\n');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function createMockRequest({
  headers = {},
  cookies = {},
  ip = undefined,
  socket = undefined,
} = {}) {
  const headerMap = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  const cookieMap = new Map(Object.entries(cookies));

  return {
    headers: {
      get(name) {
        return headerMap.get(name.toLowerCase()) || null;
      }
    },
    cookies: {
      get(name) {
        const val = cookieMap.get(name);
        return val !== undefined ? { value: val } : undefined;
      }
    },
    ip,
    socket: socket ? { remoteAddress: socket } : undefined,
  };
}

// -----------------------------------------------------------------------------
// CASE 1: Platform Trust when process.env.VERCEL is set
// -----------------------------------------------------------------------------
console.log('[CASE 1] process.env.VERCEL is set (Vercel Edge Network)...');
process.env.VERCEL = '1';

const reqVercelForwarded = createMockRequest({
  headers: {
    'x-forwarded-for': '203.0.113.195, 10.0.0.1',
    'user-agent': 'VercelClient/1.0',
  }
});
assert(
  getClientIp(reqVercelForwarded) === '203.0.113.195',
  'On Vercel: trusts leftmost IP from x-forwarded-for ("203.0.113.195")'
);

const reqVercelRealIp = createMockRequest({
  headers: {
    'x-real-ip': '198.51.100.42',
    'user-agent': 'VercelClient/1.0',
  }
});
assert(
  getClientIp(reqVercelRealIp) === '198.51.100.42',
  'On Vercel: trusts x-real-ip when x-forwarded-for absent'
);

// -----------------------------------------------------------------------------
// CASE 2: Non-Vercel (Untrusted Edge / Direct / Local)
// -----------------------------------------------------------------------------
console.log('\n[CASE 2] process.env.VERCEL is NOT set (Untrusted Ingress)...');
delete process.env.VERCEL;

const reqSpoofed = createMockRequest({
  headers: {
    'x-forwarded-for': '198.51.100.77, 10.0.0.1',
    'x-real-ip': '198.51.100.77',
    'user-agent': 'AttackerBrowser/1.0',
  },
  ip: '192.168.1.50',
});
const resolvedSpoofed = getClientIp(reqSpoofed);
assert(
  resolvedSpoofed !== '198.51.100.77',
  'Non-Vercel: client-provided x-forwarded-for is NOT trusted (spoofing prevented)'
);
assert(
  resolvedSpoofed === '192.168.1.50',
  'Non-Vercel: verified socket/connection address (192.168.1.50) is used'
);

// Test socket.remoteAddress normalization
const reqSocketIpv6 = createMockRequest({
  headers: { 'user-agent': 'NodeClient/1.0' },
  socket: '::ffff:192.168.1.99',
});
assert(
  getClientIp(reqSocketIpv6) === '192.168.1.99',
  'Non-Vercel: socket.remoteAddress normalized from IPv4-mapped IPv6'
);

// -----------------------------------------------------------------------------
// CASE 3: Never Shared '127.0.0.1' Bucket
// -----------------------------------------------------------------------------
console.log('\n[CASE 3] Fallback & Isolation: Never use a shared 127.0.0.1 bucket...');

// 3a. Fallback to client device cookie when no socket IP
const reqDeviceCookie = createMockRequest({
  headers: { 'user-agent': 'MobileUser/1.0' },
  cookies: { 'lovewrit_device_id': 'device_uuid_98765' },
  ip: '127.0.0.1', // local loopback
});
const resolvedDeviceCookie = getClientIp(reqDeviceCookie);
assert(
  resolvedDeviceCookie === 'device_device_uuid_98765',
  'Fallback: keys on lovewrit_device_id cookie when IP is loopback'
);
assert(
  resolvedDeviceCookie !== '127.0.0.1',
  'Fallback: NEVER returns shared "127.0.0.1" for client with cookie'
);

// 3b. Fallback to hashed fingerprint when no IP and no cookie
const reqUserA = createMockRequest({
  headers: {
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    'accept-language': 'en-US,en;q=0.9',
  },
  ip: '127.0.0.1',
});

const reqUserB = createMockRequest({
  headers: {
    'user-agent': 'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
    'accept-language': 'hi-IN,hi;q=0.9',
  },
  ip: '127.0.0.1',
});

const idUserA = getClientIp(reqUserA);
const idUserB = getClientIp(reqUserB);

assert(
  idUserA.startsWith('anon_'),
  'Fallback: keys on anonymized fingerprint hash when no socket IP and no cookie'
);
assert(
  idUserA !== '127.0.0.1' && idUserB !== '127.0.0.1',
  'Fallback: NEVER dumps cookieless users into a shared "127.0.0.1" bucket'
);
assert(
  idUserA !== idUserB,
  'Fallback: User A and User B receive distinct isolated rate-limiting buckets'
);

// Verify getDeviceFingerprintLite
const fpA = getDeviceFingerprintLite(reqUserA);
const fpB = getDeviceFingerprintLite(reqUserB);
assert(
  Boolean(fpA && fpA.length === 64),
  'getDeviceFingerprintLite generates valid 64-char sha256 hash'
);
assert(
  fpA !== fpB,
  'getDeviceFingerprintLite generates distinct fingerprints for distinct clients'
);

console.log(`\n🎉 ALL getClientIp & SECURITY TRUST UNIT TESTS PASSED! (${passed} / ${total})\n`);
