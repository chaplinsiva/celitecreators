/* agent-notes: { ctx: "Redesigned studio-grade Home Page & Hero section in crisp white light theme with category grid, trending 4K assets, and comparison ribbon", deps: [src/app/components/BuyDrawer.tsx, src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState } from 'react';
import {
  Search,
  Zap,
  Sparkles,
  ShieldCheck,
  Star,
  Play,
  ArrowRight,
  CheckCircle2,
  Video,
  Box,
  Music,
  Layout,
  IndianRupee,
  Lock,
  Layers,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import BuyDrawer from './components/BuyDrawer';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForDrawer, setSelectedProductForDrawer] = useState<any | null>(null);

  const categories = [
    {
      id: 'video-templates',
      title: 'Video Templates',
      description: 'After Effects openers, Premiere Pro MOGRTs & 4K transitions',
      count: '340+ Assets',
      icon: Video,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
    },
    {
      id: '3d-models',
      title: '3D Models & Assets',
      description: 'Blender 3D objects, Cinema 4D models & high-poly textures',
      count: '210+ Assets',
      icon: Box,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'audio-sfx',
      title: 'Audio & Cinematic SFX',
      description: '24-bit royalty-free sound effects, trailer risers & Foley packs',
      count: '520+ Tracks',
      icon: Music,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      id: 'graphics-ui',
      title: 'Graphics & Figma Kits',
      description: 'Figma mobile app design systems, icon sets & social templates',
      count: '180+ Kits',
      icon: Layout,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  const trendingAssets = [
    {
      id: '1',
      name: 'Cyberpunk HUD Video Opener 4K',
      slug: 'cyberpunk-hud-opener-4k',
      price: 399,
      originalPrice: 999,
      category: 'After Effects',
      creatorName: 'Apex Motion Studio',
      rating: 4.9,
      salesCount: 320,
      thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '2',
      name: 'Futuristic 3D Sci-Fi Helmet Asset Pack',
      slug: '3d-sci-fi-helmet-pack',
      price: 699,
      originalPrice: 1499,
      category: 'Blender 3D',
      creatorName: 'RenderForge 3D',
      rating: 5.0,
      salesCount: 180,
      thumbnail: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '3',
      name: 'Cinematic Trailer SFX & Riser Pack',
      slug: 'cinematic-trailer-sfx-pack',
      price: 249,
      originalPrice: 599,
      category: 'Audio SFX',
      creatorName: 'SonicVibe Labs',
      rating: 4.8,
      salesCount: 450,
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="min-h-screen space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Launch Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-extrabold shadow-sm">
            <Zap className="w-4 h-4 fill-sky-600 text-sky-600" />
            <span>Single-Product Purchases • No Subscriptions Trap</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Pay-Per-Product Digital Assets for India's Next-Gen Creators
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Buy premium After Effects templates, Blender 3D models, cinematic audio SFX, and Figma UI kits in INR (₹) with instant 15-minute presigned R2 direct download links.
          </p>

          {/* Search Bar Container */}
          <div className="max-w-2xl mx-auto glass-panel p-3 rounded-2xl border border-slate-200 bg-white shadow-lg space-y-3">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 4K openers, 3D models, cinematic SFX..."
                className="w-full pl-12 pr-28 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white transition"
              />
              <Link
                href={`/browse?q=${encodeURIComponent(searchQuery)}`}
                className="absolute right-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition shadow-sm"
              >
                Search
              </Link>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-semibold">Popular:</span>
              <Link href="/browse?cat=video-templates" className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition font-medium">
                After Effects CC
              </Link>
              <Link href="/browse?cat=3d-models" className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition font-medium">
                Blender 3D
              </Link>
              <Link href="/browse?cat=audio-sfx" className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition font-medium">
                Cinematic SFX
              </Link>
              <Link href="/browse?cat=graphics-ui" className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition font-medium">
                Figma UI Kits
              </Link>
            </div>
          </div>

          {/* Trust Stats Ribbon */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-slate-200 text-center">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block">500+</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verified Indian Creators</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-sky-600 block">₹1.8L+</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Paid to Creators</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block">15-Min TTL</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Presigned R2 Storage</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">4.9★</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Buyer Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Curated Library</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Explore Asset Categories</h2>
          </div>
          <Link href="/browse" className="text-xs font-bold text-sky-600 hover:text-sky-700 transition flex items-center gap-1">
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/browse?cat=${cat.id}`}
                className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white hover:border-sky-500/40 hover:shadow-md transition duration-300 space-y-4 block group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${cat.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-sky-600 transition">
                    {cat.count}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Top Sellers</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Trending 4K Assets & Templates</h2>
          </div>
          <Link href="/browse" className="text-xs font-bold text-sky-600 hover:text-sky-700 transition flex items-center gap-1">
            Browse Full Market <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trendingAssets.map((asset) => (
            <div
              key={asset.id}
              className="glass-panel rounded-3xl overflow-hidden group hover:border-sky-500/40 transition duration-300 flex flex-col bg-white border border-slate-200 shadow-sm"
            >
              {/* Thumbnail */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                <img
                  src={asset.thumbnail}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition transform scale-90 group-hover:scale-100 shadow-lg">
                    <Play className="w-5 h-5 ml-0.5 fill-slate-900" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-extrabold text-sky-600 border border-slate-200">
                  {asset.category}
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-black text-white flex items-center gap-1">
                  ₹{asset.price} <span className="text-xs text-slate-400 line-through font-normal">₹{asset.originalPrice}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-sky-600 transition text-lg leading-snug">
                    {asset.name}
                  </h3>
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400" /> {asset.rating} ({asset.salesCount} buyers)
                    </span>
                    <span className="text-slate-600 font-bold">By {asset.creatorName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Link
                    href={`/product/${asset.slug}`}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition text-center text-xs"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => setSelectedProductForDrawer(asset)}
                    className="px-5 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition text-xs shadow-sm flex items-center gap-1"
                  >
                    <Zap className="w-4 h-4 fill-white" /> Quick Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pay-Per-Product vs Subscription Comparison Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200 bg-white space-y-8 shadow-sm">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">The CeliteCreators Advantage</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Why Pay Per Product Instead of Subscriptions?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CeliteCreators Pay-Per-Product Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-4">
              <div className="flex items-center gap-2 text-sky-700 font-bold text-lg">
                <CheckCircle2 className="w-6 h-6 text-sky-600" /> CeliteCreators Pay-Per-Product
              </div>
              <ul className="space-y-3 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">✓ Pay once in INR (₹) via Razorpay, GPay, PhonePe, or UPI.</li>
                <li className="flex items-center gap-2">✓ Own the source file license forever for unlimited client projects.</li>
                <li className="flex items-center gap-2">✓ Instant 15-minute presigned R2 direct download link.</li>
                <li className="flex items-center gap-2">✓ Indian creators keep 80% net revenue split on every purchase.</li>
              </ul>
            </div>

            {/* Subscriptions Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 opacity-80">
              <div className="flex items-center gap-2 text-slate-600 font-bold text-lg">
                ✕ Expensive Overseas Subscriptions
              </div>
              <ul className="space-y-3 text-xs text-slate-500 font-medium">
                <li className="flex items-center gap-2">✕ Forced $33+/mo recurring credit card charges ($400+ per year).</li>
                <li className="flex items-center gap-2">✕ License expires if you cancel your monthly subscription plan.</li>
                <li className="flex items-center gap-2">✕ Low creator payouts with complex international tax withholding.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Buy Drawer Modal */}
      {selectedProductForDrawer && (
        <BuyDrawer
          isOpen={!!selectedProductForDrawer}
          onClose={() => setSelectedProductForDrawer(null)}
          product={selectedProductForDrawer}
        />
      )}
    </div>
  );
}
