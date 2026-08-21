import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const admin = getSupabaseAdminClient();

    // Verify admin user
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
    if (!token) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes.user) return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
    const userId = userRes.user.id;
    const { data: isAdmin } = await admin.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });

    // 1. Get all creator shops with full contact/payout fields
    const { data: shops, error: shopsError } = await admin
      .from('creator_shops')
      .select(`
        id,
        slug,
        name,
        description,
        direct_upload_enabled,
        created_at,
        user_id,
        phone,
        email,
        joined_community,
        bank_upi_id,
        bank_account_name,
        bank_account_number,
        bank_ifsc
      `)
      .order('created_at', { ascending: false });

    if (shopsError) {
      console.error('Error fetching creator shops table:', shopsError);
      return NextResponse.json({ ok: false, error: shopsError.message }, { status: 500 });
    }

    // 2. Fetch auth user emails safely
    let userEmailMap = new Map<string, string>();
    try {
      const { data: usersData } = await admin.auth.admin.listUsers();
      if (usersData?.users) {
        userEmailMap = new Map(usersData.users.map(u => [u.id, u.email || '']));
      }
    } catch (e) {
      console.warn('Could not list auth users for email fallback:', e);
    }

    const shopIds = (shops || []).map(s => s.id);

    // 3. Fetch order items for sales & earnings
    let orderItems: any[] = [];
    if (shopIds.length > 0) {
      const { data: items } = await admin
        .from('order_items')
        .select('creator_shop_id, price, creator_earnings')
        .in('creator_shop_id', shopIds);
      orderItems = items || [];
    }

    // 4. Fetch payout requests
    let payoutRequests: any[] = [];
    if (shopIds.length > 0) {
      const { data: payouts } = await admin
        .from('payout_requests')
        .select('creator_shop_id, amount, status')
        .in('creator_shop_id', shopIds);
      payoutRequests = payouts || [];
    }

    // 5. Fetch templates summary
    let templates: any[] = [];
    if (shopIds.length > 0) {
      const { data: tpls } = await admin
        .from('templates')
        .select('creator_shop_id, slug, name, status, price, created_at')
        .in('creator_shop_id', shopIds);
      templates = tpls || [];
    }

    // 6. Build enriched shop objects
    const enrichedShops = (shops || []).map((shop) => {
      const shopOrderItems = orderItems.filter((i) => i.creator_shop_id === shop.id);
      const shopPayouts = payoutRequests.filter((p) => p.creator_shop_id === shop.id);
      const shopTemplates = templates.filter((t) => t.creator_shop_id === shop.id);

      let grossRevenue = 0;
      let lifetimeEarnings = 0;
      for (const item of shopOrderItems) {
        const price = Number(item.price) || 0;
        grossRevenue += price;
        if (item.creator_earnings !== null && item.creator_earnings !== undefined && Number(item.creator_earnings) > 0) {
          lifetimeEarnings += Number(item.creator_earnings);
        } else {
          lifetimeEarnings += Math.round(price * 0.8 * 100) / 100;
        }
      }

      let paidOutAmount = 0;
      let pendingPayoutAmount = 0;
      for (const req of shopPayouts) {
        const amt = Number(req.amount) || 0;
        const s = (req.status || 'pending').toLowerCase().trim();
        if (s === 'approved') {
          paidOutAmount += amt;
        } else if (s === 'pending') {
          pendingPayoutAmount += amt;
        }
      }

      const holdingBalance = Math.max(0, Math.round((lifetimeEarnings - paidOutAmount) * 100) / 100);

      const approvedTemplatesCount = shopTemplates.filter(t => (t.status || 'pending') === 'approved').length;
      const pendingTemplatesCount = shopTemplates.filter(t => (t.status || 'pending') === 'pending').length;
      const rejectedTemplatesCount = shopTemplates.filter(t => (t.status || 'pending') === 'rejected').length;

      const primaryEmail = shop.email || userEmailMap.get(shop.user_id) || null;

      return {
        ...shop,
        email: primaryEmail,
        users: { id: shop.user_id, email: primaryEmail },
        financials: {
          totalSales: shopOrderItems.length,
          grossRevenue: Math.round(grossRevenue * 100) / 100,
          lifetimeEarnings: Math.round(lifetimeEarnings * 100) / 100,
          paidOutAmount: Math.round(paidOutAmount * 100) / 100,
          holdingBalance,
          pendingPayoutAmount: Math.round(pendingPayoutAmount * 100) / 100,
        },
        templateMetrics: {
          total: shopTemplates.length,
          approved: approvedTemplatesCount,
          pending: pendingTemplatesCount,
          rejected: rejectedTemplatesCount,
        },
        templates: shopTemplates.slice(0, 10),
      };
    });

    return NextResponse.json({ ok: true, shops: enrichedShops });
  } catch (e: any) {
    console.error('Error fetching creator shops:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = getSupabaseAdminClient();

    // Verify admin user
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
    if (!token) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes.user) return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
    const userId = userRes.user.id;
    const { data: isAdmin } = await admin.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { shop_id, direct_upload_enabled } = body;

    if (!shop_id || typeof direct_upload_enabled !== 'boolean') {
      return NextResponse.json({ ok: false, error: 'Missing shop_id or direct_upload_enabled' }, { status: 400 });
    }

    // Update the creator shop
    const { data, error } = await admin
      .from('creator_shops')
      .update({ direct_upload_enabled })
      .eq('id', shop_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, shop: data });
  } catch (e: any) {
    console.error('Error updating creator shop:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

