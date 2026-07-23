/* agent-notes: { ctx: "Razorpay payment HMAC timing-safe signature verification API route", deps: [src/lib/razorpay.ts, src/lib/r2.ts], state: active, last: "archie@2026-07-23" } */

import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { getPresignedDownloadUrl } from '@/lib/r2';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sourcePathKey } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment signature verification parameters' }, { status: 400 });
    }

    // Timing-safe HMAC verification
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Generate Presigned Cloudflare R2 Download URL (15-minute TTL per ADR-0003)
    const downloadUrl = await getPresignedDownloadUrl(sourcePathKey || 'source-files/default-asset.zip', 900);

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresInSeconds: 900,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 });
  }
}
