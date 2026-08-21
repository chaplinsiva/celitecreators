import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSupabaseServerClient } from '../../lib/supabaseServer';
import { getSupabaseAdminClient } from '../../lib/supabaseAdmin';
import { getBatchTemplateDownloads } from '../../lib/downloadStats';
import VideoTemplatesClient from '../video-templates/VideoTemplatesClient';
import LoadingSpinnerServer from '../../components/ui/loading-spinner-server';

export const metadata: Metadata = {
  title: 'Responsive Website Templates & Themes | Celite Market',
  description: 'Download responsive website templates built with HTML5, CSS3, Tailwind CSS, and React on Celite Market with pay-per-product lifetime access.',
  keywords: [
    'website templates',
    'html templates',
    'css templates',
    'landing page templates',
    'portfolio website template',
    'tailwind css templates',
    'web design templates',
    'celite market',
  ],
  openGraph: {
    title: 'Responsive Website Templates & Themes | Celite Market',
    description: 'Download responsive website templates and landing page themes for developers and businesses on Celite Market.',
    url: 'https://celitemarket.in/web-templates',
    siteName: 'Celite Market',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Website Templates - Celite Market' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Templates | Celite Market',
    description: 'Download responsive website templates for developers and web designers on Celite Market.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://celitemarket.in/web-templates',
  },
};

export const revalidate = 60;

export default async function WebTemplatesPage() {
  const supabase = getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  
  // Fetch only Website Templates
  const websiteTemplatesCategoryId = 'bb7e7b01-19c7-4606-bcec-956eea4b1497';
  const { data: templates, error } = await supabase
    .from('templates')
    .select('slug,name,subtitle,description,img,video,video_path,thumbnail_path,audio_preview_path,features,software,plugins,tags,created_at,category_id,subcategory_id,feature,vendor_name,status,creator_shop_id')
    .eq('status', 'approved')
    .eq('category_id', websiteTemplatesCategoryId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching website templates:', error);
  }

  // Fetch real download counts in batch using bypass-RLS admin client
  const slugs = (templates || []).map(t => t.slug);
  let counts: Record<string, number> = {};
  if (slugs.length > 0) {
    try {
      counts = await getBatchTemplateDownloads(admin, slugs);
    } catch (e) {
      console.error('Error fetching batch download counts on web-templates page:', e);
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
    <Suspense fallback={<LoadingSpinnerServer message="Loading website templates..." />}>
      <VideoTemplatesClient 
        initialTemplates={mappedTemplates as any}
        pageTitle="Website Templates"
        pageSubtitle="Browse professional HTML, CSS, and JavaScript website templates for your next web project."
        breadcrumbLabel="Website Templates"
        basePath="/web-templates"
      />
    </Suspense>
  );
}

