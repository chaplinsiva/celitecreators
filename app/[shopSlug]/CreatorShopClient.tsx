"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Share2,
  Settings,
  ShieldCheck,
  MapPin,
  Globe,
  Instagram,
  Youtube,
  Twitter,
  Search,
  SlidersHorizontal,
  Sparkles,
  Music2,
  Image as ImageIcon,
  Video,
  Box,
  Layers,
  Mail,
  Zap,
  Calendar,
  CheckCircle2,
  Download,
} from "lucide-react";
import { convertR2UrlToCdn } from "@/lib/utils";
import { getBatchTemplateDownloads } from "@/lib/downloadStats";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useAppContext } from "@/context/AppContext";
import CreatorFollowButton from "@/components/CreatorFollowButton";
import ShareStoreModal from "@/components/ShareStoreModal";
import CustomizeStoreModal from "@/components/CustomizeStoreModal";
import VideoThumbnailPlayer from "@/components/VideoThumbnailPlayer";

type CreatorTemplate = {
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  img: string | null;
  video: string | null;
  video_path?: string | null;
  thumbnail_path?: string | null;
  audio_preview_path?: string | null;
  model_3d_path?: string | null;
  category_id: string | null;
  created_at: string | null;
  downloadCount?: number;
};

type Category = {
  id: string;
  name: string;
  slug?: string | null;
};

type GroupedSection = {
  category: Category | null;
  items: CreatorTemplate[];
};

export type ShopData = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  description: string | null;
  banner_url?: string | null;
  logo_url?: string | null;
  tagline?: string | null;
  location?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  twitter_url?: string | null;
  created_at?: string | null;
};

interface CreatorShopClientProps {
  shop: ShopData;
  groupedSections: GroupedSection[];
  initialFollowers: number;
  totalProducts: number;
}

const MUSIC_SFX_CATEGORY_ID = "143d45f1-a55b-42be-9f51-aab507a20fac";
const STOCK_PHOTOS_CATEGORY_ID = "ba7f68c3-6f0f-4a29-a337-3b2cef7b4f47";

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80";

function getThumbnail(t: CreatorTemplate) {
  if (t.thumbnail_path) return convertR2UrlToCdn(t.thumbnail_path) || t.thumbnail_path;
  if (t.img) return convertR2UrlToCdn(t.img) || t.img;
  return "/PNG1.png";
}

