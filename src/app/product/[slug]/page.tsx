/* agent-notes: { ctx: "Redesigned studio-grade Product Detail Page in crisp white light theme with interactive media tabs, specs grid, and 1-click Razorpay buy card", deps: [src/lib/r2.ts, src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState, use } from 'react';
import {
  Star,
  ShieldCheck,
  Download,
  Zap,
  Play,
  Volume2,
  FileText,
  CheckCircle2,
  Sparkles,
  Lock,
  Layers,
  ArrowLeft,
  Clock,
  Eye,
  IndianRupee,
  Share2,
  Heart,
} from 'lucide-react';
import Link from 'next/link';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState<'video' | 'screenshots' | 'files'>('video');
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  const product = {
    name: resolvedParams.slug.replace(/-/g, ' ').toUpperCase(),
    slug: resolvedParams.slug,
    subtitle: 'High-impact 4K video opener featuring modular cybernetic HUD elements, custom sound design, and 60 FPS motion graphics.',
    price: 399,
    originalPrice: 999,
    discountPercentage: 60,
    creatorName: 'Apex Motion Studio',
    creatorSlug: 'apex-motion-studio',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    ratingAvg: 4.9,
    salesCount: 320,
    thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    ],
    software: ['After Effects CC 2024', 'Premiere Pro MOGRT', 'Cinema 4D Lite'],
    plugins: ['No Third-Party Plugins Required (100% Native AE)'],
    resolution: '4K Ultra HD (3840x2160) @ 60 FPS',
    fileSize: '1.2 GB (.zip source package)',
    license: 'Commercial License (Unlimited client & commercial video projects)',
    filesIncluded: [
      'Cyberpunk_HUD_Opener_4K.aep (After Effects Project)',
      'Modular_HUD_Elements.mogrt (Premiere Pro Motion Graphic)',
      'Cinematic_SciFi_Audio_Track.wav (24-bit 48kHz Audio)',
      'PDF_Documentation_Guide.pdf (User Manual)',
    ],
  };

  const handleBuyNow = async () => {
    setPurchasing(true);
    // Simulate Razorpay Order creation & HMAC verification
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPurchasing(false);
    setPurchased(true);
    setDownloadUrl('https://r2.celitecreators.in/mock-presigned-source-download.zip?token=mock_15min_ttl');
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              liked ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-600' : ''}`} /> {liked ? 'Saved' : 'Save Asset'}
          </button>
          <button className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Product Title Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-sky-50 text-sky-600 border border-sky-200">
            Video Template
          </span>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {product.discountPercentage}% OFF Launch Special
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {product.ratingAvg} rating ({product.salesCount} purchases)
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">{product.name}</h1>
        <p className="text-slate-600 text-base max-w-4xl leading-relaxed">{product.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Media Showcase, Tabs, Specs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Media Showcase Box */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm space-y-4">
            {/* View Tabs */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'video' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" /> 4K Video Preview
              </button>
              <button
                onClick={() => setActiveTab('screenshots')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'screenshots' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Render Screenshots
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'files' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Package Files ({product.filesIncluded.length})
              </button>
            </div>

            {/* Tab Content Display */}
            <div className="p-4 sm:p-6">
              {activeTab === 'video' && (
                <div className="relative rounded-2xl overflow-hidden group bg-slate-900">
                  <img src={product.thumbnailUrl} alt={product.name} className="w-full h-[400px] object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center opacity-90 group-hover:opacity-100 transition">
                    <button className="w-20 h-20 bg-sky-600 hover:bg-sky-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-sky-600/40 transition transform group-hover:scale-110">
                      <Play className="w-10 h-10 ml-1 fill-white" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-white">
                    <span className="flex items-center gap-2 font-bold text-sky-400">
                      <Volume2 className="w-4 h-4" /> Sound Effects Track Included
                    </span>
                    <span className="font-semibold text-slate-300">4K UHD • 60 FPS • 0:30</span>
                  </div>
                </div>
              )}

              {activeTab === 'screenshots' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {product.screenshots.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Screenshot ${i + 1}`}
                      className="w-full h-48 object-cover rounded-xl border border-slate-200 hover:opacity-90 transition cursor-pointer"
                    />
                  ))}
                </div>
              )}

              {activeTab === 'files' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source Package Contents</h4>
                  <div className="space-y-2">
                    {product.filesIncluded.map((file, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                        {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white space-y-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-600" /> Asset Specifications & Compatibility
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500 block">Compatible Software</span>
                <span className="text-slate-900 font-bold block">{product.software.join(', ')}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500 block">Plugins Required</span>
                <span className="text-slate-900 font-bold block">{product.plugins.join(', ')}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500 block">Resolution & Frame Rate</span>
                <span className="text-slate-900 font-bold block">{product.resolution}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500 block">Source Package Size</span>
                <span className="text-slate-900 font-bold block">{product.fileSize}</span>
              </div>

              <div className="sm:col-span-2 p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-1">
                <span className="text-xs font-bold uppercase text-sky-700 block">Commercial Usage Rights</span>
                <span className="text-slate-900 font-bold block">{product.license}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky 1-Click Buy Action Card */}
        <div className="lg:col-span-1">
          <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-sky-500/40 bg-white sticky top-24 space-y-6 shadow-xl">
            {/* Price Header */}
            <div className="border-b border-slate-200 pb-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Pay Per Product</span>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded bg-emerald-100 text-emerald-800">
                  SAVE ₹{product.originalPrice - product.price}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-slate-900">₹{product.price}</span>
                <span className="text-base text-slate-400 line-through font-semibold">₹{product.originalPrice}</span>
                <span className="text-xs font-bold text-slate-500">INR</span>
              </div>
            </div>

            {/* Creator Profile Snippet */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={product.creatorAvatar}
                alt={product.creatorName}
                className="w-11 h-11 rounded-xl object-cover border border-sky-400"
              />
              <div className="flex-1">
                <a
                  href={`/creator/${product.creatorSlug}`}
                  className="text-sm font-bold text-slate-900 hover:text-sky-600 transition flex items-center gap-1"
                >
                  {product.creatorName} <ShieldCheck className="w-4 h-4 text-sky-600" />
                </a>
                <span className="text-xs text-slate-500 font-semibold block">Verified Marketplace Shop</span>
              </div>
            </div>

            {/* Buy Action Button */}
            {purchased ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-900">Payment Confirmed!</p>
                  <p className="text-xs text-slate-600 mt-1">Presigned R2 download link generated (15-min TTL).</p>
                </div>
                <a
                  href={downloadUrl || '#'}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-base"
                >
                  <Download className="w-5 h-5" /> Download Source (.zip)
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  disabled={purchasing}
                  className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-sky-600/25 transition flex items-center justify-center gap-2 text-base"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  {purchasing ? 'Opening Razorpay...' : `Buy Now for ₹${product.price} INR`}
                </button>
                <Link
                  href="/checkout"
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition text-center text-xs block border border-slate-200"
                >
                  Go to Checkout Page
                </Link>
              </div>
            )}

            {/* Security Guarantee Seals */}
            <div className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-600 shrink-0" />
                <span>100% Secured Razorpay Payment (GPay, UPI, Cards)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>15-Minute Presigned Cloudflare R2 Direct Download</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>No Monthly Subscriptions • Commercial License Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
