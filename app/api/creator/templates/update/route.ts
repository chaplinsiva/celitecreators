/* agent-notes: { ctx: "API route for updating creator templates", deps: ["lib/supabaseAdmin.ts"], state: active, last: "sato@2026-08-09" } */
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

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
    const body = await req.json().catch(() => ({}));
    const { slug, name, subtitle, price } = body;

    if (!slug) {
      return NextResponse.json({ ok: false, error: 'Template slug is required' }, { status: 400 });
    }

    // Verify creator owns the template
    const { data: tpl } = await admin
      .from('templates')
      .select('slug, creator_shop_id')
      .eq('slug', slug)
      .maybeSingle();

    if (!tpl) {
      return NextResponse.json({ ok: false, error: 'Template not found' }, { status: 404 });
    }

    const { data: shop } = await admin
      .from('creator_shops')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!shop || tpl.creator_shop_id !== shop.id) {
      return NextResponse.json({ ok: false, error: 'You do not have permission to edit this template' }, { status: 403 });
    }

    const updates: Record<string, any> = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof subtitle === 'string') updates.subtitle = subtitle.trim();
    if (price !== undefined && price !== null) {
      const parsedPrice = Number(price);
      if (!isNaN(parsedPrice) && parsedPrice >= 0) {
        updates.price = parsedPrice;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'No valid fields provided for update' }, { status: 400 });
    }

    const { error: updateErr } = await admin
      .from('templates')
      .update(updates)
      .eq('slug', slug);

    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, slug, updates });
  } catch (e: any) {
    console.error('Update template error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
