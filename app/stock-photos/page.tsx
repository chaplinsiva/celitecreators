import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSupabaseServerClient } from '../../lib/supabaseServer';
import { getSupabaseAdminClient } from '../../lib/supabaseAdmin';
import { getBatchTemplateDownloads } from '../../lib/downloadStats';
import StockPhotosClient from './StockPhotosClient';
import LoadingSpinnerServer from '../../components/ui/loading-spinner-server';

export const metadata: Metadata = {
  title: 'Stock Photos & High-Res Images | Celite Market',
  description: 'Download high-resolution stock photos and royalty-free images for marketing, web design, and creative projects on Celite Market.',
  keywords: [
    'stock photos',
    'royalty free images',
    'high resolution stock photos',
    'commercial use photos',
    'photography assets',
    'celite market',
  ],
  openGraph: {
    title: 'Stock Photos & High-Res Images | Celite Market',
    description: 'Download high-resolution stock photos and royalty-free images on Celite Market.',
    url: 'https://celitemarket.in/stock-photos',
    siteName: 'Celite Market',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Stock Photos - Celite Market' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock Photos | Celite Market',
    description: 'Download high-resolution stock photos and royalty-free images on Celite Market.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://celitemarket.in/stock-photos',
  },
};

export const revalidate = 60;

export default async function StockPhotosPage() {
  const supabase = getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  
  // Fetch stock photos templates - Stock Images category
  const stockPhotoCategoryId = 'ba7f68c3-6f0f-4a29-a337-3b2cef7b4f47';
  const { data: templates, error } = await supabase
    .from('templates')
    .select('slug,name,subtitle,description,img,video,video_path,thumbnail_path,audio_preview_path,features,software,plugins,tags,created_at,category_id,subcategory_id,feature,vendor_name,status,creator_shop_id,source_path')
    .eq('status', 'approved')
    .eq('category_id', stockPhotoCategoryId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stock photos:', error);
  }

  // Fetch real download counts in batch using bypass-RLS admin client
  const slugs = (templates || []).map(t => t.slug);
  let counts: Record<string, number> = {};
  if (slugs.length > 0) {
    try {
      counts = await getBatchTemplateDownloads(admin, slugs);
    } catch (e) {
      console.error('Error fetching batch download counts on stock-photos page:', e);
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
    <Suspense fallback={<LoadingSpinnerServer message="Loading stock photos..." />}>
      <StockPhotosClient initialTemplates={mappedTemplates as any} />
    </Suspense>
  );
}

