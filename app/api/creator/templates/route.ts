// agent-notes: { ctx: "API route for creators to manage templates and view sales stats", deps: ["lib/supabaseAdmin.ts"], state: active, last: "antigravity@2026-08-13" }
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../lib/supabaseAdmin';

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
    .select('id, user_id, slug, name, description, bio, tagline, location, website_url, instagram_url, youtube_url, twitter_url, logo_url, profile_image_url, banner_url, bank_account_name, bank_account_number, bank_ifsc, bank_upi_id, direct_upload_enabled, total_sales_count')
    .eq('user_id', userId)
    .maybeSingle();

  if (shopErr || !shop) {
    return { error: NextResponse.json({ ok: false, error: 'No creator shop found for this user' }, { status: 404 }) };
  }

  return { admin, userId, shop };
}

export async function GET(req: Request) {
  try {
    const ctx = await getCreatorContext(req);
    if ('error' in ctx) return ctx.error;
    const { admin, shop } = ctx;

    // Fetch templates and downloads details in parallel
    const [templatesResult, downloadsResult] = await Promise.all([
      admin
        .from('templates')
        .select('slug,name,subtitle,video,img,created_at,creator_shop_id,status,price,available_on_celite_market,available_on_celite_subscription,subscription_submission_status,description,video_path,thumbnail_path,audio_preview_path,model_3d_path,source_path,features,software,plugins,tags,category_id,subcategory_id,sub_subcategory_id,downloads(count)')
        .eq('creator_shop_id', shop.id)
        .order('created_at', { ascending: false }),
      admin
        .from('downloads')
        .select('user_id, downloaded_at, subscription_id, templates!inner(creator_shop_id)')
        .eq('templates.creator_shop_id', shop.id)
        .order('downloaded_at', { ascending: true })
    ]);

    if (templatesResult.error) {
      return NextResponse.json({ ok: false, error: templatesResult.error.message }, { status: 500 });
    }

    const templates = templatesResult.data || [];
    const downloads = downloadsResult.data || [];
    const slugs = templates.map((t: any) => t.slug);

    // Fetch real download statistics in parallel for all template slugs
    const counts: Record<string, number> = {};
    if (slugs.length > 0) {
      try {
        const [{ data: subData }, { data: freeData }, { data: orderData }] = await Promise.all([
          admin.from('downloads').select('template_slug').in('template_slug', slugs),
          admin.from('free_downloads').select('template_slug').in('template_slug', slugs),
          admin.from('order_items').select('slug').in('slug', slugs),
        ]);

        (subData || []).forEach((row: any) => {
          if (row.template_slug) counts[row.template_slug] = (counts[row.template_slug] || 0) + 1;
        });
        (freeData || []).forEach((row: any) => {
          if (row.template_slug) counts[row.template_slug] = (counts[row.template_slug] || 0) + 1;
        });
        (orderData || []).forEach((row: any) => {
          if (row.slug) counts[row.slug] = (counts[row.slug] || 0) + 1;
        });
      } catch (err) {
        console.error('Failed to fetch batch template downloads in API route:', err);
      }
    }

    // Build results with download counts
    const results = templates.map((tpl: any) => {
      const { downloads: dls, ...rest } = tpl;
      return {
        ...rest,
        downloadCount: counts[tpl.slug] || 0
      };
    });

    // Calculate total downloads
    const totalDownloads = results.reduce((sum, t) => sum + t.downloadCount, 0);

    // Calculate unique user periods (historical metric, kept for compatibility)
    let uniqueUserPeriods = 0;
    try {
      if (downloads.length > 0) {
        const byUser = new Map<string, Date[]>();
        for (const d of downloads as any[]) {
          if (!d.user_id || !d.downloaded_at) continue;
          const arr = byUser.get(d.user_id) || [];
          arr.push(new Date(d.downloaded_at));
          byUser.set(d.user_id, arr);
        }

        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

        byUser.forEach((dates) => {
          dates.sort((a, b) => a.getTime() - b.getTime());
          let lastCounted: Date | null = null;
          for (const dt of dates) {
            if (!lastCounted) {
              uniqueUserPeriods += 1;
              lastCounted = dt;
            } else if (dt.getTime() - lastCounted.getTime() > THIRTY_DAYS_MS) {
              uniqueUserPeriods += 1;
              lastCounted = dt;
            }
          }
        });
      }
    } catch (e) {
      console.error('Failed to compute unique user periods for creator', e);
      uniqueUserPeriods = 0;
    }

    const templateSlugs = templates.map((t: any) => t.slug);

    // Query marketplace sales items and payout requests in parallel
    const detailedOrderItemsQuery = admin
      .from('order_items')
      .select(`
        id,
        order_id,
        slug,
        name,
        price,
        creator_earnings,
        platform_fee,
        created_at,
        orders (
          id,
          status,
          billing_name,
          billing_email,
          order_source,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (templateSlugs.length > 0) {
      detailedOrderItemsQuery.or(`creator_shop_id.eq.${shop.id},slug.in.(${templateSlugs.join(',')})`);
    } else {
      detailedOrderItemsQuery.eq('creator_shop_id', shop.id);
    }

    let downloadLogsQuery = admin
      .from('downloads')
      .select('id, user_id, template_slug, downloaded_at, subscription_id')
      .order('downloaded_at', { ascending: false })
      .limit(100);

    if (templateSlugs.length > 0) {
      downloadLogsQuery = downloadLogsQuery.in('template_slug', templateSlugs);
    }

    const [orderItemsResult, payoutsResult, downloadLogsResult] = await Promise.all([
      detailedOrderItemsQuery,
      admin
        .from('payout_requests')
        .select('id, amount, status, created_at, processed_at, admin_note')
        .eq('creator_shop_id', shop.id)
        .order('created_at', { ascending: false })
        .limit(50),
      templateSlugs.length > 0 ? downloadLogsQuery : Promise.resolve({ data: [] } as any)
    ]);

    const orderItems = orderItemsResult.data || [];
    const payoutRequests = payoutsResult.data || [];
    const downloadLogs = (downloadLogsResult as any)?.data || [];

    // Filter for paid orders when calculating revenue
    const paidOrderItems = orderItems.filter((item: any) => {
      const order = Array.isArray(item.orders) ? item.orders[0] : item.orders;
      return !order || order.status === 'paid' || order.status === 'completed';
    });

    const marketplaceSalesCount = paidOrderItems.length;
    const marketplaceSalesRevenue = paidOrderItems.reduce((sum: number, item: any) => {
      const earnings = Number(item.creator_earnings) || (Number(item.price || 0) * 0.8);
      return sum + earnings;
    }, 0);

    const subscriptionPoolRevenue = 0;
    const totalEarnings = marketplaceSalesRevenue;

    const paidOutAmount = payoutRequests
      .filter((p: any) => p.status === 'paid')
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const pendingPayoutAmount = payoutRequests
      .filter((p: any) => p.status === 'pending')
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const availableBalance = Math.max(0, totalEarnings - paidOutAmount - pendingPayoutAmount);

    // Format transaction ledger items
    const transactions = orderItems.map((item: any) => {
      const order = Array.isArray(item.orders) ? item.orders[0] : item.orders;
      const grossPrice = Number(item.price || 0);
      const netEarnings = Number(item.creator_earnings) || (grossPrice * 0.8);
      const fee = Number(item.platform_fee) || (grossPrice * 0.2);

      return {
        id: item.id,
        orderId: item.order_id || order?.id || 'ORD-DIRECT',
        slug: item.slug,
        templateName: item.name || item.slug,
        grossAmount: grossPrice,
        creatorEarnings: netEarnings,
        platformFee: fee,
        status: order?.status || 'paid',
        buyerName: order?.billing_name || 'Customer',
        buyerEmail: order?.billing_email ? `${order.billing_email.slice(0, 3)}***@${order.billing_email.split('@')[1] || 'mail.com'}` : 'Verified Buyer',
        orderSource: order?.order_source || 'Celite Market',
        createdAt: item.created_at || order?.created_at || new Date().toISOString(),
      };
    });

    return NextResponse.json({
      ok: true,
      shop,
      templates: results,
      stats: {
        totalDownloads,
        uniqueUserPeriods: 0,
        subscriptionPoolRevenue,
        marketplaceSalesCount,
        marketplaceSalesRevenue,
        totalEarnings,
        paidOutAmount,
        pendingPayoutAmount,
        revenue: availableBalance, // Available withdrawable balance after deducting paid & pending payouts
      },
      transactions,
      downloadLogs,
      payoutRequests,
    });
  } catch (e: any) {
    console.error('Creator GET error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await getCreatorContext(req);
    if ('error' in ctx) return ctx.error;
    const { admin, shop } = ctx;

    const body = await req.json().catch(() => ({}));
    const input = body?.template;

    if (!input) {
      return NextResponse.json({ ok: false, error: 'Provide { template: { ... } } in request body' }, { status: 400 });
    }

    const rawName: string = (input.name || '').toString().trim();
    let rawSlug: string = (input.slug || '').toString().trim().toLowerCase();
    if (!rawName) {
      return NextResponse.json({ ok: false, error: 'Template name is required' }, { status: 400 });
    }

    // Generate slug from name if not provided
    if (!rawSlug) {
      rawSlug = rawName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Ensure slug is valid
    if (!rawSlug || rawSlug.length === 0) {
      return NextResponse.json({ ok: false, error: 'Invalid slug generated. Please provide a valid slug.' }, { status: 400 });
    }

    // Ensure slug uniqueness: if an existing template uses this slug and is not ours, generate a unique one
    let finalSlug = rawSlug;
    let attempt = 1;
    while (true) {
      const { data: existing, error: existingErr } = await admin
        .from('templates')
        .select('slug, creator_shop_id')
        .eq('slug', finalSlug)
        .maybeSingle();

      if (existingErr) {
        return NextResponse.json({ ok: false, error: existingErr.message }, { status: 500 });
      }

      // If slug doesn't exist, or exists and belongs to us, we can use it
      if (!existing || (existing.creator_shop_id && existing.creator_shop_id === shop.id)) {
        break;
      }

      // If slug exists and belongs to another creator, append a number
      finalSlug = `${rawSlug}-${attempt}`;
      attempt++;

      // Safety check to prevent infinite loop
      if (attempt > 100) {
        return NextResponse.json({ ok: false, error: 'Unable to generate unique slug. Please try a different name.' }, { status: 500 });
      }
    }

    const row = {
      slug: finalSlug,
      name: rawName,
      subtitle: (input.subtitle || '').toString().trim() || null,
      description: (input.description || '').toString().trim() || null,
      img: null,
      video_path: (input.video_path || '').toString().trim() || null,
      thumbnail_path: (input.thumbnail_path || '').toString().trim() || null,
      audio_preview_path: (input.audio_preview_path || '').toString().trim() || null,
      model_3d_path: (input.model_3d_path || '').toString().trim() || null,
      source_path: (input.source_path || '').toString().trim() || null,
      preview_path: (input.preview_path || '').toString().trim() || null,
      features: Array.isArray(input.features) ? input.features : [],
      software: Array.isArray(input.software) ? input.software : [],
      plugins: Array.isArray(input.plugins) ? input.plugins : [],
      tags: Array.isArray(input.tags) ? input.tags : [],
      category_id: input.category_id || null,
      subcategory_id: input.subcategory_id || null,
      sub_subcategory_id: input.sub_subcategory_id || null,
      meta_title: (input.meta_title || '').toString().trim() || null,
      meta_description: (input.meta_description || '').toString().trim() || null,
      creator_shop_id: shop.id,
      vendor_name: shop.name,
      price: input.price ? Math.max(Number(input.price), 0) : 399,
      available_on_celite_market: true,
      available_on_celite_subscription: false, // Default is NOT present in Celite subscription pool
      subscription_submission_status: input.request_subscription ? 'PENDING_REVIEW' : 'NOT_SUBMITTED',
      status: 'pending', // every creator change requires admin review
    };

    const { data, error } = await admin
      .from('templates')
      .upsert(row, { onConflict: 'slug' })
      .select('slug')
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: error?.message || 'Failed to save template' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, slug: data.slug });
  } catch (e: any) {
    console.error('Creator POST error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const ctx = await getCreatorContext(req);
    if ('error' in ctx) return ctx.error;
    const { admin, shop } = ctx;

    const body = await req.json().catch(() => ({}));
    const slug = (body?.slug || '').toString().trim();
    if (!slug) {
      return NextResponse.json({ ok: false, error: 'Missing slug' }, { status: 400 });
    }

    // Verify that this template belongs to this creator
    const { data: tpl, error: readErr } = await admin
      .from('templates')
      .select('slug, creator_shop_id')
      .eq('slug', slug)
      .maybeSingle();

    if (readErr) {
      return NextResponse.json({ ok: false, error: readErr.message }, { status: 500 });
    }

    if (!tpl) {
      return NextResponse.json({ ok: false, error: 'Template not found' }, { status: 404 });
    }

    if (!tpl.creator_shop_id || tpl.creator_shop_id !== shop.id) {
      return NextResponse.json({ ok: false, error: 'You can only delete your own templates' }, { status: 403 });
    }

    const { error } = await admin.from('templates').delete().eq('slug', slug);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Creator DELETE error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
