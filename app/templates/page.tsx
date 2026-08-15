import type { Metadata } from 'next';
import { Suspense } from 'react';
import TemplatesClient from './TemplatesClient';
import { getSupabaseServerClient } from '../../lib/supabaseServer';

export const metadata: Metadata = {
    title: "All Creative Digital Assets & Templates | Celite Market",
    description: "Explore Celite Market's digital asset catalog. Download After Effects video templates, wedding save the date videos, 3D models, royalty-free music, and sound effects with lifetime access.",
    keywords: ['celite market', 'after effects templates', 'wedding templates', 'save the date template', 'video templates', 'creative digital assets', '3d models', 'royalty free music', 'sound effects'],
    openGraph: {
        title: 'All Creative Digital Assets & Templates | Celite Market',
        description: 'Explore the complete Celite Market catalog. Download After Effects video templates, wedding save the date videos, 3D models, stock music, and sound effects.',
        url: 'https://celitemarket.in/templates',
        siteName: 'Celite Market',
        type: 'website',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Celite Market - Digital Assets Marketplace' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'All Creative Digital Assets & Templates | Celite Market',
        description: 'Explore After Effects templates, wedding videos, 3D models, music & sound effects on Celite Market.',
        images: ['/og-image.png'],
    },
    alternates: {
        canonical: 'https://celitemarket.in/templates',
    },
};

// Enable ISR (caching on CDN edge for 60 seconds)
export const revalidate = 60;

export default async function TemplatesPage() {
    const supabase = getSupabaseServerClient();

    // Fetch all categories from the database
    const { data: dbCategories, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

    if (categoryError || !dbCategories) {
        console.error('Error loading categories on server:', categoryError);
        return (
            <Suspense fallback={
                <main className="bg-background min-h-screen pt-20 pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-20">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                            <p className="mt-4 text-zinc-600">Loading templates...</p>
                        </div>
                    </div>
                </main>
            }>
                <TemplatesClient initialCategoryGroups={[]} />
            </Suspense>
        );
    }

    // Fetch top 8 templates and total count for each category in parallel
    const groups = await Promise.all(
        dbCategories.map(async (category) => {
            const { data: templates, error: templatesError } = await supabase
                .from('templates')
                .select('slug, name, img, video, video_path, thumbnail_path, audio_preview_path, model_3d_path, category_id')
                .eq('status', 'approved')
                .eq('category_id', category.id)
                .order('created_at', { ascending: false })
                .limit(8);

            if (templatesError) {
                console.error(`Error loading templates for category ${category.name}:`, templatesError);
            }

            const { count, error: countError } = await supabase
                .from('templates')
                .select('slug', { count: 'exact', head: true })
                .eq('status', 'approved')
                .eq('category_id', category.id);

            if (countError) {
                console.error(`Error counting templates for category ${category.name}:`, countError);
            }

            return {
                category,
                displayName: category.name,
                templates: (templates || []).map((t: any) => ({
                    ...t,
                    categories: category
                })),
                count: count || 0,
            };
        })
    );

    // Filter out categories with no templates
    const filteredGroups = groups.filter(group => group.templates.length > 0);

    // Sort by count (descending), then by name
    filteredGroups.sort((a, b) => {
        if (b.count !== a.count) {
            return b.count - a.count;
        }
        return a.displayName.localeCompare(b.displayName);
    });

    return (
        <Suspense fallback={
            <main className="bg-background min-h-screen pt-20 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-20">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-4 text-zinc-600">Loading templates...</p>
                    </div>
                </div>
            </main>
        }>
            <TemplatesClient initialCategoryGroups={filteredGroups as any} />
        </Suspense>
    );
}

