// agent-notes: { ctx: "API route for creators to request payout withdrawals", deps: ["lib/supabaseAdmin.ts"], state: active, last: "antigravity@2026-08-13" }
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdminClient();

    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes.user) {
      return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
    }

    const userId = userRes.user.id;

    const { data: shop } = await admin
      .from('creator_shops')
      .select('id, bank_account_name, bank_account_number, bank_ifsc, bank_upi_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!shop) {
      return NextResponse.json({ ok: false, error: 'Creator shop not found' }, { status: 404 });
    }

    // Check for existing pending payout request
    const { data: existingPending } = await admin
      .from('payout_requests')
      .select('id')
      .eq('creator_shop_id', shop.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingPending) {
      return NextResponse.json({ ok: false, error: 'You already have a pending payout request under review.' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount || 0);

    if (amount < 800) {
      return NextResponse.json({ ok: false, error: 'Minimum payout request threshold is ₹800' }, { status: 400 });
    }

    // Calculate gross earnings and previous payouts to verify withdrawable balance
    const [templatesRes, payoutsRes] = await Promise.all([
      admin.from('templates').select('slug').eq('creator_shop_id', shop.id),
      admin.from('payout_requests').select('amount, status').eq('creator_shop_id', shop.id)
    ]);

    const templateSlugs = (templatesRes.data || []).map((t: any) => t.slug);
    
    // Fetch order items with OR condition to support older items without creator_shop_id
    const orderItemsQuery = admin
      .from('order_items')
      .select('price, creator_earnings, orders!inner(status)')
      .eq('orders.status', 'paid');

    if (templateSlugs.length > 0) {
      orderItemsQuery.or(`creator_shop_id.eq.${shop.id},slug.in.(${templateSlugs.join(',')})`);
    } else {
      orderItemsQuery.eq('creator_shop_id', shop.id);
    }

    const { data: orderItemsData } = await orderItemsQuery;

    const marketplaceSalesRevenue = (orderItemsData || []).reduce((sum: number, item: any) => {
      const earnings = Number(item.creator_earnings) || (Number(item.price || 0) * 0.8);
      return sum + earnings;
    }, 0);

    // Calculate proportional subscription pool revenue:
    // 1. Total subscription revenue pool from checkout_details
    const { data: subRevenueRes } = await admin
      .from('checkout_details')
      .select('total_amount')
      .eq('status', 'completed')
      .eq('checkout_type', 'subscription');

    const totalSubscriptionRevenue = (subRevenueRes || []).reduce(
      (sum: number, item: any) => sum + Number(item.total_amount || 0),
      0
    );
    const totalVendorPool = totalSubscriptionRevenue * 0.40;

    // 2. Total platform subscriber downloads (subscription_id IS NOT NULL, non-official shops)
    const { count: totalPlatformSubscriberDownloads } = await admin
      .from('downloads')
      .select('id, templates!inner(creator_shops!inner(is_celite_official))', { count: 'exact', head: true })
      .not('subscription_id', 'is', null)
      .eq('templates.creator_shops.is_celite_official', false);

    const totalPlatformSubDls = totalPlatformSubscriberDownloads || 1;

    // 3. Vendor subscriber downloads (subscription_id IS NOT NULL, joined templates creator_shop_id)
    const { count: vendorSubscriberDownloads } = await admin
      .from('downloads')
      .select('id, templates!inner(creator_shop_id)', { count: 'exact', head: true })
      .not('subscription_id', 'is', null)
      .eq('templates.creator_shop_id', shop.id);

    const vendorSubDls = vendorSubscriberDownloads || 0;

    // 4. Vendor Proportional Split
    const subscriptionPoolRevenue = totalVendorPool * (vendorSubDls / totalPlatformSubDls);

    const totalEarnings = subscriptionPoolRevenue + marketplaceSalesRevenue;
    const existingPayouts = payoutsRes.data || [];
    const paidOut = existingPayouts.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    const pendingPayout = existingPayouts.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    const availableBalance = Math.max(0, totalEarnings - paidOut - pendingPayout);

    if (amount > availableBalance) {
      return NextResponse.json({ ok: false, error: `Requested payout amount (₹${amount}) exceeds available withdrawable balance (₹${availableBalance.toFixed(2)})` }, { status: 400 });
    }

    const { data: inserted, error: insertErr } = await admin
      .from('payout_requests')
      .insert({
        creator_shop_id: shop.id,
        user_id: userId,
        amount,
        bank_account_name: shop.bank_account_name || null,
        bank_account_number: shop.bank_account_number || null,
        bank_ifsc: shop.bank_ifsc || null,
        bank_upi_id: shop.bank_upi_id || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertErr || !inserted) {
      return NextResponse.json({ ok: false, error: insertErr?.message || 'Failed to submit payout request' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, payout_id: inserted.id });
  } catch (e: any) {
    console.error('Creator Payout Request Error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
