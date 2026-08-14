// agent-notes: { ctx: "Self-contained test script to verify attribution source classification and URL sanitization", deps: ["lib/attribution.ts"], state: active, last: "sato@2026-08-14" }
import { classifyAttributionSource, sanitizeUrl } from '../lib/attribution';

function runTests() {
  console.log('--- RUNNING ATTRIBUTION TESTS ---');
  let passed = 0;
  let failed = 0;

  function assertEqual(actual: any, expected: any, testName: string) {
    if (actual === expected) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✕ FAIL: ${testName} (Expected "${expected}", got "${actual}")`);
      failed++;
    }
  }

  // 1. Instagram Paid
  assertEqual(
    classifyAttributionSource({ utm_source: 'instagram', utm_medium: 'paid_social' }),
    'Instagram Paid',
    'Instagram with paid_social medium classifies as Instagram Paid'
  );

  assertEqual(
    classifyAttributionSource({ utm_source: 'instagram', fbclid: 'fb_12345' }),
    'Instagram Paid',
    'Instagram with fbclid classifies as Instagram Paid'
  );

  // 2. Instagram Organic
  assertEqual(
    classifyAttributionSource({ utm_source: 'instagram', utm_medium: 'social' }),
    'Instagram Organic',
    'Instagram with organic social classifies as Instagram Organic'
  );

  assertEqual(
    classifyAttributionSource({ referrer: 'https://l.instagram.com/' }),
    'Instagram Organic',
    'Referrer from l.instagram.com classifies as Instagram Organic'
  );

  // 3. Google Ads
  assertEqual(
    classifyAttributionSource({ gclid: 'gclid_xyz789' }),
    'Google Ads',
    'GCLID present classifies as Google Ads'
  );

  assertEqual(
    classifyAttributionSource({ utm_source: 'google', utm_medium: 'cpc' }),
    'Google Ads',
    'Google with cpc medium classifies as Google Ads'
  );

  // 4. Google Organic
  assertEqual(
    classifyAttributionSource({ referrer: 'https://www.google.com/' }),
    'Google Organic',
    'Google referrer without gclid/cpc classifies as Google Organic'
  );

  // 5. YouTube
  assertEqual(
    classifyAttributionSource({ utm_source: 'youtube' }),
    'YouTube',
    'YouTube utm_source classifies as YouTube'
  );

  assertEqual(
    classifyAttributionSource({ referrer: 'https://youtu.be/abc1234' }),
    'YouTube',
    'youtu.be referrer classifies as YouTube'
  );

  // 6. ChatGPT / AI
  assertEqual(
    classifyAttributionSource({ referrer: 'https://chatgpt.com/' }),
    'ChatGPT / AI',
    'ChatGPT referrer classifies as ChatGPT / AI'
  );

  assertEqual(
    classifyAttributionSource({ utm_source: 'perplexity' }),
    'ChatGPT / AI',
    'Perplexity source classifies as ChatGPT / AI'
  );

  // 7. Direct
  assertEqual(
    classifyAttributionSource({}),
    'Direct',
    'Empty parameters classify as Direct'
  );

  assertEqual(
    classifyAttributionSource({ referrer: 'https://celitemarket.in/templates' }),
    'Direct',
    'Self-referral classifies as Direct'
  );

  // 8. Referral
  assertEqual(
    classifyAttributionSource({ referrer: 'https://techblog.io/review' }),
    'Referral',
    'External domain classifies as Referral'
  );

  // 9. URL Sanitization
  assertEqual(
    sanitizeUrl('https://celitemarket.in/product/wedding-intro?utm_source=ig&token=secret123&password=pass'),
    '/product/wedding-intro?utm_source=ig',
    'Sanitizer strips token and password from URL parameters'
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
