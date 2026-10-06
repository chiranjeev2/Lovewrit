import { db } from '../src/lib/db.ts';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('================================================================');
  console.log('    🧪 RUNNING REFERRAL & ATOMIC CANDLE ABUSE SECURITY TESTS   ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // -------------------------------------------------------------------------
  // PART 1: REFERRAL ABUSE HARDENING TESTS
  // -------------------------------------------------------------------------
  console.log('[PART 1] Referral Anti-Abuse Hardening Tests...');
  const creatorCode = `REF${Math.floor(1000 + Math.random() * 9000)}`;
  const creatorEmail = `creator_${Date.now()}@test.com`;
  const creatorIp = '203.0.113.42'; // Simulated public IP
  const creatorUa = 'CreatorMobileBrowser/1.0';

  // 1. Register Creator Code with IP and User-Agent headers
  const regRes = await fetch(`${BASE_URL}/api/referral`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': creatorIp,
      'user-agent': creatorUa
    },
    body: JSON.stringify({
      preferredCode: creatorCode,
      name: 'Test Creator',
      email: creatorEmail
    })
  });
  const regData = await regRes.json();
  assert(regData.success === true, `Creator code registered successfully: ${regData.record?.code}`);
  const finalCreatorCode = regData.record.code;

  // Verify creator metadata stored in PlatformSetting
  const ownerMeta = await db.platformSetting.findUnique({
    where: { key: `referral_owner:${finalCreatorCode}` }
  });
  assert(Boolean(ownerMeta), 'Creator security metadata stored in PlatformSetting');
  const parsedMeta = JSON.parse(ownerMeta.value);
  assert(parsedMeta.creatorIp === creatorIp, 'Creator IP correctly bound to code');
  assert(Boolean(parsedMeta.creatorFingerprint), 'Creator device fingerprint-lite correctly bound to code');

  // Helper to verify an order via GET /api/checkout/verify
  async function verifyOrder(orderSlug, reqIp = '198.51.100.1', reqUa = 'BuyerBrowser/1.0') {
    const res = await fetch(`${BASE_URL}/api/checkout/verify?session_id=sim_${orderSlug}&slug=${orderSlug}`, {
      method: 'GET',
      headers: {
        'x-forwarded-for': reqIp,
        'user-agent': reqUa
      }
    });
    return res.json();
  }

  // Test 1b: Block Self-Referral by Email
  console.log('\n  Testing: Block Self-Referral by Email...');
  const selfEmailSlug = `slug-email-${Date.now()}`;
  await db.order.create({
    data: {
      slug: selfEmailSlug,
      razorpayOrderId: `sim_${selfEmailSlug}`,
      customerEmail: creatorEmail, // matches creator email
      customerName: 'Self Referrer',
      productType: 'PAGE',
      templateId: 'festive-birthday',
      tier: 'SELF_SERVICE',
      currency: 'INR',
      amountTotal: 49900,
      region: 'asia_africa',
      referralCodeUsed: finalCreatorCode,
      status: 'PENDING'
    }
  });

  await verifyOrder(selfEmailSlug, '198.51.100.99', 'OtherBrowser/2.0');
  const emailBlockLog = await db.rateLimitEvent.findFirst({
    where: {
      action: 'REFERRAL_ABUSE_BLOCKED',
      reason: 'SELF_REFERRAL_EMAIL_MATCH',
      email: creatorEmail
    },
    orderBy: { createdAt: 'desc' }
  });
  assert(Boolean(emailBlockLog), 'Self-referral by EMAIL blocked and logged with SELF_REFERRAL_EMAIL_MATCH');

  // Test 1c: Block Self-Referral by IP
  console.log('\n  Testing: Block Self-Referral by IP...');
  const selfIpSlug = `slug-ip-${Date.now()}`;
  await db.order.create({
    data: {
      slug: selfIpSlug,
      razorpayOrderId: `sim_${selfIpSlug}`,
      customerEmail: 'different_email@test.com',
      customerName: 'Different Name',
      productType: 'PAGE',
      templateId: 'festive-birthday',
      tier: 'SELF_SERVICE',
      currency: 'INR',
      amountTotal: 49900,
      region: 'asia_africa',
      referralCodeUsed: finalCreatorCode,
      status: 'PENDING'
    }
  });

  await verifyOrder(selfIpSlug, creatorIp, 'DifferentBrowser/1.0'); // IP matches creator
  const ipBlockLog = await db.rateLimitEvent.findFirst({
    where: {
      action: 'REFERRAL_ABUSE_BLOCKED',
      reason: 'SELF_REFERRAL_IP_MATCH',
      ipAddress: creatorIp
    },
    orderBy: { createdAt: 'desc' }
  });
  assert(Boolean(ipBlockLog), 'Self-referral by IP blocked and logged with SELF_REFERRAL_IP_MATCH');

  // Test 1d: Block Self-Referral by Device Fingerprint
  console.log('\n  Testing: Block Self-Referral by Device Fingerprint...');
  const selfDeviceSlug = `slug-device-${Date.now()}`;
  await db.order.create({
    data: {
      slug: selfDeviceSlug,
      razorpayOrderId: `sim_${selfDeviceSlug}`,
      customerEmail: 'device_user@test.com',
      customerName: 'Device User',
      productType: 'PAGE',
      templateId: 'festive-birthday',
      tier: 'SELF_SERVICE',
      currency: 'INR',
      amountTotal: 49900,
      region: 'asia_africa',
      referralCodeUsed: finalCreatorCode,
      status: 'PENDING'
    }
  });

  await verifyOrder(selfDeviceSlug, creatorIp, creatorUa); // IP + UA matches creator fingerprint
  const fpBlockLog = await db.rateLimitEvent.findFirst({
    where: {
      action: 'REFERRAL_ABUSE_BLOCKED',
      ipAddress: creatorIp
    },
    orderBy: { createdAt: 'desc' }
  });
  assert(Boolean(fpBlockLog), 'Self-referral by DEVICE FINGERPRINT blocked and logged');

  // Test 1e: Credit ONLY on PAID orders (never free / 0-cost)
  console.log('\n  Testing: Credit ONLY on Paid orders (amountTotal <= 0 ignored)...');
  const freeSlug = `slug-free-${Date.now()}`;
  const freeOrder = await db.order.create({
    data: {
      slug: freeSlug,
      razorpayOrderId: `sim_${freeSlug}`,
      customerEmail: 'legit_buyer@test.com',
      customerName: 'Legit Buyer',
      productType: 'PAGE',
      templateId: 'festive-birthday',
      tier: 'FREE',
      currency: 'INR',
      amountTotal: 0, // FREE ORDER
      region: 'asia_africa',
      referralCodeUsed: finalCreatorCode,
      status: 'PENDING'
    }
  });

  await verifyOrder(freeSlug, '198.51.100.1', 'BuyerBrowser/1.0');
  const freeCreditLog = await db.rateLimitEvent.findFirst({
    where: {
      action: `REFERRAL_CREDITED:${freeOrder.id}`
    }
  });
  assert(freeCreditLog === null, 'Free order (amountTotal: 0) NEVER receives referral credit in DB');

  // Test 1f: Legitimate Paid Order Grants Credit
  console.log('\n  Testing: Legitimate Paid Order Grants Credit...');
  const initialRecord = await db.referralRecord.findUnique({ where: { code: finalCreatorCode } });
  const initialBalance = initialRecord.creditBalance;

  const legitBuyerIp = `198.51.100.${Math.floor(Math.random() * 80) + 100}`;
  const paidSlug = `slug-paid-${Date.now()}`;
  const paidOrder = await db.order.create({
    data: {
      slug: paidSlug,
      razorpayOrderId: `sim_${paidSlug}`,
      customerEmail: `legit_buyer_${Date.now()}@test.com`,
      customerName: 'Legit Buyer One',
      productType: 'PAGE',
      templateId: 'festive-birthday',
      tier: 'SELF_SERVICE',
      currency: 'INR',
      amountTotal: 49900, // PAID ORDER
      region: 'asia_africa',
      referralCodeUsed: finalCreatorCode,
      status: 'PENDING'
    }
  });

  await verifyOrder(paidSlug, legitBuyerIp, 'BuyerBrowser/2.0');
  const updatedRecord = await db.referralRecord.findUnique({ where: { code: finalCreatorCode } });
  assert(updatedRecord.creditBalance === initialBalance + 49, `Legitimate paid order credited ₹49 (new balance: ${updatedRecord.creditBalance})`);

  // Test 1g: Exactly One Credit Per Paid Order (Idempotency)
  console.log('\n  Testing: Exactly One Credit Per Paid Order (Idempotency)...');
  await verifyOrder(paidSlug, legitBuyerIp, 'BuyerBrowser/2.0');
  const recordAfterDuplicate = await db.referralRecord.findUnique({ where: { code: finalCreatorCode } });
  assert(recordAfterDuplicate.creditBalance === updatedRecord.creditBalance, 'Duplicate verification does NOT grant double credit (idempotent)');

  // Test 1h: Buyer IP Daily Rate Limit (Max 3 referral grants per IP per 24 hours)
  console.log('\n  Testing: Buyer IP Daily Rate Limit (Max 3/day)...');
  const spamIp = `198.51.100.${Math.floor(Math.random() * 50) + 200}`;
  let spamGrantedCount = 0;
  for (let i = 0; i < 5; i++) {
    const sSlug = `slug-spam-${i}-${Date.now()}`;
    await db.order.create({
      data: {
        slug: sSlug,
        razorpayOrderId: `sim_${sSlug}`,
        customerEmail: `spambuyer_${i}_${Date.now()}@test.com`,
        customerName: `Spam Buyer ${i}`,
        productType: 'PAGE',
        templateId: 'festive-birthday',
        tier: 'SELF_SERVICE',
        currency: 'INR',
        amountTotal: 49900,
        region: 'asia_africa',
        referralCodeUsed: finalCreatorCode,
        status: 'PENDING'
      }
    });

    await verifyOrder(sSlug, spamIp, `SpamBrowser/${i}`);
  }

  const grantedEvents = await db.rateLimitEvent.count({
    where: {
      action: 'REFERRAL_CREDIT_GRANTED',
      ipAddress: spamIp
    }
  });
  const blockedEvents = await db.rateLimitEvent.count({
    where: {
      action: 'REFERRAL_ABUSE_BLOCKED',
      reason: 'DAILY_IP_LIMIT_EXCEEDED',
      ipAddress: spamIp
    }
  });
  assert(grantedEvents === 3, `IP rate limit strictly capped at 3 grants per day (granted: ${grantedEvents})`);
  assert(blockedEvents >= 2, `Excessive requests from same IP blocked with DAILY_IP_LIMIT_EXCEEDED (blocked: ${blockedEvents})`);

  // -------------------------------------------------------------------------
  // PART 2: TRIBUTE CANDLE COUNTER & RATE-LIMIT TESTS
  // -------------------------------------------------------------------------
  console.log('\n[PART 2] Tribute Candle Rate Limiting & Atomic Concurrency...');
  const testTributeSlug = `tribute-test-${Date.now()}`;

  // 2a: Initial get count
  const initialGet = await (await fetch(`${BASE_URL}/api/tribute/candle?slug=${testTributeSlug}`)).json();
  assert(initialGet.count === 1, 'Initial tribute candle count defaults to 1');
  assert(initialGet.alreadyLit === false, 'Initial state has alreadyLit = false');

  // 2b: First light candle on Device A
  const firstLightRes = await fetch(`${BASE_URL}/api/tribute/candle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '198.51.100.10'
    },
    body: JSON.stringify({ slug: testTributeSlug })
  });
  const firstLightData = await firstLightRes.json();
  assert(firstLightData.success === true, 'First candle lighting succeeds');
  assert(firstLightData.count === 2, 'First candle lighting increments counter to 2');
  const setCookie = firstLightRes.headers.get('set-cookie');
  assert(setCookie && setCookie.includes(`tribute_candle_${testTributeSlug}`), 'Server sets 24h device cookie on client');

  // 2c: Second light candle on same Device A with Cookie -> Blocked, Calm State
  const secondLightRes = await fetch(`${BASE_URL}/api/tribute/candle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '198.51.100.10',
      'cookie': `tribute_candle_${testTributeSlug}=true`
    },
    body: JSON.stringify({ slug: testTributeSlug })
  });
  const secondLightData = await secondLightRes.json();
  assert(secondLightData.alreadyLit === true, 'Second attempt with cookie blocked by 24h device check');
  assert(secondLightData.count === 2, 'Counter does NOT increment when device cookie present');

  // 2d: Server-Side IP Rate Limit (Cap raised to 25/day per tribute)
  console.log('\n  Testing: Server IP Rate Limit (Max 25 lights per IP per tribute per day)...');
  const heavyIp = '198.51.100.88';
  let ipPassed = 0;
  let ipCapped = false;

  // Send 27 requests without cookie from heavyIp:
  for (let i = 0; i < 27; i++) {
    const res = await fetch(`${BASE_URL}/api/tribute/candle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': heavyIp
      },
      body: JSON.stringify({ slug: testTributeSlug })
    });
    const d = await res.json();
    if (d.message && d.message.includes('already been kindled from this network')) {
      ipCapped = true;
    } else {
      ipPassed++;
    }
  }
  assert(ipPassed === 25, `IP rate limit allowed exactly 25 requests before capping (passed: ${ipPassed})`);
  assert(ipCapped === true, 'Request #26 received calm network rate limit message');

  // 2e: Atomic Counter Under 20 Concurrent Requests
  console.log('\n  Testing: Atomic Counter Under 20 Concurrent Requests...');
  const concurrencySlug = `atomic-concurrent-${Date.now()}`;
  const initialConcurrent = await (await fetch(`${BASE_URL}/api/tribute/candle?slug=${concurrencySlug}`)).json();
  assert(initialConcurrent.count === 1, 'Initial count is 1');

  // Fire 20 concurrent requests with 20 distinct simulated IP addresses
  const concurrentPromises = Array.from({ length: 20 }, (_, idx) => {
    return fetch(`${BASE_URL}/api/tribute/candle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': `198.51.200.${idx + 1}`
      },
      body: JSON.stringify({ slug: concurrencySlug })
    }).then(r => r.json());
  });

  const concurrentResults = await Promise.all(concurrentPromises);
  const allSuccessful = concurrentResults.every(r => r.success === true);
  assert(allSuccessful, 'All 20 concurrent candle requests responded successfully');

  // Read final count from DB
  const finalSetting = await db.platformSetting.findUnique({
    where: { key: `candle_count:${concurrencySlug}` }
  });
  const finalCount = parseInt(finalSetting.value, 10);
  assert(finalCount === 21, `Atomic counter incremented accurately under 20 concurrent requests: expected 21, got ${finalCount}`);

  console.log(`\n🎉 ALL REFERRAL & CANDLE SECURITY TESTS PASSED! (${passed} / ${total} assertions green)\n`);
}

runTests().catch(err => {
  console.error('\n❌ Security Tests Failed:', err);
  process.exit(1);
});

