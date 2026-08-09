"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../context/AppContext';
import { getSupabaseBrowserClient } from '../lib/supabaseClient';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '../lib/utils';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState({ name: 'All Categories', slug: '' });
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  // Christmas theme: Show festive logo in December
  const isDecember = new Date().getMonth() === 11;


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
          // Include all categories in the navbar menu
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
      <header className="w-full fixed top-0 left-0 z-[100] bg-black border-b border-zinc-800/80 shadow-lg transition-all duration-300">
        <nav className="max-w-[1440px] mx-auto h-20 px-6 sm:px-8 flex items-center justify-between">
          {/* Left: Logo & Nav */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 focus:outline-none hover:opacity-90 transition-opacity shrink-0">
              <img src={isDecember ? "/chirtsmaslogo.png" : "/logo/logo.png"} alt="Celite Market Logo" className="h-9 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight leading-none">CELITE MARKET</span>
                <span className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">Digital Asset Marketplace</span>
              </div>
            </Link>

            {/* Global Search Bar */}
            <div className="hidden lg:flex items-center ml-4 bg-zinc-950 rounded-xl border border-zinc-800 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all group">
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  className="flex items-center gap-1.5 px-4 h-10 text-[13px] font-medium text-zinc-300 hover:text-white border-r border-zinc-800 transition-colors"
                >
                  <span className="max-w-[100px] truncate">{selectedCategory.name}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 text-zinc-400 group-hover:text-zinc-200", isCategoryMenuOpen && "rotate-180")} />
                </button>

                {isCategoryMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-950 rounded-xl shadow-2xl border border-zinc-800 py-2 z-[110] animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={() => {
                        setSelectedCategory({ name: 'All Categories', slug: '' });
                        setIsCategoryMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-800/80 transition-colors font-medium text-zinc-300 hover:text-white"
                    >
                      All Categories
                    </button>
                    {[
                      { name: 'Video Templates', slug: 'video-templates' },
                      { name: 'Stock Photos', slug: 'stock-images' },
                      { name: 'Music & SFX', slug: 'stock-musics' },
                      { name: 'Web Templates', slug: 'website-templates' },
                      { name: 'Graphics', slug: 'psd-templates' },
                      { name: '3D Models', slug: '3d-models' },
                    ].map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-800/80 transition-colors font-medium text-zinc-300 hover:text-white"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    const route = selectedCategory.slug ? getCategoryRoute(selectedCategory.slug) : '/video-templates';
                    router.push(`${route}?search=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                className="flex items-center flex-1 min-w-[200px] xl:min-w-[350px]"
              >
                <input
                  type="text"
                  placeholder={`Search After Effects, SFX, Music, 3D Assets...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-[13px] font-medium text-white placeholder:text-zinc-500 px-4"
                />
                <button type="submit" className="p-2 mr-1 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Celite Subscription External Redirect Link */}
            <a
              href="https://celitemarket.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 bg-sky-950/40 border border-sky-800/40 px-3.5 py-1.5 rounded-lg transition shadow-sm hover:bg-sky-900/40"
            >
              Celite Subscription ₹499/mo →
            </a>

            {/* Creator link (Desktop) */}
            {!isAuthLoading && user && !hasCreatorShop && (
              <Link
                href="/start-selling"
                className="hidden md:block text-[13px] font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Sell on Celite Market
              </Link>
            )}
            {!isAuthLoading && user && hasCreatorShop && (
              <Link
                href="/creator/dashboard"
                className="hidden md:block text-[13px] font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Creator Dashboard
              </Link>
            )}

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {isAuthLoading ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-20 h-9 bg-zinc-900 rounded-lg animate-pulse" />
                  <div className="w-8 h-8 sm:w-28 sm:h-10 bg-zinc-900 rounded-lg animate-pulse" />
                </div>
              ) : !user ? (
                <>
                  <Link href="/login" className="hidden sm:block text-[13px] font-medium text-zinc-300 px-4 py-2 hover:bg-zinc-800/60 hover:text-white rounded-lg transition-colors">
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-sky-600 hover:bg-sky-500 text-white px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95"
                  >
                    Join Celite Market
                  </Link>
                </>
              ) : (
                <>
                  {!isSubscribed && (
                    <Link
                      href="/pricing"
                      className="hidden sm:block bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 text-xs font-semibold rounded-lg border border-sky-500 transition-all shadow-sm"
                    >
                      Subscribe Now
                    </Link>
                  )}

                  {/* User Profile */}
                  <Link href="/dashboard" className="relative group">
                    <div className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all bg-zinc-900 text-zinc-200">
                      <span className="text-xs font-medium text-zinc-200 hidden sm:block">
                        My Account
                      </span>
                      {isSubscribed ? (
                        <div className="h-7 w-7 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 p-[1.5px]">
                          <div className="h-full w-full rounded-full bg-[#0D111A] flex items-center justify-center">
                            <span className="font-bold text-xs text-sky-400">
                              {(user.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 text-xs font-bold">
                          {(user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-zinc-300 hover:bg-zinc-900 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-[#0D111A] border-b border-zinc-800/60 shadow-xl py-6 px-6 flex flex-col gap-4 animate-in slide-in-from-top-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {/* Mobile nav */}
            {[
              { name: 'Video Templates', route: '/video-templates', slug: 'video-templates' },
              { name: 'Photos', route: '/stock-photos', slug: 'stock-images' },
              { name: 'Music', route: '/stock-musics', slug: 'stock-musics' },
              { name: 'SFX', route: '/sound-effects', slug: 'sound-effects' },
              { name: 'Web', route: '/web-templates', slug: 'website-templates' },
              { name: 'Graphics', route: '/graphics', slug: 'psd-templates' },
              { name: '3D', route: '/3d-models', slug: '3d-models' },
              { name: 'Prompts', route: '/prompts', slug: 'prompts' },
            ].map((navItem) => {
              const category = categories.find(cat =>
                cat.slug === navItem.slug ||
                cat.name.toLowerCase() === navItem.name.toLowerCase()
              );

              if (!category) return null;

              const categorySubcategories = subcategories.filter(
                sub => sub.category_id === category.id
              );

              return (
                <div key={navItem.slug} className="border-b border-zinc-900 pb-2">
                  <Link
                    href={navItem.route}
                    className="text-lg font-medium text-white py-2 block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {navItem.name}
                  </Link>
                  {categorySubcategories.length > 0 && (
                    <div className="ml-4 mt-2 space-y-1">
                      {categorySubcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={`${navItem.route}?subcategory=${subcategory.slug}`}
                          className="text-xs text-zinc-400 py-0.5 block hover:text-white"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {!isAuthLoading && user && !hasCreatorShop && (
              <Link
                href="/start-selling"
                className="text-lg font-medium text-zinc-300 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Start Selling
              </Link>
            )}
            {!isAuthLoading && user && hasCreatorShop && (
              <Link
                href="/creator/dashboard"
                className="text-lg font-medium text-zinc-300 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Creator Dashboard
              </Link>
            )}
            <Link
              href="/video-templates"
              className="text-lg font-medium text-zinc-300 py-2 border-b border-zinc-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Search Templates
            </Link>
            {!isAuthLoading && !user && (
              <Link
                href="/login"
                className="text-lg font-medium text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}

