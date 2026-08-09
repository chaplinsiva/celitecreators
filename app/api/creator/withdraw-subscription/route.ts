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
    const body = await req.json().catch(() => ({}));
    const { slug } = body;

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

    const { error: updateErr } = await admin
      .from('templates')
      .update({
        subscription_submission_status: 'NOT_SUBMITTED',
        available_on_celite_subscription: false,
      })
      .eq('slug', slug);

    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, slug });
  } catch (e: any) {
    console.error('Withdraw subscription error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
