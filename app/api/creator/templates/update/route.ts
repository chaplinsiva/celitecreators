/* agent-notes: { ctx: "API route for updating creator templates", deps: ["lib/supabaseAdmin.ts"], state: active, last: "antigravity@2026-08-13" } */
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
    const {
      slug, name, subtitle, price, description,
      video_path, thumbnail_path, audio_preview_path, model_3d_path, source_path,
      features, software, plugins, tags,
      category_id, subcategory_id, sub_subcategory_id
    } = body;

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
    if (typeof description === 'string') updates.description = description.trim() || null;
    if (typeof video_path === 'string') updates.video_path = video_path.trim() || null;
    if (typeof thumbnail_path === 'string') updates.thumbnail_path = thumbnail_path.trim() || null;
    if (typeof audio_preview_path === 'string') updates.audio_preview_path = audio_preview_path.trim() || null;
    if (typeof model_3d_path === 'string') updates.model_3d_path = model_3d_path.trim() || null;
    if (typeof source_path === 'string') updates.source_path = source_path.trim() || null;

    if (features !== undefined) updates.features = Array.isArray(features) ? features : [];
    if (software !== undefined) updates.software = Array.isArray(software) ? software : [];
    if (plugins !== undefined) updates.plugins = Array.isArray(plugins) ? plugins : [];
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [];

    if (category_id !== undefined) updates.category_id = category_id || null;
    if (subcategory_id !== undefined) updates.subcategory_id = subcategory_id || null;
    if (sub_subcategory_id !== undefined) updates.sub_subcategory_id = sub_subcategory_id || null;

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
