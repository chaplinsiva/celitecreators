/* agent-notes: { ctx: "Razorpay order creation server action API route", deps: [src/lib/razorpay.ts, src/types/marketplace.ts], state: active, last: "archie@2026-07-23" } */

import { NextResponse } from 'next/server';
import { razorpayClient } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR', productSlug } = body;

    if (!amount || !productSlug) {
      return NextResponse.json({ error: 'Missing amount or product slug' }, { status: 400 });
    }

    // Create Razorpay Order
    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        productSlug,
      },
    };

    const order = await razorpayClient.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create Razorpay order' }, { status: 500 });
  }
}
