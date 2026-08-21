import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSupabaseServerClient } from '../../lib/supabaseServer';
import { getSupabaseAdminClient } from '../../lib/supabaseAdmin';
import { getBatchTemplateDownloads } from '../../lib/downloadStats';
import StockMusicsClient from './StockMusicsClient';
import LoadingSpinnerServer from '../../components/ui/loading-spinner-server';

export const metadata: Metadata = {
  title: 'Royalty-Free Stock Music Library | Celite Market',
  description: 'Download royalty-free stock music tracks for YouTube videos, films, podcasts, and ads on Celite Market with pay-per-product lifetime access.',
  keywords: [
    'royalty free music',
    'stock music',
    'background music for videos',
    'youtube background music',
    'cinematic music tracks',
    'royalty free audio',
    'celite market',
  ],
  openGraph: {
    title: 'Royalty-Free Stock Music Library | Celite Market',
    description: 'Explore royalty-free stock music tracks on Celite Market.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Stock Music Library - Celite Market' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock Music Library | Celite Market',
    description: 'Download royalty-free stock music for videos and films on Celite Market.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://celitemarket.in/stock-musics',
  },
};

export const revalidate = 60;

export default async function StockMusicsPage() {
  const supabase = getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  // First get the category ID for 'stock-musics'
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'stock-musics')
    .single();

  if (!category) {
    // If the category doesn't exist yet, return empty array
    return (
      <Suspense fallback={<LoadingSpinnerServer message="Loading stock music library..." />}>
        <StockMusicsClient initialTemplates={[]} />
      </Suspense>
    );
  }

  // Fetch templates for the "Stock Musics" category
  const { data: templates, error } = await supabase
    .from('templates')
    .select('slug,name,subtitle,description,img,video,video_path,thumbnail_path,audio_preview_path,features,software,plugins,tags,created_at,category_id,subcategory_id,sub_subcategory_id,feature,vendor_name,status,creator_shop_id')
    .eq('status', 'approved')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stock music templates:', error);
  }

  // Fetch real download counts in batch using bypass-RLS admin client
  const slugs = (templates || []).map(t => t.slug);
  let counts: Record<string, number> = {};
  if (slugs.length > 0) {
    try {
      counts = await getBatchTemplateDownloads(admin, slugs);
    } catch (e) {
      console.error('Error fetching batch download counts on stock-musics page:', e);
    }
  }

  // Map templates to match Template type
  const mappedTemplates = (templates || []).map(t => ({
    ...t,
    price: 0,
    is_featured: Boolean((t as any).feature),
    feature: Boolean((t as any).feature),
    downloadCount: counts[t.slug] || 0,
  }));

  return (
    <Suspense fallback={<LoadingSpinnerServer message="Loading stock music library..." />}>
      <StockMusicsClient initialTemplates={mappedTemplates as any} />
    </Suspense>
  );
}