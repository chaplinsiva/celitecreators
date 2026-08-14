// agent-notes: { ctx: "Admin API route to fetch product checkout logs enriched with attribution touchpoint data", deps: ["lib/supabaseAdmin.ts"], state: active, last: "sato@2026-08-14" }
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const admin = getSupabaseAdminClient();
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
    if (!token) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { data: me, error: meErr } = await admin.auth.getUser(token);
    if (meErr || !me.user) return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
    const { data: isAdmin } = await admin.from('admins').select('user_id').eq('user_id', me.user.id).maybeSingle();
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });

    // Fetch productcheckouts sorted by latest first
    const { data: checkouts, error } = await admin
      .from('productcheckout')
      .select('id,user_id,billing_name,billing_email,billing_mobile,cart_items,total_amount,status,razorpay_order_id,razorpay_payment_id,order_id,created_at,updated_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    const checkoutIds = (checkouts || []).map((c: any) => c.id).filter(Boolean);
    const userIds = Array.from(new Set((checkouts || []).map((c: any) => c.user_id).filter(Boolean)));

    // Fetch order_attributions
    let orderAttributionsMap: Record<string, any> = {};
    if (checkoutIds.length > 0) {
      const { data: orderAttrs } = await admin
        .from('order_attributions')
        .select('*')
        .in('checkout_id', checkoutIds);

      (orderAttrs || []).forEach((oa: any) => {
        if (oa.checkout_id) orderAttributionsMap[oa.checkout_id] = oa;
      });
    }

    // Fetch visitor_attributions for user touchpoint fallback
    let visitorAttributionsMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: visitorAttrs } = await admin
        .from('visitor_attributions')
        .select('*')
        .in('user_id', userIds);

      (visitorAttrs || []).forEach((va: any) => {
        if (va.user_id) visitorAttributionsMap[va.user_id] = va;
      });
    }

    const formattedData = (checkouts || []).map((item: any) => {
      const orderAttr = orderAttributionsMap[item.id];
      const visitorAttr = visitorAttributionsMap[item.user_id];
      const attr = orderAttr || visitorAttr || null;

      // Extract products from cart_items if present
      let itemsList: any[] = [];
      if (item.cart_items) {
        if (Array.isArray(item.cart_items)) {
          itemsList = item.cart_items;
        } else if (typeof item.cart_items === 'string') {
          try {
            itemsList = JSON.parse(item.cart_items);
          } catch {}
        }
      }

      return {
        ...item,
        checkout_type: 'product',
        subscription_plan: null,
        razorpay_subscription_id: null,
        cart_items_parsed: itemsList,
        attribution: attr
          ? {
              first_source: attr.first_source || 'Direct',
              first_medium: attr.first_medium || null,
              first_campaign: attr.first_campaign || null,
              first_content: attr.first_content || null,
              first_term: attr.first_term || null,
              first_landing_page: attr.first_landing_page || null,
              first_referrer: attr.first_referrer || null,
              first_product_viewed: attr.first_product_viewed || null,
              first_visit_at: attr.first_visit_at || null,
              last_source: attr.last_source || 'Direct',
              last_medium: attr.last_medium || null,
              last_campaign: attr.last_campaign || null,
              last_content: attr.last_content || null,
              last_term: attr.last_term || null,
              last_landing_page: attr.last_landing_page || null,
              last_referrer: attr.last_referrer || null,
              last_product_viewed: attr.last_product_viewed || null,
              last_visit_at: attr.last_visit_at || null,
              touchpoint_count: attr.touchpoint_count || 1,
            }
          : null,
      };
    });

    return NextResponse.json({ ok: true, data: formattedData });
  } catch (e: any) {
    console.error('Checkout logs error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
