import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

async function getCreatorShop(req: Request) {
  const admin = getSupabaseAdminClient();

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  
  if (!token) {
    return { error: NextResponse.json({ ok: false, error: 'Unauthorized. Missing token.' }, { status: 401 }) };
  }

  const { data: userRes, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userRes.user) {
    return { error: NextResponse.json({ ok: false, error: 'Invalid or expired auth session' }, { status: 401 }) };
  }

  const userId = userRes.user.id;

  const { data: shop, error: shopErr } = await admin
    .from('creator_shops')
    .select('id, user_id, slug')
    .eq('user_id', userId)
    .maybeSingle();

  if (shopErr || !shop) {
    return { error: NextResponse.json({ ok: false, error: 'Creator shop profile not found' }, { status: 404 }) };
  }

  return { admin, userId, shop };
}

export async function POST(req: Request) {
  try {
    const ctx = await getCreatorShop(req);
    if ('error' in ctx) return ctx.error;
    const { admin, shop } = ctx;

    const body = await req.json();

    const updatePayload: Record<string, any> = {};

    if (typeof body.name === 'string') updatePayload.name = body.name.trim();
    if (typeof body.description === 'string') updatePayload.description = body.description.trim();
    if (typeof body.tagline === 'string') updatePayload.tagline = body.tagline.trim();
    if (typeof body.location === 'string') updatePayload.location = body.location.trim();
    if (typeof body.website_url === 'string') updatePayload.website_url = body.website_url.trim();
    if (typeof body.instagram_url === 'string') updatePayload.instagram_url = body.instagram_url.trim();
    if (typeof body.youtube_url === 'string') updatePayload.youtube_url = body.youtube_url.trim();
    if (typeof body.twitter_url === 'string') updatePayload.twitter_url = body.twitter_url.trim();
    if (typeof body.banner_url === 'string') updatePayload.banner_url = body.banner_url.trim();
    if (typeof body.logo_url === 'string') updatePayload.logo_url = body.logo_url.trim();

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ ok: false, error: 'No fields provided for update' }, { status: 400 });
    }

    updatePayload.updated_at = new Date().toISOString();

    const { data: updatedShop, error: updateErr } = await admin
      .from('creator_shops')
      .update(updatePayload)
      .eq('id', shop.id)
      .select('id, user_id, slug, name, description, tagline, location, website_url, instagram_url, youtube_url, twitter_url, banner_url, logo_url')
      .single();

    if (updateErr) {
      console.error('Failed to update creator shop:', updateErr);
      let errMsg = updateErr.message || 'Failed to update store details';
      if (updateErr.code === '42703' || (errMsg && errMsg.includes('column'))) {
        errMsg = 'Database branding columns pending. Please run supabase_migrations/32_add_branding_to_creator_shops.sql in your Supabase SQL Editor.';
      }
      return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      shop: updatedShop,
      message: 'Storefront updated successfully',
    });
  } catch (err: any) {
    console.error('Creator shop update error:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Server error updating storefront' }, { status: 500 });
  }
}
