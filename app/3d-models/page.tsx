import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getSupabaseServerClient } from '../../lib/supabaseServer';
import { getSupabaseAdminClient } from '../../lib/supabaseAdmin';
import { getBatchTemplateDownloads } from '../../lib/downloadStats';
import Model3DClient from './Model3DClient';
import LoadingSpinnerServer from '../../components/ui/loading-spinner-server';

export const metadata: Metadata = {
  title: '3D Models & Game Assets (GLB, GLTF, OBJ) | Celite Market',
  description: 'Download high-quality 3D models for game development, architectural visualization, animation, and CGI on Celite Market with lifetime access.',
  keywords: [
    '3d models',
    'glb 3d models',
    'gltf models',
    'obj 3d assets',
    'game dev 3d models',
    'blender 3d models',
    'unreal engine 3d models',
    'celite market',
  ],
  openGraph: {
    title: '3D Models & Game Assets (GLB, GLTF, OBJ) | Celite Market',
    description: 'Explore 3D models and digital assets on Celite Market.',
    type: 'website',
  },
};

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function Model3DPage() {
  const supabase = getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  
  // Fetch 3D Models category - try to find by slug first
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .or('slug.ilike.3d-models,slug.ilike.3d%models,name.ilike.3d%model')
    .maybeSingle();

  let templates: any[] = [];
  
  if (category) {
    const { data, error } = await supabase
      .from('templates')
      .select('slug,name,subtitle,description,img,video,video_path,thumbnail_path,audio_preview_path,model_3d_path,features,software,plugins,tags,created_at,category_id,subcategory_id,feature,vendor_name,status,creator_shop_id')
      .eq('status', 'approved')
      .eq('category_id', category.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching 3D models:', error);
    } else {
      templates = data || [];
    }
  }

  // Fetch real download counts in batch using bypass-RLS admin client
  const slugs = templates.map(t => t.slug);
  let counts: Record<string, number> = {};
  if (slugs.length > 0) {
    try {
      counts = await getBatchTemplateDownloads(admin, slugs);
    } catch (e) {
      console.error('Error fetching batch download counts on 3d-models page:', e);
    }
  }

  // Map templates to match Template type
  const mappedTemplates = templates.map(t => ({
    ...t,
    price: 0,
    is_featured: Boolean((t as any).feature),
    feature: Boolean((t as any).feature),
    downloadCount: counts[t.slug] || 0,
  }));

  return (
    <Suspense fallback={<LoadingSpinnerServer message="Loading 3D models..." />}>
      <Model3DClient 
        initialTemplates={mappedTemplates as any}
        pageTitle="3D Models"
        pageSubtitle="Discover high-quality 3D models for your projects. Download free GLB, GLTF, and OBJ files for game development, animation, and more."
        breadcrumbLabel="3D Models"
        basePath="/3d-models"
      />
    </Suspense>
  );
}

