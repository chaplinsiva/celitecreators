// agent-notes: { ctx: "API route for updating creator studio profile, branding, and bank/payout details seamlessly", deps: ["lib/supabaseAdmin.ts"], state: active, last: "sato@2026-08-14" }
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
    .select('id, user_id, slug, name')
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

    const body = await req.json().catch(() => ({}));
    const updatePayload: Record<string, any> = {};

    // Studio URL Slug
    if (typeof body.slug === 'string' && body.slug.trim()) {
      const cleanSlug = body.slug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (cleanSlug && cleanSlug !== shop.slug) {
        const { data: existingShop } = await admin
          .from('creator_shops')
          .select('id')
          .eq('slug', cleanSlug)
          .neq('id', shop.id)
          .maybeSingle();

        if (existingShop) {
          return NextResponse.json({ ok: false, error: `Store URL slug "${cleanSlug}" is already taken by another creator.` }, { status: 400 });
        }
        updatePayload.slug = cleanSlug;
      }
    }

    // Basic Studio Info
    if (typeof body.name === 'string' && body.name.trim()) updatePayload.name = body.name.trim();
    if (typeof body.description === 'string') updatePayload.description = body.description.trim();
    if (typeof body.bio === 'string') updatePayload.bio = body.bio.trim();
    if (typeof body.tagline === 'string') updatePayload.tagline = body.tagline.trim();
    if (typeof body.location === 'string') updatePayload.location = body.location.trim();

    // Social Links
    if (typeof body.website_url === 'string') updatePayload.website_url = body.website_url.trim();
    if (typeof body.instagram_url === 'string') updatePayload.instagram_url = body.instagram_url.trim();
    if (typeof body.youtube_url === 'string') updatePayload.youtube_url = body.youtube_url.trim();
    if (typeof body.twitter_url === 'string') updatePayload.twitter_url = body.twitter_url.trim();

    // Visual Branding (only update if non-empty string provided)
    if (typeof body.banner_url === 'string' && body.banner_url.trim()) {
      updatePayload.banner_url = body.banner_url.trim();
    }
    if (typeof body.logo_url === 'string' && body.logo_url.trim()) {
      updatePayload.logo_url = body.logo_url.trim();
      updatePayload.profile_image_url = body.logo_url.trim();
    }
    if (typeof body.profile_image_url === 'string' && body.profile_image_url.trim()) {
      updatePayload.profile_image_url = body.profile_image_url.trim();
    }

    // Bank & Payout Details
    if (typeof body.bank_account_name === 'string') updatePayload.bank_account_name = body.bank_account_name.trim();
    if (typeof body.bank_account_number === 'string') updatePayload.bank_account_number = body.bank_account_number.trim();
    if (typeof body.bank_ifsc === 'string') updatePayload.bank_ifsc = body.bank_ifsc.trim().toUpperCase();
    if (typeof body.bank_upi_id === 'string') updatePayload.bank_upi_id = body.bank_upi_id.trim();

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ ok: false, error: 'No fields provided for update' }, { status: 400 });
    }

    updatePayload.updated_at = new Date().toISOString();

    const { data: updatedShop, error: updateErr } = await admin
      .from('creator_shops')
      .update(updatePayload)
      .eq('id', shop.id)
      .select('*')
      .single();

    if (updateErr) {
      console.error('Failed to update creator shop:', updateErr);
      return NextResponse.json({ ok: false, error: updateErr.message || 'Failed to update store details' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      shop: updatedShop,
      message: 'Studio profile & payout details updated successfully',
    });
  } catch (err: any) {
    console.error('Creator shop update error:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Server error updating storefront' }, { status: 500 });
  }
}
