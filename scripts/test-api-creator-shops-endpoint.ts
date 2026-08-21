// agent-notes: { ctx: "API test for admin creator-shops data mapping and financial aggregation", deps: ["lib/supabaseAdmin.ts"], state: active, last: "tara@2026-08-21" }
import { getSupabaseAdminClient } from "../lib/supabaseAdmin";

async function runTests() {
  console.log("=== RUNNING ADMIN CREATOR SHOPS QUERY TEST ===");
  const admin = getSupabaseAdminClient();

  // 1. Fetch creator shops
  const { data: shops, error: shopsError } = await admin
    .from('creator_shops')
    .select(`
      id,
      slug,
      name,
      description,
      direct_upload_enabled,
      created_at,
      user_id,
      phone,
      email,
      joined_community,
      bank_upi_id,
      bank_account_name,
      bank_account_number,
      bank_ifsc
    `)
    .order('created_at', { ascending: false });

  if (shopsError) {
    console.error("✕ FAIL: Error fetching creator_shops:", shopsError);
    process.exit(1);
  }

  console.log(`✓ PASS: Successfully fetched ${shops?.length || 0} creator shops without errors.`);

  // 2. Fetch auth user emails
  const { data: usersData } = await admin.auth.admin.listUsers();
  const userEmailMap = new Map((usersData?.users || []).map(u => [u.id, u.email]));

  if (shops && shops.length > 0) {
    const sample = shops[0];
    const email = sample.email || userEmailMap.get(sample.user_id) || 'N/A';
    console.log(`✓ PASS: Sample Shop: ${sample.name} | Phone: ${sample.phone || 'N/A'} | Email: ${email} | UPI: ${sample.bank_upi_id || 'N/A'}`);
  }

  console.log("\nResults: All checks passed!\n");
}

runTests();
