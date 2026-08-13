/* agent-notes: { ctx: "Download stats helper fetching real DB records", deps: [], state: active, last: "antigravity@2026-08-13" } */
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Calculates a deterministic baseline count for a slug if real DB records are 0.
 * Kept for signature compatibility but returns 0.
 */
export function getBaselineDownloads(slug: string): number {
  return 0;
}

/**
 * Helper to fetch total download count (subscription downloads + free downloads + pay-per-product orders)
 * for a single template.
 */
export async function getTemplateDownloadCount(
  supabase: SupabaseClient,
  slug: string
): Promise<{ total: number; subscriptionCount: number; payPerCount: number; freeCount: number }> {
  try {
    const [{ count: subCount }, { count: freeCount }, { count: orderCount }] = await Promise.all([
      supabase.from('downloads').select('id', { count: 'exact', head: true }).eq('template_slug', slug),
      supabase.from('free_downloads').select('id', { count: 'exact', head: true }).eq('template_slug', slug),
      supabase.from('order_items').select('id', { count: 'exact', head: true }).eq('slug', slug),
    ]);

    const s = subCount ?? 0;
    const f = freeCount ?? 0;
    const p = orderCount ?? 0;
    const realTotal = s + f + p;

    const total = realTotal;

    return {
      total,
      subscriptionCount: s,
      freeCount: f,
      payPerCount: p,
    };
  } catch (e) {
    console.error('Error fetching template download count:', e);
    return {
      total: 0,
      subscriptionCount: 0,
      freeCount: 0,
      payPerCount: 0,
    };
  }
}

/**
 * Helper to fetch total download counts in batch for multiple template slugs.
 */
export async function getBatchTemplateDownloads(
  supabase: SupabaseClient,
  slugs: string[]
): Promise<Record<string, number>> {
  if (!slugs || slugs.length === 0) return {};

  try {
    const [{ data: subData }, { data: freeData }, { data: orderData }] = await Promise.all([
      supabase.from('downloads').select('template_slug').in('template_slug', slugs),
      supabase.from('free_downloads').select('template_slug').in('template_slug', slugs),
      supabase.from('order_items').select('slug').in('slug', slugs),
    ]);

    const counts: Record<string, number> = {};

    (subData || []).forEach((row: any) => {
      if (row.template_slug) {
        counts[row.template_slug] = (counts[row.template_slug] || 0) + 1;
      }
    });

    (freeData || []).forEach((row: any) => {
      if (row.template_slug) {
        counts[row.template_slug] = (counts[row.template_slug] || 0) + 1;
      }
    });

    (orderData || []).forEach((row: any) => {
      if (row.slug) {
        counts[row.slug] = (counts[row.slug] || 0) + 1;
      }
    });

    // Return real count
    const result: Record<string, number> = {};
    slugs.forEach((slug) => {
      result[slug] = counts[slug] || 0;
    });

    return result;
  } catch (e) {
    console.error('Error in batch template downloads:', e);
    const fallback: Record<string, number> = {};
    slugs.forEach((s) => {
      fallback[s] = 0;
    });
    return fallback;
  }
}
