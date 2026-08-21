// agent-notes: { ctx: "API route to sync visitor marketing attribution touchpoints to visitor_attributions table", deps: ["lib/supabaseAdmin.ts"], state: active, last: "sato@2026-08-14" }
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../lib/supabaseAdmin';

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
    const body = await req.json();
    const { attribution } = body;

    if (!attribution || !attribution.firstTouch) {
      return NextResponse.json({ ok: false, error: 'Invalid attribution payload' }, { status: 400 });
    }

    const first = attribution.firstTouch;
    const last = attribution.lastTouch || first;

    // Check if record exists for this user
    const { data: existing } = await admin
      .from('visitor_attributions')
      .select('id, touchpoint_count, first_source')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // Update last touch and touchpoint count, preserving first touch
      const { error: updateErr } = await admin
        .from('visitor_attributions')
        .update({
          anonymous_id: attribution.anonymousId || null,
          last_source: last.source || null,
          last_medium: last.medium || null,
          last_campaign: last.campaign || null,
          last_content: last.content || null,
          last_term: last.term || null,
          last_landing_page: last.landingPage || null,
          last_referrer: last.referrer || null,
          last_product_viewed: attribution.lastProductViewed || last.productViewed || null,
          last_visit_at: last.timestamp ? new Date(last.timestamp).toISOString() : new Date().toISOString(),
          touchpoint_count: (existing.touchpoint_count || 1) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateErr) {
        console.warn('Attribution update warning:', updateErr.message);
        return NextResponse.json({ ok: false, warning: updateErr.message }, { status: 200 });
      }
    } else {
      // Insert new record
      const { error: insertErr } = await admin
        .from('visitor_attributions')
        .insert({
          user_id: userId,
          anonymous_id: attribution.anonymousId || null,
          first_source: first.source || 'Direct',
          first_medium: first.medium || null,
          first_campaign: first.campaign || null,
          first_content: first.content || null,
          first_term: first.term || null,
          first_landing_page: first.landingPage || null,
          first_referrer: first.referrer || null,
          first_product_viewed: attribution.firstProductViewed || first.productViewed || null,
          first_visit_at: first.timestamp ? new Date(first.timestamp).toISOString() : new Date().toISOString(),
          last_source: last.source || 'Direct',
          last_medium: last.medium || null,
          last_campaign: last.campaign || null,
          last_content: last.content || null,
          last_term: last.term || null,
          last_landing_page: last.landingPage || null,
          last_referrer: last.referrer || null,
          last_product_viewed: attribution.lastProductViewed || last.productViewed || null,
          last_visit_at: last.timestamp ? new Date(last.timestamp).toISOString() : new Date().toISOString(),
          touchpoint_count: attribution.touchpointCount || 1,
        });

      if (insertErr) {
        console.warn('Attribution insert warning:', insertErr.message);
        return NextResponse.json({ ok: false, warning: insertErr.message }, { status: 200 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.warn('Attribution sync catch warning:', e);
    return NextResponse.json({ ok: false, warning: e?.message || 'Warning' }, { status: 200 });
  }
}
