/* agent-notes: { ctx: "Download stats helper fetching real DB records with chunking & aggregation", deps: ["@supabase/supabase-js"], state: active, last: "sato@2026-08-21" } */
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Splits an array into chunks of maximum chunkSize items
 */
export function chunkArray<T>(items: T[], chunkSize: number = 50): T[][] {
  if (!items || items.length === 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Pure helper to aggregate download counts across subscription downloads, free downloads, and order purchases
 */
export function aggregateDownloadRecords(
  slugs: string[],
  subData: Array<{ template_slug?: string | null }> = [],
  freeData: Array<{ template_slug?: string | null }> = [],
  orderData: Array<{ slug?: string | null }> = []
): Record<string, number> {
  const counts: Record<string, number> = {};

  (subData || []).forEach((row) => {
    if (row.template_slug) {
      counts[row.template_slug] = (counts[row.template_slug] || 0) + 1;
    }
  });

  (freeData || []).forEach((row) => {
    if (row.template_slug) {
      counts[row.template_slug] = (counts[row.template_slug] || 0) + 1;
    }
  });

  (orderData || []).forEach((row) => {
    if (row.slug) {
      counts[row.slug] = (counts[row.slug] || 0) + 1;
    }
  });

  const result: Record<string, number> = {};
  (slugs || []).forEach((slug) => {
    result[slug] = counts[slug] || 0;
  });

  return result;
}

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

    return {
      total: realTotal,
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
 * Uses 50-item chunking to guarantee PostgREST compatibility.
 */
export async function getBatchTemplateDownloads(
  supabase: SupabaseClient,
  slugs: string[]
): Promise<Record<string, number>> {
  if (!slugs || slugs.length === 0) return {};

  try {
    const slugChunks = chunkArray(slugs, 50);
    const subDataAll: any[] = [];
    const freeDataAll: any[] = [];
    const orderDataAll: any[] = [];

    await Promise.all(
      slugChunks.map(async (chunk) => {
        const [{ data: subData }, { data: freeData }, { data: orderData }] = await Promise.all([
          supabase.from('downloads').select('template_slug').in('template_slug', chunk),
          supabase.from('free_downloads').select('template_slug').in('template_slug', chunk),
          supabase.from('order_items').select('slug').in('slug', chunk),
        ]);

        if (subData) subDataAll.push(...subData);
        if (freeData) freeDataAll.push(...freeData);
        if (orderData) orderDataAll.push(...orderData);
      })
    );

    return aggregateDownloadRecords(slugs, subDataAll, freeDataAll, orderDataAll);
  } catch (e) {
    console.error('Error in batch template downloads:', e);
    const fallback: Record<string, number> = {};
    slugs.forEach((s) => {
      fallback[s] = 0;
    });
    return fallback;
  }
}
