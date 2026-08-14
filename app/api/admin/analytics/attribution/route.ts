// agent-notes: { ctx: "Admin API route to aggregate attribution analytics, channel ROI, campaign performance, and assisted journeys", deps: ["lib/supabaseAdmin.ts"], state: active, last: "sato@2026-08-14" }
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../../lib/supabaseAdmin';

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

    const url = new URL(req.url);
    const range = url.searchParams.get('range') || '30d';

    let dateFilter: string | null = null;
    const now = new Date();
    if (range === '7d') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (range === '30d') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (range === '90d') {
      dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Fetch order attributions
    let query = admin
      .from('order_attributions')
      .select('*')
      .order('created_at', { ascending: false });

    if (dateFilter) {
      query = query.gte('created_at', dateFilter);
    }

    const { data: orderAttrs, error: orderErr } = await query;
    if (orderErr) return NextResponse.json({ ok: false, error: orderErr.message }, { status: 500 });

    // Also fetch visitor attributions count for total visitors
    const { count: visitorCount } = await admin
      .from('visitor_attributions')
      .select('*', { count: 'exact', head: true });

    const orders = orderAttrs || [];
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 1. Channel Aggregations (First Touch vs Last Touch)
    const firstTouchMap: Record<string, { orders: number; revenue: number }> = {};
    const lastTouchMap: Record<string, { orders: number; revenue: number }> = {};
    const campaignMap: Record<string, { campaign: string; source: string; medium: string; orders: number; revenue: number }> = {};
    const firstProductMap: Record<string, { product: string; orders: number; revenue: number }> = {};
    const lastProductMap: Record<string, { product: string; orders: number; revenue: number }> = {};
    const assistedJourneysMap: Record<string, { journey: string; firstSource: string; lastSource: string; orders: number; revenue: number }> = {};

    let assistedCount = 0;

    orders.forEach((o: any) => {
      const firstSrc = o.first_source || 'Direct';
      const lastSrc = o.last_source || 'Direct';
      const amt = Number(o.total_amount) || 0;

      // First touch
      if (!firstTouchMap[firstSrc]) firstTouchMap[firstSrc] = { orders: 0, revenue: 0 };
      firstTouchMap[firstSrc].orders += 1;
      firstTouchMap[firstSrc].revenue += amt;

      // Last touch
      if (!lastTouchMap[lastSrc]) lastTouchMap[lastSrc] = { orders: 0, revenue: 0 };
      lastTouchMap[lastSrc].orders += 1;
      lastTouchMap[lastSrc].revenue += amt;

      // Campaign
      const campaignKey = o.first_campaign || o.last_campaign || 'None (Direct / Organic)';
      if (!campaignMap[campaignKey]) {
        campaignMap[campaignKey] = {
          campaign: campaignKey,
          source: o.first_source || o.last_source || 'Direct',
          medium: o.first_medium || o.last_medium || 'none',
          orders: 0,
          revenue: 0,
        };
      }
      campaignMap[campaignKey].orders += 1;
      campaignMap[campaignKey].revenue += amt;

      // First Product
      if (o.first_product_viewed) {
        const prod = o.first_product_viewed;
        if (!firstProductMap[prod]) firstProductMap[prod] = { product: prod, orders: 0, revenue: 0 };
        firstProductMap[prod].orders += 1;
        firstProductMap[prod].revenue += amt;
      }

      // Last Product
      if (o.last_product_viewed) {
        const prod = o.last_product_viewed;
        if (!lastProductMap[prod]) lastProductMap[prod] = { product: prod, orders: 0, revenue: 0 };
        lastProductMap[prod].orders += 1;
        lastProductMap[prod].revenue += amt;
      }

      // Assisted Conversion (multi-touch journey where first != last)
      if (firstSrc !== lastSrc) {
        assistedCount += 1;
        const journeyKey = `${firstSrc} ➔ ${lastSrc}`;
        if (!assistedJourneysMap[journeyKey]) {
          assistedJourneysMap[journeyKey] = {
            journey: journeyKey,
            firstSource: firstSrc,
            lastSource: lastSrc,
            orders: 0,
            revenue: 0,
          };
        }
        assistedJourneysMap[journeyKey].orders += 1;
        assistedJourneysMap[journeyKey].revenue += amt;
      }
    });

    const ALL_CHANNELS = [
      'Instagram Paid',
      'Instagram Organic',
      'Facebook Paid',
      'Facebook Organic',
      'Google Ads',
      'Google Organic',
      'YouTube',
      'ChatGPT / AI',
      'Referral',
      'Direct',
      'Other',
    ];

    const channelBreakdown = ALL_CHANNELS.map((ch) => {
      const ft = firstTouchMap[ch] || { orders: 0, revenue: 0 };
      const lt = lastTouchMap[ch] || { orders: 0, revenue: 0 };
      return {
        source: ch,
        firstTouchOrders: ft.orders,
        firstTouchRevenue: ft.revenue,
        firstTouchShare: totalRevenue > 0 ? (ft.revenue / totalRevenue) * 100 : 0,
        lastTouchOrders: lt.orders,
        lastTouchRevenue: lt.revenue,
        lastTouchShare: totalRevenue > 0 ? (lt.revenue / totalRevenue) * 100 : 0,
      };
    }).sort((a, b) => b.firstTouchRevenue - a.firstTouchRevenue);

    const campaignList = Object.values(campaignMap).sort((a, b) => b.revenue - a.revenue);
    const firstProductsList = Object.values(firstProductMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const lastProductsList = Object.values(lastProductMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const assistedJourneysList = Object.values(assistedJourneysMap).sort((a, b) => b.orders - a.orders).slice(0, 10);

    const topFirstSource = channelBreakdown.length > 0 ? channelBreakdown[0].source : 'None';
    const topLastSource = [...channelBreakdown].sort((a, b) => b.lastTouchRevenue - a.lastTouchRevenue)[0]?.source || 'None';

    return NextResponse.json({
      ok: true,
      data: {
        kpis: {
          totalOrders,
          totalRevenue,
          averageOrderValue: Math.round(averageOrderValue),
          totalUniqueVisitors: visitorCount || 0,
          assistedConversionsCount: assistedCount,
          assistedConversionRate: totalOrders > 0 ? Math.round((assistedCount / totalOrders) * 100) : 0,
          topFirstSource,
          topLastSource,
        },
        channels: channelBreakdown,
        campaigns: campaignList,
        products: {
          firstViewed: firstProductsList,
          lastViewed: lastProductsList,
        },
        assistedJourneys: assistedJourneysList,
        recentConversions: orders.slice(0, 50),
      },
    });
  } catch (e: any) {
    console.error('Attribution analytics error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
