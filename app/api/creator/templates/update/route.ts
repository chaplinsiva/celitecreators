// agent-notes: { ctx: "Robust API route for editing and updating creator templates", deps: ["lib/supabaseAdmin.ts"], state: active, last: "sato@2026-08-14" }
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

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
    const rawBody = await req.json().catch(() => ({}));
    const body = rawBody?.template || rawBody;

    const rawSlug = (body?.original_slug || body?.editingSlug || body?.slug || '').toString().trim();
    if (!rawSlug) {
      return NextResponse.json({ ok: false, error: 'Template slug is required' }, { status: 400 });
    }

    // Get creator shop
    const { data: shop } = await admin
      .from('creator_shops')
      .select('id, name, user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!shop) {
      return NextResponse.json({ ok: false, error: 'Creator shop not found' }, { status: 404 });
    }

    // Verify creator owns the template
    const { data: tpl } = await admin
      .from('templates')
      .select('slug, creator_shop_id, vendor_name')
      .eq('slug', rawSlug)
      .maybeSingle();

    if (!tpl) {
      return NextResponse.json({ ok: false, error: 'Template not found' }, { status: 404 });
    }

    const isOwner = tpl.creator_shop_id === shop.id || (tpl.vendor_name && tpl.vendor_name === shop.name);
    if (!isOwner) {
      return NextResponse.json({ ok: false, error: 'You do not have permission to edit this template' }, { status: 403 });
    }

    const updates: Record<string, any> = {};

    // Template URL Slug Change
    const requestedNewSlug = (body?.new_slug || body?.slug || '').toString().trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    if (requestedNewSlug && requestedNewSlug !== rawSlug) {
      const { data: existingTpl } = await admin
        .from('templates')
        .select('slug')
        .eq('slug', requestedNewSlug)
        .maybeSingle();

      if (existingTpl) {
        return NextResponse.json({ ok: false, error: `Product URL slug "${requestedNewSlug}" is already taken by another template.` }, { status: 400 });
      }
      updates.slug = requestedNewSlug;
    }

    if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
    if (body.subtitle !== undefined) updates.subtitle = body.subtitle ? body.subtitle.trim() : null;
    if (body.description !== undefined) updates.description = body.description ? body.description.trim() : null;

    if (body.video_path !== undefined) updates.video_path = body.video_path ? body.video_path.trim() : null;
    if (body.thumbnail_path !== undefined) updates.thumbnail_path = body.thumbnail_path ? body.thumbnail_path.trim() : null;
    if (body.audio_preview_path !== undefined) updates.audio_preview_path = body.audio_preview_path ? body.audio_preview_path.trim() : null;
    if (body.model_3d_path !== undefined) updates.model_3d_path = body.model_3d_path ? body.model_3d_path.trim() : null;
    if (body.source_path !== undefined) updates.source_path = body.source_path ? body.source_path.trim() : null;
    if (body.preview_path !== undefined) updates.preview_path = body.preview_path ? body.preview_path.trim() : null;

    if (body.features !== undefined) {
      updates.features = Array.isArray(body.features)
        ? body.features
        : typeof body.features === 'string'
        ? body.features.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
    }
    if (body.software !== undefined) {
      updates.software = Array.isArray(body.software)
        ? body.software
        : typeof body.software === 'string'
        ? body.software.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
    }
    if (body.plugins !== undefined) {
      updates.plugins = Array.isArray(body.plugins)
        ? body.plugins
        : typeof body.plugins === 'string'
        ? body.plugins.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
    }
    if (body.tags !== undefined) {
      updates.tags = Array.isArray(body.tags)
        ? body.tags
        : typeof body.tags === 'string'
        ? body.tags.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
    }

    if (body.category_id !== undefined) updates.category_id = body.category_id || null;
    if (body.subcategory_id !== undefined) updates.subcategory_id = body.subcategory_id || null;
    if (body.sub_subcategory_id !== undefined) updates.sub_subcategory_id = body.sub_subcategory_id || null;

    if (body.price !== undefined && body.price !== null) {
      const parsedPrice = Number(body.price);
      if (!isNaN(parsedPrice) && parsedPrice >= 0) {
        updates.price = parsedPrice;
      }
    }

    if (body.meta_title !== undefined) updates.meta_title = body.meta_title ? body.meta_title.trim() : null;
    if (body.meta_description !== undefined) updates.meta_description = body.meta_description ? body.meta_description.trim() : null;

    // Keep ownership and update timestamp
    updates.creator_shop_id = shop.id;
    updates.vendor_name = shop.name;
    updates.updated_at = new Date().toISOString();

    const { data: updatedData, error: updateErr } = await admin
      .from('templates')
      .update(updates)
      .eq('slug', rawSlug)
      .select('slug, name, price, status, updated_at')
      .maybeSingle();

    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, slug: updates.slug || rawSlug, data: updatedData, message: 'Template updated successfully' });
  } catch (e: any) {
    console.error('Update template error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
