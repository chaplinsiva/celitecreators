"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../context/AppContext';
import { getSupabaseBrowserClient } from '../lib/supabaseClient';
import { Menu, X, Search, ChevronDown, Loader2 } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn, convertR2UrlToCdn } from '../lib/utils';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
};

type SubSubcategory = {
  id: string;
  subcategory_id: string;
  name: string;
  slug: string;
};

type LiveSearchResult = {
  slug: string;
  name: string;
  price?: number;
  thumbnail_path?: string | null;
  img?: string | null;
  categoryName?: string;
  categorySlug?: string;
};

// Helper function to get the correct route for a category
const getCategoryRoute = (categorySlug: string): string => {
  const normalizedSlug = categorySlug.toLowerCase().trim();

  const routeMap: Record<string, string> = {
    'after-effects': '/video-templates',
    'website-templates': '/web-templates',
    'psd-templates': '/graphics',
    'stock-musics': '/stock-musics',
    'stock-images': '/stock-photos',
    'web-templates': '/web-templates',
    'graphics': '/graphics',
    'music': '/stock-musics',
    'audio': '/stock-musics',
    'sound-effects': '/sound-effects',
    'stock-photos': '/stock-photos',
    'video-templates': '/video-templates',
    'ui-templates': '/web-templates',
    '3d-models': '/3d-models',
    'prompts': '/prompts',
  };

  if (routeMap[normalizedSlug]) {
    return routeMap[normalizedSlug];
  }

  // Check for partial matches
  if (normalizedSlug.includes('music') || normalizedSlug.includes('audio')) {
    return '/stock-musics';
  }
  if (normalizedSlug.includes('sfx') || normalizedSlug.includes('sound')) {
    return '/sound-effects';
  }
  if (normalizedSlug.includes('stock') && (normalizedSlug.includes('photo') || normalizedSlug.includes('image'))) {
    return '/stock-photos';
  }
  if (normalizedSlug.includes('web') || normalizedSlug.includes('website') || normalizedSlug.includes('ui')) {
    return '/web-templates';
  }
  if (normalizedSlug.includes('graphic') || normalizedSlug.includes('psd')) {
    return '/graphics';
  }
  if (normalizedSlug.includes('after-effects') || normalizedSlug.includes('video')) {
    return '/video-templates';
  }
  if (normalizedSlug.includes('3d') || normalizedSlug.includes('model')) {
    return '/3d-models';
  }

  return `/video-templates?category=${categorySlug}`;
};

const MARKETPLACE_CATEGORIES = [
  { name: 'All Categories', slug: '' },
  { name: 'Video Templates', slug: 'video-templates' },
  { name: 'Sound Effects', slug: 'sound-effects' },
  { name: 'Stock Music', slug: 'stock-musics' },
  { name: '3D Models', slug: '3d-models' },
  { name: 'Web Templates', slug: 'web-templates' },
  { name: 'Graphics & PSD', slug: 'graphics' },
  { name: 'Stock Photos', slug: 'stock-photos' },
];

