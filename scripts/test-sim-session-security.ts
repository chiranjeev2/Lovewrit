import assert from 'assert';
import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/checkout/route';
import { GET } from '../src/app/api/checkout/verify/route';

console.log('================================================================');
console.log('   🔒 SECURITY TEST: sim_ SESSION ID BEHAVIOR IN PRODUCTION     ');
console.log('================================================================\n');

async function runSecurityTests() {
  const originalNodeEnv = process.env.NODE_ENV;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: POST /api/checkout rejects simulated checkouts when NODE_ENV=production
    // -------------------------------------------------------------------------
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    const checkoutReq = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType: 'CARD',
        templateId: 'forever-proposal',
        tier: 'SELF_SERVICE',
        customerName: 'Security Audit Buyer',
        customerEmail: 'audit@example.com',
        cardData: {
          senderName: 'Dev',
          recipientName: 'Ananya',
          occasion: 'proposal',
          message: 'Security test message',
        },
      }),
    });

    const checkoutRes = await POST(checkoutReq);
    assert.strictEqual(checkoutRes.status, 500, 'POST /api/checkout must return status 500 when sim checkout attempted in production');
    const checkoutBody = await checkoutRes.json();
    assert(
      checkoutBody.error && checkoutBody.error.includes('strictly disabled in production'),
      'POST /api/checkout error message must explicitly state simulated checkouts are disabled in production'
    );
    console.log('  ✅ [PASS] Real Handler POST /api/checkout: Blocked sim_ checkout with 500 error in production');

    // -------------------------------------------------------------------------
    // TEST 2: GET /api/checkout/verify rejects sim_ sessions when NODE_ENV=production
    // -------------------------------------------------------------------------
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    const verifyReqProd = new NextRequest('http://localhost:3000/api/checkout/verify?session_id=sim_order_hacked_999');
    const verifyResProd = await GET(verifyReqProd);
    assert.strictEqual(verifyResProd.status, 403, 'GET /api/checkout/verify must return 403 Forbidden for sim_ sessions in production');
    const verifyBodyProd = await verifyResProd.json();
    assert(
      verifyBodyProd.error && verifyBodyProd.error.includes('strictly forbidden in production'),
      'GET /api/checkout/verify must return forbidden error message for sim_ in production'
    );
    console.log('  ✅ [PASS] Real Handler GET /api/checkout/verify: Blocked sim_ verification with 403 Forbidden in production');

    // -------------------------------------------------------------------------
    // TEST 3: GET /api/checkout/verify allows sim_ sessions when NODE_ENV != production
    // -------------------------------------------------------------------------
    (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
    const verifyReqTest = new NextRequest('http://localhost:3000/api/checkout/verify?session_id=sim_order_test_123');
    const verifyResTest = await GET(verifyReqTest);
    // In test environment, it doesn't block with 403 (it proceeds to DB update; if order not found in mock/test DB, it returns 404 or succeeds, not 403)
    assert.notStrictEqual(verifyResTest.status, 403, 'GET /api/checkout/verify must NOT block sim_ sessions with 403 when NODE_ENV != production');
    console.log('  ✅ [PASS] Real Handler Isolation: sim_ verification not blocked by production guard when NODE_ENV!=production');

    console.log('\nALL sim_ SESSION PRODUCTION SECURITY ASSERTIONS PASSED (3 / 3)\n');
  } finally {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
  }
}

runSecurityTests().catch((err) => {
  console.error('sim_ session security test failed:', err);
  process.exit(1);
});
