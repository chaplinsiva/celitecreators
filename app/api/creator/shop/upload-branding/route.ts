// agent-notes: { ctx: "Upload creator branding image (logo/banner) to Cloudflare R2 and update creator_shops table", deps: ["lib/supabaseAdmin.ts", "lib/r2Client.ts", "lib/utils.ts"], state: active, last: "sato@2026-08-14" }
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { uploadPreviewToR2 } from '@/lib/r2Client';
import { convertR2UrlToCdn } from '@/lib/utils';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

function getFileExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx).toLowerCase() : '.jpg';
}

async function getCreatorContext(req: Request) {
  const admin = getSupabaseAdminClient();

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
  if (!token) {
    return { error: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: userRes, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userRes.user) {
    return { error: NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 }) };
  }

  const userId = userRes.user.id;

  const { data: shop, error: shopErr } = await admin
    .from('creator_shops')
    .select('id, slug, name')
    .eq('user_id', userId)
    .maybeSingle();

  if (shopErr || !shop) {
    return { error: NextResponse.json({ ok: false, error: 'No creator shop found' }, { status: 404 }) };
  }

  return { admin, userId, shop };
}

export async function POST(req: Request) {
  try {
    const ctx = await getCreatorContext(req);
    if ('error' in ctx) return ctx.error;
    const { admin, shop } = ctx;

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const type = (form.get('type') as string | null) || 'banner'; // 'banner' | 'logo'

    if (!file) {
      return NextResponse.json({ ok: false, error: 'Missing image file' }, { status: 400 });
    }

    const ext = getFileExtension(file.name);
    const timestamp = Date.now();
    const cleanShopSlug = shop.slug || shop.id;
    const r2Key = `preview/branding/${cleanShopSlug}/${type}-${timestamp}${ext}`;

    const contentType = file.type || (ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg');

    const result = await uploadPreviewToR2(file, r2Key, contentType);
    const cdnUrl = convertR2UrlToCdn(result.url) || result.url;

    // Immediately persist to database
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (type === 'logo') {
      dbUpdates.logo_url = cdnUrl;
      dbUpdates.profile_image_url = cdnUrl;
    } else {
      dbUpdates.banner_url = cdnUrl;
    }

    await admin
      .from('creator_shops')
      .update(dbUpdates)
      .eq('id', shop.id);

    return NextResponse.json({
      ok: true,
      url: cdnUrl,
      key: result.key,
      type,
      message: `${type === 'banner' ? 'Store banner' : 'Studio logo'} uploaded and saved successfully`,
    });
  } catch (err: any) {
    console.error('Branding R2 upload error:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to upload branding image to CDN' }, { status: 500 });
  }
}
