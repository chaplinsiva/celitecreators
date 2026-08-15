import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSupabaseServerClient } from '../../lib/supabaseServer';
import SfxClient from './SfxClient';
import LoadingSpinnerServer from '../../components/ui/loading-spinner-server';

export const metadata: Metadata = {
  title: 'Royalty-Free Sound Effects (SFX) | Celite Market',
  description: 'Download royalty-free sound effects for video editing, game development, film production, and podcasts on Celite Market with lifetime access.',
  keywords: [
    'sound effects',
    'royalty free sfx',
    'sfx for video editing',
    'foley sound effects',
    'game sound effects',
    'cinematic sfx',
    'celite market',
  ],
  openGraph: {
    title: 'Royalty-Free Sound Effects (SFX) | Celite Market',
    description: 'Download royalty-free sound effects for video editing, game development, and film production on Celite Market.',
    url: 'https://celitemarket.in/sound-effects',
    siteName: 'Celite Market',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Sound Effects Library - Celite Market' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sound Effects Library | Celite Market',
    description: 'Download royalty-free sound effects for video editing and games on Celite Market.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://celitemarket.in/sound-effects',
  },
};

export const revalidate = 60;

export default async function SoundEffectsPage() {
  const supabase = getSupabaseServerClient();
  
  // First get the Sound Effects category ID
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'sound-effects')
    .maybeSingle();

  if (!category) {
    // Category doesn't exist yet, return empty array
    return (
      <Suspense fallback={<LoadingSpinnerServer message="Loading sound effects library..." />}>
        <SfxClient initialTemplates={[]} />
      </Suspense>
    );
  }

  // Fetch Sound Effects templates
  const { data: templates, error } = await supabase
    .from('templates')
    .select('slug,name,subtitle,description,img,video,video_path,thumbnail_path,audio_preview_path,features,software,plugins,tags,created_at,category_id,subcategory_id,sub_subcategory_id,feature,vendor_name,status,creator_shop_id')
    .eq('status', 'approved')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sound effects templates:', error);
  }

  // Map templates to match Template type
  const mappedTemplates = (templates || []).map(t => ({
    ...t,
    price: 0,
    is_featured: Boolean((t as any).feature),
    feature: Boolean((t as any).feature),
  }));

  return (
    <Suspense fallback={<LoadingSpinnerServer message="Loading sound effects library..." />}>
      <SfxClient initialTemplates={mappedTemplates as any} />
    </Suspense>
  );
}