export default function Header() {
  const router = useRouter();
  const { user, isAuthLoading, logout } = useAppContext();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasCreatorShop, setHasCreatorShop] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subSubcategories, setSubSubcategories] = useState<SubSubcategory[]>([]);
  const [activeNavItem, setActiveNavItem] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  
  // Search Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState({ name: 'All Categories', slug: '' });
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [liveResults, setLiveResults] = useState<LiveSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Christmas theme: Show festive logo in December
  const isDecember = new Date().getMonth() === 11;

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsLiveOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Instant Search debounced query
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setLiveResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const supabase = getSupabaseBrowserClient();
        const cleanQuery = searchQuery.trim();
        
        let req = supabase
          .from('templates')
          .select('slug, name, price, thumbnail_path, img, category_id, categories(name, slug)')
          .eq('status', 'approved')
          .ilike('name', `%${cleanQuery}%`)
          .limit(6);

        const { data, error } = await req;
        if (!error && data) {
          const formatted: LiveSearchResult[] = data.map((item: any) => ({
            slug: item.slug,
            name: item.name,
            price: Number(item.price || 399),
            thumbnail_path: item.thumbnail_path,
            img: item.img,
            categoryName: item.categories?.name || 'Template',
            categorySlug: item.categories?.slug || 'video-templates',
          }));
          setLiveResults(formatted);
          setIsLiveOpen(true);
        }
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Execute Full Search Navigation
  const executeSearch = (targetQuery?: string) => {
    const query = (targetQuery !== undefined ? targetQuery : searchQuery).trim();
    if (!query) return;

    setIsLiveOpen(false);
    setIsCategoryMenuOpen(false);
    setIsMobileMenuOpen(false);

    const targetRoute = selectedCategory.slug 
      ? getCategoryRoute(selectedCategory.slug)
      : '/video-templates';

    router.push(`${targetRoute}?search=${encodeURIComponent(query)}`);
  };

  // Fetch categories, subcategories, and sub-subcategories
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = getSupabaseBrowserClient();
      try {
        const [catsRes, subcatsRes, subSubcatsRes] = await Promise.all([
          supabase.from('categories').select('id,name,slug').order('name'),
          supabase.from('subcategories').select('id,category_id,name,slug').order('name'),
          supabase.from('sub_subcategories').select('id,subcategory_id,name,slug').order('name'),
        ]);

        if (catsRes.data) {
          setCategories(catsRes.data);
        }
        if (subcatsRes.data) {
          setSubcategories(subcatsRes.data);
        }
        if (subSubcatsRes.data) {
          setSubSubcategories(subSubcatsRes.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const checkSubscriptionAndCreator = async () => {
      if (!user) {
        setIsSubscribed(false);
        setIsExpired(false);
        setHasCreatorShop(false);
        return;
      }
      const supabase = getSupabaseBrowserClient();
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('is_active, valid_until')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!sub) {
        setIsSubscribed(false);
        setIsExpired(false);
      } else {
        const now = Date.now();
        const validUntil = sub.valid_until ? new Date(sub.valid_until).getTime() : null;
        const actuallyActive = !!sub.is_active && (!validUntil || validUntil > now);
        const expired: boolean = !!(sub.is_active && validUntil && validUntil <= now);

        setIsSubscribed(actuallyActive);
        setIsExpired(expired);
      }

      // Check if user has a creator shop
      try {
        const { data: shop } = await supabase
          .from('creator_shops')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        setHasCreatorShop(!!shop);
      } catch {
        setHasCreatorShop(false);
      }
    };
    checkSubscriptionAndCreator();
  }, [user]);

  return (
    <>
      <header className="w-full fixed top-0 left-0 z-[100] bg-black/98 backdrop-blur-2xl border-b border-zinc-900 shadow-2xl shadow-black transition-all duration-300">
        {/* Subtle Ambient Light Blue Top Flare */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent pointer-events-none" />
        
        <nav className="max-w-[1440px] mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sm:gap-6">
          {/* Left: Curved Logo & Brand */}
          <Link href="/" className="inline-flex items-center gap-3 focus:outline-none hover:opacity-95 transition-opacity shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-black border border-zinc-800 overflow-hidden flex items-center justify-center shadow-lg shadow-sky-500/10 group-hover:border-sky-500/50 group-hover:scale-105 transition-all">
              <img 
                src={isDecember ? "/chirtsmaslogo.png" : "/logo/logo.png"} 
                alt="Celite Market Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1">
              Celite<span className="text-sky-400">Market</span>
            </span>
          </Link>

          {/* Center: Global Search Bar (Medium & Large screens) */}
          <div ref={searchContainerRef} className="relative hidden md:flex items-center flex-1 max-w-md xl:max-w-xl">
            <div className="flex items-center w-full bg-[#04060A] rounded-xl border border-zinc-800/90 focus-within:border-sky-500/80 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all group overflow-hidden shadow-inner">
              {/* Category Dropdown */}
              <div ref={categoryMenuRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  className="flex items-center gap-1.5 px-3.5 h-10 text-[13px] font-medium text-zinc-300 hover:text-white border-r border-zinc-800 transition-colors cursor-pointer"
                >
                  <span className="max-w-[110px] truncate">{selectedCategory.name}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 text-zinc-400 group-hover:text-sky-400", isCategoryMenuOpen && "rotate-180")} />
                </button>

                {isCategoryMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-[#04060A] rounded-xl shadow-2xl border border-zinc-800 py-1.5 z-[120] animate-in fade-in zoom-in-95 duration-150">
                    {MARKETPLACE_CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat.slug || 'all'}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                          selectedCategory.slug === cat.slug
                            ? "bg-sky-500/10 text-sky-400 font-bold"
                            : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {selectedCategory.slug === cat.slug && (
                          <span className="text-sky-400 text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeSearch();
                }}
                className="flex items-center flex-1 min-w-0"
              >
                <input
                  type="text"
                  placeholder="Search templates, music, SFX, 3D assets..."
                  value={searchQuery}
                  onFocus={() => {
                    if (liveResults.length > 0) setIsLiveOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsLiveOpen(false);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-[13px] font-medium text-white placeholder:text-zinc-500 px-3.5 py-2 outline-none"
                />
                <button
                  type="submit"
                  className="p-2.5 mr-1 text-zinc-400 hover:text-sky-400 transition-colors cursor-pointer"
                  title="Search Celite Market"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>

            {/* Live Instant Search Suggestions Dropdown */}
            {isLiveOpen && liveResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#04060A]/95 backdrop-blur-2xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden z-[130] animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 divide-y divide-zinc-900">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Instant Results</span>
                    <span className="text-[10px] text-sky-400 font-mono font-normal">
                      {liveResults.length} matches
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    {liveResults.map((item) => {
                      const thumb = item.thumbnail_path || item.img;
                      const thumbUrl = thumb ? convertR2UrlToCdn(thumb) : null;
                      return (
                        <Link
                          key={item.slug}
                          href={`/product/${item.slug}`}
                          onClick={() => {
                            setIsLiveOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-zinc-900/90 transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                              {thumbUrl ? (
                                <img
                                  src={thumbUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <span className="text-zinc-600 text-xs">🎬</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors truncate">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                {item.categoryName || 'Marketplace Asset'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-sky-400">
                              ₹{item.price || 399}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => executeSearch()}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-900/80 hover:bg-sky-600 hover:text-white text-zinc-300 text-xs font-bold transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Creator link */}
            {!isAuthLoading && user && !hasCreatorShop && (
              <Link
                href="/start-selling"
                className="hidden lg:block text-xs sm:text-[13px] font-semibold text-zinc-300 hover:text-sky-400 transition-colors"
              >
                Sell on Celite Market
              </Link>
            )}
            {!isAuthLoading && user && hasCreatorShop && (
              <Link
                href="/creator/dashboard"
                className="hidden lg:block text-xs sm:text-[13px] font-semibold text-zinc-300 hover:text-sky-400 transition-colors"
              >
                Creator Dashboard
              </Link>
            )}

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthLoading ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block w-16 h-9 bg-zinc-900 rounded-xl animate-pulse" />
                  <div className="w-9 h-9 bg-zinc-900 rounded-xl animate-pulse" />
                </div>
              ) : !user ? (
                <>
                  <Link 
                    href="/login" 
                    className="hidden sm:inline-flex text-xs sm:text-sm font-medium text-zinc-300 hover:text-white px-3.5 py-2 hover:bg-zinc-900 rounded-xl transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-md shadow-sky-950/80 hover:shadow-sky-900/60 active:scale-95 whitespace-nowrap"
                  >
                    Join Celite Market
                  </Link>
                </>
              ) : (
                <Link href="/dashboard" className="relative group">
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all bg-[#04060A] text-zinc-200 hover:bg-zinc-900">
                    <span className="text-xs font-semibold text-zinc-200 hidden sm:block">
                      My Account
                    </span>
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {(user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="md:hidden p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-2xl border-b border-zinc-900 px-4 pt-3 pb-6 flex flex-col gap-3">
            {/* Mobile search bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/video-templates?search=${encodeURIComponent(searchQuery)}`);
                  setIsMobileMenuOpen(false);
                }
              }}
              className="flex items-center bg-[#04060A] rounded-xl border border-zinc-800 px-3.5 py-2 mb-2"
            >
              <input
                type="text"
                placeholder="Search templates, music, 3D..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
              <button type="submit" className="text-zinc-400 hover:text-sky-400">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile nav links */}
            {[
              { name: 'Video Templates', route: '/video-templates', slug: 'video-templates' },
              { name: 'Photos', route: '/stock-photos', slug: 'stock-images' },
              { name: 'Music', route: '/stock-musics', slug: 'stock-musics' },
              { name: 'SFX', route: '/sound-effects', slug: 'sound-effects' },
              { name: 'Web', route: '/web-templates', slug: 'website-templates' },
              { name: 'Graphics', route: '/graphics', slug: 'psd-templates' },
              { name: '3D Models', route: '/3d-models', slug: '3d-models' },
              { name: 'Prompts', route: '/prompts', slug: 'prompts' },
            ].map((navItem) => (
              <Link
                key={navItem.slug}
                href={navItem.route}
                className="text-base font-medium text-zinc-200 hover:text-sky-400 py-2 border-b border-zinc-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {navItem.name}
              </Link>
            ))}

            {!isAuthLoading && user && !hasCreatorShop && (
              <Link
                href="/start-selling"
                className="text-base font-medium text-sky-400 py-2 border-b border-zinc-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sell on Celite Market
              </Link>
            )}
            {!isAuthLoading && user && hasCreatorShop && (
              <Link
                href="/creator/dashboard"
                className="text-base font-medium text-sky-400 py-2 border-b border-zinc-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Creator Dashboard
              </Link>
            )}

            {!isAuthLoading && !user && (
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/login"
                  className="w-full text-center text-sm font-semibold text-zinc-200 bg-zinc-900 border border-zinc-800 py-3 rounded-xl hover:bg-zinc-800 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="w-full text-center text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 py-3 rounded-xl transition-all shadow-md shadow-sky-950/80"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Join Celite Market
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}

