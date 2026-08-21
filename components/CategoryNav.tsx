// agent-notes: { ctx: "Deep black Category Navigation with smooth blue-to-rose ethereal gradient active pills", deps: ["next/link", "next/navigation", "lib/supabaseClient.ts"], state: active, last: "sato@2026-08-14" }
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSupabaseBrowserClient } from '../lib/supabaseClient';

type Category = {
    id: string;
    name: string;
    slug: string;
};

// Map category slugs to their display names and routes
const categoryDisplayMap: Record<string, { label: string; route: string }> = {
    'video-templates': { label: 'Video Templates', route: '/video-templates' },
    'after-effects': { label: 'Video Templates', route: '/video-templates' },
    'stock-images': { label: 'Photos', route: '/stock-photos' },
    'stock-photos': { label: 'Photos', route: '/stock-photos' },
    'stock-musics': { label: 'Music', route: '/stock-musics' },
    'sound-effects': { label: 'SFX', route: '/sound-effects' },
    'website-templates': { label: 'Web', route: '/web-templates' },
    'web-templates': { label: 'Web', route: '/web-templates' },
    'psd-templates': { label: 'Graphics', route: '/graphics' },
    'graphics': { label: 'Graphics', route: '/graphics' },
    '3d-models': { label: '3D', route: '/3d-models' },
};

// Desired display order
const displayOrder = [
    'Video Templates', 'Save Date', 'Photos', 'Music', 'SFX', 'Web', 'Graphics', '3D'
];

// Static nav items that aren't top-level categories
const staticNavItems: { label: string; route: string }[] = [
    { label: 'Save Date', route: '/video-templates?sub_subcategory=save-date' },
];

export default function CategoryNav() {
    const pathname = usePathname();
    const [navItems, setNavItems] = useState<{ label: string; route: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const supabase = getSupabaseBrowserClient();
            try {
                const { data } = await supabase
                    .from('categories')
                    .select('id,name,slug')
                    .order('name');

                if (data) {
                    const seen = new Set<string>();
                    const items: { label: string; route: string }[] = [];

                    for (const cat of data) {
                        const mapping = categoryDisplayMap[cat.slug];
                        if (mapping && !seen.has(mapping.label)) {
                            seen.add(mapping.label);
                            items.push(mapping);
                        }
                    }

                    for (const staticItem of staticNavItems) {
                        if (!seen.has(staticItem.label)) {
                            seen.add(staticItem.label);
                            items.push(staticItem);
                        }
                    }

                    items.sort((a, b) => {
                        const indexA = displayOrder.indexOf(a.label);
                        const indexB = displayOrder.indexOf(b.label);
                        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                    });

                    setNavItems(items);
                }
            } catch (err) {
                console.error('Error fetching categories for nav:', err);
            }
        };

        fetchCategories();
    }, []);

    // Check if a route is active (supports query params)
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isActive = (route: string) => {
        if (route.includes('?')) {
            const [routePath, routeQuery] = route.split('?');
            if (pathname !== routePath) return false;
            const routeParams = new URLSearchParams(routeQuery);
            if (!searchParams) return false;
            for (const [key, value] of routeParams.entries()) {
                if (searchParams.get(key) !== value) return false;
            }
            return true;
        }
        return pathname === route;
    };

    return (
        <div className="w-full bg-black/98 backdrop-blur-2xl border-b border-zinc-900 hidden lg:block fixed top-[80px] left-0 z-[90] shadow-2xl shadow-black">
            <div className="max-w-[1440px] mx-auto px-6 sm:px-8 h-11 flex items-center justify-center">
                <nav className="flex items-center gap-2">
                    {navItems.map((item) => {
                        const active = isActive(item.route);
                        return (
                            <Link
                                key={item.label}
                                href={item.route}
                                className={`
                                    relative px-4 py-1.5 text-[13px] rounded-full transition-all duration-300
                                    ${active
                                        ? 'bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-400 text-white font-black shadow-lg shadow-sky-500/25 scale-105 border border-white/25'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/90 font-medium border border-transparent hover:border-zinc-800'
                                    }
                                `}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
