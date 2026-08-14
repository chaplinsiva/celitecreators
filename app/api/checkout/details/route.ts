// agent-notes: { ctx: "API route for storing and updating checkout details", deps: ["lib/supabaseAdmin.ts"], state: active, last: "antigravity@2026-08-13" }
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

    // Verify user
    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes.user) {
      return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
    }
    const userId = userRes.user.id;

    const body = await req.json();
    const {
      checkout_type,
      billing_name,
      billing_email,
      billing_mobile,
      billing_company,
      subscription_plan,
      cart_items,
      total_amount,
      razorpay_order_id,
    } = body;

    // Validate required fields
    if (!billing_name || !billing_email || !billing_mobile || !total_amount) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Insert checkout details
    const isProduct = (checkout_type || 'product') === 'product';
    const targetTable = isProduct ? 'productcheckout' : 'checkout_details';

    const insertPayload: any = {
      user_id: userId,
      billing_name,
      billing_email,
      billing_mobile,
      billing_company: billing_company || null,
      cart_items: cart_items || [],
      total_amount: Number(total_amount) || 0,
      status: 'initiated',
      razorpay_order_id: razorpay_order_id || null,
    };

    if (!isProduct) {
      insertPayload.checkout_type = checkout_type || 'subscription';
      insertPayload.subscription_plan = subscription_plan || null;
    }

    const { data: checkoutDetail, error: insertErr } = await admin
      .from(targetTable)
      .insert(insertPayload)
      .select('id')
      .single();

    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }

    // If attribution object is passed, sync with visitor_attributions
    const attribution = body.attribution;
    if (attribution && attribution.firstTouch) {
      try {
        const first = attribution.firstTouch;
        const last = attribution.lastTouch || first;
        const { data: existingAttr } = await admin
          .from('visitor_attributions')
          .select('id, touchpoint_count')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingAttr) {
          await admin
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
              touchpoint_count: (existingAttr.touchpoint_count || 1) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingAttr.id);
        } else {
          await admin.from('visitor_attributions').insert({
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
        }
      } catch (attrErr) {
        console.error('Failed to sync visitor attribution during checkout:', attrErr);
      }
    }

    return NextResponse.json({ ok: true, checkout_detail_id: checkoutDetail.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

// Update checkout details (e.g., when payment is initiated or completed)
export async function PATCH(req: Request) {
  try {
    const admin = getSupabaseAdminClient();
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
    
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user
    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes.user) {
      return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
    }
    const userId = userRes.user.id;

    const body = await req.json();
    const { checkout_detail_id, status, razorpay_order_id, razorpay_payment_id, razorpay_subscription_id, order_id } = body;

    if (!checkout_detail_id) {
      return NextResponse.json({ ok: false, error: 'Missing checkout_detail_id' }, { status: 400 });
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (razorpay_order_id) updateData.razorpay_order_id = razorpay_order_id;
    if (razorpay_payment_id) updateData.razorpay_payment_id = razorpay_payment_id;
    if (razorpay_subscription_id) updateData.razorpay_subscription_id = razorpay_subscription_id;
    if (order_id) updateData.order_id = order_id;

    // Update checkout details: try productcheckout first, fallback to checkout_details
    let updateErr = null;
    const { data: updatedProduct, error: productErr } = await admin
      .from('productcheckout')
      .update(updateData)
      .eq('id', checkout_detail_id)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (productErr) {
      updateErr = productErr;
    } else if (!updatedProduct) {
      // Fallback to checkout_details if not found in productcheckout
      const { error: detailsErr } = await admin
        .from('checkout_details')
        .update(updateData)
        .eq('id', checkout_detail_id)
        .eq('user_id', userId);
      updateErr = detailsErr;
    }

    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}






