/* agent-notes: { ctx: "unit tests for Razorpay HMAC timing-safe signature verification", deps: [src/lib/razorpay.ts], state: active, last: "tara@2026-07-23" } */

import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpaySignature, verifyRazorpayWebhookSignature } from '../razorpay';

describe('verifyRazorpaySignature', () => {
  const secret = 'test_secret_12345';
  const orderId = 'order_MOCK12345';
  const paymentId = 'pay_MOCK98765';

  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  it('validates a correct Razorpay signature', () => {
    const isValid = verifyRazorpaySignature(orderId, paymentId, validSignature, secret);
    expect(isValid).toBe(true);
  });

  it('rejects an invalid/tampered signature', () => {
    const isValid = verifyRazorpaySignature(orderId, paymentId, 'tampered_signature_string', secret);
    expect(isValid).toBe(false);
  });

  it('rejects empty or missing parameters', () => {
    expect(verifyRazorpaySignature('', paymentId, validSignature, secret)).toBe(false);
    expect(verifyRazorpaySignature(orderId, '', validSignature, secret)).toBe(false);
    expect(verifyRazorpaySignature(orderId, paymentId, '', secret)).toBe(false);
  });
});

describe('verifyRazorpayWebhookSignature', () => {
  const secret = 'whsec_test_secret';
  const rawBody = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_123' } } } });

  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  it('validates a valid webhook signature', () => {
    const isValid = verifyRazorpayWebhookSignature(rawBody, validSignature, secret);
    expect(isValid).toBe(true);
  });

  it('rejects a fake webhook payload', () => {
    const isValid = verifyRazorpayWebhookSignature('fake_body', validSignature, secret);
    expect(isValid).toBe(false);
  });
});
