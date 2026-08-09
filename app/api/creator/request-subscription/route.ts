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

    const { data: shop } = await admin
      .from('creator_shops')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!shop) {
      return NextResponse.json({ ok: false, error: 'Creator shop not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const slug = (body?.slug || '').toString().trim();

    if (!slug) {
      return NextResponse.json({ ok: false, error: 'Missing template slug' }, { status: 400 });
    }

    // Verify ownership
    const { data: tpl } = await admin
      .from('templates')
      .select('slug, creator_shop_id, subscription_submission_status')
      .eq('slug', slug)
      .maybeSingle();

    if (!tpl || tpl.creator_shop_id !== shop.id) {
      return NextResponse.json({ ok: false, error: 'Template not found or unauthorized' }, { status: 403 });
    }

    // Update status to PENDING_REVIEW
    const { error: updateErr } = await admin
      .from('templates')
      .update({
        subscription_submission_status: 'PENDING_REVIEW'
      })
      .eq('slug', slug);

    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, slug, status: 'PENDING_REVIEW' });
  } catch (e: any) {
    console.error('Request Subscription Error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
