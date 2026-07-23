/* agent-notes: { ctx: "Product Detail Page with preview player, specs table, and 1-click Razorpay purchase trigger", deps: [src/lib/r2.ts, src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState } from 'react';
import { Star, ShieldCheck, Download, Zap, Play, Volume2, FileText, CheckCircle2 } from 'lucide-react';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const product = {
    name: params.slug.replace(/-/g, ' ').toUpperCase(),
    slug: params.slug,
    subtitle: 'High-impact 4K video opener with modular HUD elements and custom sound effects.',
    price: 399,
    creatorName: 'Apex Motion Studio',
    creatorSlug: 'apex-motion-studio',
    ratingAvg: 4.9,
    salesCount: 320,
    thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80',
    software: ['After Effects CC 2024', 'Premiere Pro MOGRT'],
    plugins: ['No Plugins Required'],
    resolution: '4K Ultra HD (3840x2160)',
    fileSize: '1.2 GB (.zip source package)',
    license: 'Commercial License (Use in unlimited client projects)',
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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Top Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Video Template
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {product.ratingAvg} ({product.salesCount} purchases)
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{product.name}</h1>
        <p className="text-slate-400 text-base max-w-3xl">{product.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Interactive Media Player & Specs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Interactive Preview Canvas */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 relative group">
            <img
              src={product.thumbnailUrl}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center opacity-90 group-hover:opacity-100 transition">
              <button className="w-16 h-16 bg-sky-600 hover:bg-sky-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-sky-600/40 transition transform group-hover:scale-110">
                <Play className="w-8 h-8 ml-1 fill-white" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-2 font-semibold">
                <Volume2 className="w-4 h-4 text-sky-400" /> Preview Audio Track Included
              </span>
              <span className="text-slate-500">Duration: 0:30</span>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" /> Asset Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 block">Compatible Software</span>
                <span className="text-slate-200 font-medium mt-1 block">{product.software.join(', ')}</span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 block">Plugins Required</span>
                <span className="text-slate-200 font-medium mt-1 block">{product.plugins.join(', ')}</span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 block">Resolution</span>
                <span className="text-slate-200 font-medium mt-1 block">{product.resolution}</span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 block">Source Package Size</span>
                <span className="text-slate-200 font-medium mt-1 block">{product.fileSize}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold uppercase text-slate-500 block">Commercial Usage License</span>
                <span className="text-slate-200 font-medium mt-1 block">{product.license}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 1-Click Buy Action Card */}
        <div className="lg:col-span-1">
          <div className="glass-panel-glow p-6 sm:p-8 rounded-2xl border border-sky-500/30 sticky top-10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Pay Per Product</span>
                <span className="text-3xl font-black text-white">₹{product.price}</span>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                Single Purchase
              </span>
            </div>

            {/* Creator Profile Snippet */}
            <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-sky-600/30 border border-sky-500/30 flex items-center justify-center font-extrabold text-sky-400">
                A
              </div>
              <div>
                <a
                  href={`/creator/${product.creatorSlug}`}
                  className="text-sm font-bold text-white hover:text-sky-400 transition flex items-center gap-1"
                >
                  {product.creatorName} <ShieldCheck className="w-4 h-4 text-sky-400" />
                </a>
                <span className="text-xs text-slate-400">Verified Marketplace Shop</span>
              </div>
            </div>

            {/* Buy Action Button */}
            {purchased ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">Payment Confirmed!</p>
                  <p className="text-xs text-slate-300 mt-1">Presigned R2 download link generated (15-min TTL).</p>
                </div>
                <a
                  href={downloadUrl || '#'}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 text-base"
                >
                  <Download className="w-5 h-5" /> Download Source Package (.zip)
                </a>
              </div>
            ) : (
              <button
                onClick={handleBuyNow}
                disabled={purchasing}
                className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 text-base"
              >
                <Zap className="w-5 h-5 fill-white" />
                {purchasing ? 'Launching Razorpay...' : 'Buy Now with Razorpay'}
              </button>
            )}

            <div className="text-center text-xs text-slate-500 leading-relaxed">
              🔒 100% Secure Razorpay Payment in INR. Presigned R2 direct download link delivered instantly after purchase.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