function TemplateCard({
  template,
  category,
  downloadCount = 0
}: {
  template: CreatorTemplate;
  category: Category | null;
  downloadCount?: number;
}) {
  const categoryId = category?.id || template.category_id;
  const categorySlug = category?.slug || "";

  const isStockPhoto =
    categoryId === STOCK_PHOTOS_CATEGORY_ID ||
    categorySlug === "stock-images" ||
    categorySlug === "stock-photos" ||
    (categorySlug.includes("stock") && (categorySlug.includes("photo") || categorySlug.includes("image")));

  const isMusicSfx =
    categoryId === MUSIC_SFX_CATEGORY_ID ||
    categorySlug === "musics-and-sfx" ||
    categorySlug === "music" ||
    categorySlug === "audio" ||
    categorySlug === "sound-effects" ||
    categorySlug.includes("music") ||
    categorySlug.includes("audio") ||
    categorySlug.includes("sfx") ||
    categorySlug.includes("sound");

  const is3DModel = categorySlug === "3d-models" || categorySlug.includes("3d");

  const renderPreview = () => {
    if (isStockPhoto) {
      const imageUrl =
        convertR2UrlToCdn(template.thumbnail_path) ||
        template.thumbnail_path ||
        convertR2UrlToCdn(template.img) ||
        template.img ||
        "/PNG1.png";
      return (
        <div className="relative w-full h-full">
          <img
            src={imageUrl}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </div>
      );
    }

    if (isMusicSfx) {
      const thumbnailUrl =
        convertR2UrlToCdn(template.thumbnail_path) ||
        template.thumbnail_path ||
        convertR2UrlToCdn(template.img) ||
        template.img;
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-purple-900 via-slate-900 to-sky-900">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
              <Music2 className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      );
    }

    if (template.video_path) {
      return (
        <VideoThumbnailPlayer
          videoUrl={template.video_path}
          thumbnailUrl={
            convertR2UrlToCdn(template.thumbnail_path) ||
            template.thumbnail_path ||
            convertR2UrlToCdn(template.img) ||
            template.img ||
            undefined
          }
          title={template.name}
          className="w-full h-full"
        />
      );
    }

    return (
      <div className="relative w-full h-full">
        <img
          src={getThumbnail(template)}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      </div>
    );
  };

  return (
    <Link
      href={`/product/${template.slug}`}
      className="group flex flex-col bg-[#0F172A]/90 rounded-2xl overflow-hidden border border-slate-800/80 hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 text-white"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-900">{renderPreview()}</div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-white text-base leading-snug line-clamp-2 group-hover:text-sky-400 transition-colors flex-1">
            {template.name}
          </h3>
          {isMusicSfx && (
            <span className="shrink-0 p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Music2 className="w-3.5 h-3.5" />
            </span>
          )}
          {isStockPhoto && (
            <span className="shrink-0 p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ImageIcon className="w-3.5 h-3.5" />
            </span>
          )}
          {is3DModel && (
            <span className="shrink-0 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Box className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        {template.subtitle && <p className="text-xs text-slate-400 line-clamp-2 mb-3">{template.subtitle}</p>}
        <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
            <Download className="w-3 h-3 text-sky-400" />
            <span>{downloadCount} Downloads</span>
          </span>
          <span className="text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
            View Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CreatorShopClient({
  shop,
  groupedSections,
  initialFollowers,
  totalProducts,
}: CreatorShopClientProps) {
  const { user } = useAppContext();
  const [currentShop, setCurrentShop] = useState<ShopData>(shop);
  const [activeTab, setActiveTab] = useState<"store" | "about">("store");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  // Check if current user is owner of this shop
  const isOwner = !!(user && (user as any).id === currentShop.user_id);

  // Sync shop props if changed
  useEffect(() => {
    setCurrentShop(shop);
  }, [shop]);

  // Extract all categories present in shop
  const availableCategories = useMemo(() => {
    const cats: { id: string; name: string }[] = [];
    groupedSections.forEach((sec) => {
      if (sec.category) {
        cats.push({ id: sec.category.id, name: sec.category.name });
      }
    });
    return cats;
  }, [groupedSections]);

  // Filter templates based on category and search query
  const filteredSections = useMemo(() => {
    return groupedSections
      .map((group) => {
        if (selectedCategory !== "all" && group.category?.id !== selectedCategory) {
          return null;
        }
        const filteredItems = group.items.filter((item) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q))
          );
        });

        if (filteredItems.length === 0) return null;
        return {
          ...group,
          items: filteredItems,
        };
      })
      .filter(Boolean) as GroupedSection[];
  }, [groupedSections, selectedCategory, searchQuery]);

  const totalFilteredCount = useMemo(() => {
    return filteredSections.reduce((acc, sec) => acc + sec.items.length, 0);
  }, [filteredSections]);

  const bannerImg = currentShop.banner_url || DEFAULT_BANNER;
  const logoImg = currentShop.logo_url;

  return (
    <main className="bg-[#0B0F17] text-white min-h-screen pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto space-y-8 sm:space-y-12">
        {/* ==================================================================== */}
        {/* CINEMATIC CREATOR STUDIO HEADER CARD */}
        {/* ==================================================================== */}
        <section className="bg-[#090D16] rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden relative group">
          {/* Banner Container */}
          <div className="relative h-48 sm:h-72 lg:h-80 w-full overflow-hidden bg-slate-900">
            <img
              src={bannerImg}
              alt={`${currentShop.name} Studio Banner`}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/50 to-transparent" />
            <div className="absolute inset-0 bg-black/20" />

            {/* Quick Action Pills on top-right of banner */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2.5 z-20">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xl active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Share Store</span>
              </button>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsCustomizeModalOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xl shadow-sky-500/20 active:scale-95"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Customize Studio</span>
                </button>
              )}
            </div>
          </div>

          {/* Studio Profile Meta Info */}
          <div className="relative px-6 sm:px-10 lg:px-12 pb-8 pt-0 -mt-16 sm:-mt-20 z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              {/* Logo + Title Stack */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                {/* Studio Logo / Avatar */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-[#090D16] border-4 border-[#090D16] shadow-2xl overflow-hidden shrink-0 group/logo">
                  {logoImg ? (
                    <img src={logoImg} alt={currentShop.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sky-500 via-blue-600 to-purple-600 flex items-center justify-center text-3xl sm:text-4xl font-black text-white">
                      {currentShop.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 ring-1 ring-white/20 rounded-3xl pointer-events-none" />
                </div>

                {/* Name, Tagline & Verified Badge */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                      {currentShop.name}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>Verified Creator Studio</span>
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-sky-300">
                    {currentShop.tagline || "Digital Asset & VFX Creator"}
                  </p>

                  {/* Location & Join Metadata */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-1 flex-wrap">
                    {currentShop.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        <span>{currentShop.location}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{totalProducts} Published Assets</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Follow Button Action */}
              <div className="shrink-0 pt-2 sm:pt-0">
                <CreatorFollowButton
                  shopId={currentShop.id}
                  shopOwnerId={currentShop.user_id}
                  initialFollowers={initialFollowers}
                />
              </div>
            </div>

            {/* Description / Bio */}
            {currentShop.description && (
              <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed font-normal pt-2 border-t border-slate-800/60">
                {currentShop.description}
              </p>
            )}

            {/* Social Handles Bar */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800/60 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                {currentShop.website_url && (
                  <a
                    href={currentShop.website_url.startsWith("http") ? currentShop.website_url : `https://${currentShop.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                  >
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span>Website</span>
                  </a>
                )}

                {currentShop.instagram_url && (
                  <a
                    href={
                      currentShop.instagram_url.startsWith("http")
                        ? currentShop.instagram_url
                        : `https://instagram.com/${currentShop.instagram_url.replace("@", "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span>Instagram</span>
                  </a>
                )}

                {currentShop.youtube_url && (
                  <a
                    href={currentShop.youtube_url.startsWith("http") ? currentShop.youtube_url : `https://${currentShop.youtube_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                    <span>YouTube</span>
                  </a>
                )}

                {currentShop.twitter_url && (
                  <a
                    href={
                      currentShop.twitter_url.startsWith("http")
                        ? currentShop.twitter_url
                        : `https://x.com/${currentShop.twitter_url.replace("@", "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                  >
                    <Twitter className="w-3.5 h-3.5 text-sky-400" />
                    <span>X (Twitter)</span>
                  </a>
                )}
              </div>

              {/* Creator Lifetime Purchase Guarantee */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1-Click Razorpay Checkout &bull; Instant Source Email Delivery</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* STORE TABS & SEARCH BAR */}
        {/* ==================================================================== */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          {/* Navigation View Tabs */}
          <div className="flex items-center gap-2 p-1 bg-[#090D16] rounded-2xl border border-slate-800/80 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("store")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "store"
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Storefront Products ({totalProducts})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("about")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "about"
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Studio Info &amp; Services</span>
            </button>
          </div>

          {/* Search Box inside Shop */}
          {activeTab === "store" && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${currentShop.name}'s assets...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#090D16] border border-slate-800/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: STOREFRONT ASSETS VIEW */}
        {/* ==================================================================== */}
        {activeTab === "store" && (
          <div className="space-y-8">
            {/* Category Filter Pills */}
            {availableCategories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                    selectedCategory === "all"
                      ? "bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-sm"
                      : "bg-[#090D16] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                  }`}
                >
                  All Categories ({totalProducts})
                </button>
                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                      selectedCategory === cat.id
                        ? "bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-sm"
                        : "bg-[#090D16] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Render Filtered Sections */}
            {filteredSections.length === 0 ? (
              <section className="bg-[#090D16] rounded-3xl border border-slate-800 shadow-sm p-12 text-center text-white space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No Matching Assets Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? `No templates matched "${searchQuery}". Try clearing search keywords.`
                    : "This creator hasn't published assets under this category yet."}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold transition-colors"
                  >
                    Reset Search
                  </button>
                )}
              </section>
            ) : (
              filteredSections.map((group, idx) => (
                <div key={group.category?.id || `uncat-${idx}`} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-10 bg-gradient-to-r from-sky-500 to-purple-500 rounded-full" />
                    <h2 className="text-2xl font-black text-white">
                      {group.category ? group.category.name : "Other Templates"}
                    </h2>
                    <span className="text-xs font-bold text-slate-400 bg-slate-800/80 border border-slate-700/80 px-3 py-1 rounded-full">
                      {group.items.length} {group.items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {group.items.map((t) => (
                      <TemplateCard key={t.slug} template={t} category={group.category} downloadCount={t.downloadCount || 0} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: STUDIO INFO & GEAR STACK VIEW */}
        {/* ==================================================================== */}
        {activeTab === "about" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bio & Philosophy Card */}
            <div className="lg:col-span-2 space-y-6 bg-[#090D16] border border-slate-800/80 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">About {currentShop.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">Independent Creator Profile &amp; Quality Standard</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-normal">
                <p>
                  {currentShop.description ||
                    `${currentShop.name} is a verified digital content creator on Celite Market, specializing in high-resolution video templates, 3D assets, motion graphics, and audio engineering presets for creators worldwide.`}
                </p>

                <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Software &amp; Creative Tools Stack
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-slate-300">
                    <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700">Adobe After Effects</span>
                    <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700">Premiere Pro</span>
                    <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700">Blender 3D</span>
                    <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700">Cinema 4D</span>
                    <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700">DaVinci Resolve</span>
                    <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700">Unreal Engine 5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Inquiry Box */}
            <div className="space-y-6 bg-[#090D16] border border-slate-800/80 rounded-3xl p-8 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Custom Project &amp; Licensing</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Need custom video editing, motion design, 3D rendering, or exclusive asset licensing for your brand?
                </p>
              </div>

              <div className="pt-6 border-t border-slate-800/80 space-y-3">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Studio Link with Clients</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Store Modal */}
      <ShareStoreModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shopName={currentShop.name}
        shopSlug={currentShop.slug}
        shopTagline={currentShop.tagline}
      />

      {/* Customize Store Modal (Shop Owner View) */}
      {isOwner && (
        <CustomizeStoreModal
          isOpen={isCustomizeModalOpen}
          onClose={() => setIsCustomizeModalOpen(false)}
          shop={currentShop}
          onUpdated={(updated) => {
            setCurrentShop(updated);
          }}
        />
      )}
    </main>
  );
}
