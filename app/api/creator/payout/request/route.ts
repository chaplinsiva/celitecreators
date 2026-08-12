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
    const [templatesRes, downloadsRes, orderItemsRes, payoutsRes] = await Promise.all([
      admin.from('templates').select('id').eq('creator_shop_id', shop.id),
      admin.from('downloads').select('user_id, downloaded_at').eq('creator_shop_id', shop.id),
      admin.from('order_items').select('price, creator_earnings, orders!inner(status)').eq('creator_shop_id', shop.id).eq('orders.status', 'paid'),
      admin.from('payout_requests').select('amount, status').eq('creator_shop_id', shop.id)
    ]);

    const downloads = downloadsRes.data || [];
    let uniqueUserPeriods = 0;
    if (downloads.length > 0) {
      const byUser = new Map<string, Date[]>();
      for (const d of downloads as any[]) {
        if (!d.user_id || !d.downloaded_at) continue;
        const arr = byUser.get(d.user_id) || [];
        arr.push(new Date(d.downloaded_at));
        byUser.set(d.user_id, arr);
      }
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      byUser.forEach((dates) => {
        dates.sort((a, b) => a.getTime() - b.getTime());
        let lastCounted: Date | null = null;
        for (const dt of dates) {
          if (!lastCounted) {
            uniqueUserPeriods += 1;
            lastCounted = dt;
          } else if (dt.getTime() - lastCounted.getTime() > THIRTY_DAYS_MS) {
            uniqueUserPeriods += 1;
            lastCounted = dt;
          }
        }
      });
    }

    const subscriptionPoolRevenue = uniqueUserPeriods * 40;
    const marketplaceSalesRevenue = (orderItemsRes.data || []).reduce((sum: number, item: any) => {
      const earnings = Number(item.creator_earnings) || (Number(item.price || 0) * 0.8);
      return sum + earnings;
    }, 0);

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
