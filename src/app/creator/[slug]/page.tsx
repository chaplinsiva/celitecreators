/* agent-notes: { ctx: "Public Creator Shop Profile page with banner, shop stats, follower action, and asset catalog grid", deps: [src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState } from 'react';
import { UserCheck, UserPlus, Star, ShoppingBag, Eye, ShieldCheck, Sparkles } from 'lucide-react';

interface CreatorShopPageProps {
  params: {
    slug: string;
  };
}

export default function CreatorShopProfilePage({ params }: CreatorShopPageProps) {
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(342);

  // Mock creator shop data
  const shop = {
    name: params.slug.replace(/-/g, ' ').toUpperCase(),
    slug: params.slug,
    description: 'Specializing in cinematic After Effects openers, 4K motion graphics, and modular 3D Blender assets.',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bannerImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    followersCount: followerCount,
    salesCount: 1420,
    ratingAvg: 4.9,
  };

  const handleFollowToggle = () => {
    if (following) {
      setFollowing(false);
      setFollowerCount((prev) => prev - 1);
    } else {
      setFollowing(true);
      setFollowerCount((prev) => prev + 1);
    }
  };

  const sampleProducts = [
    {
      id: '1',
      name: 'Cyberpunk HUD Video Opener 4K',
      slug: 'cyberpunk-hud-opener-4k',
      price: 399,
      category: 'After Effects',
      rating: 4.9,
      sales: 320,
      thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '2',
      name: 'Futuristic 3D Sci-Fi Helmet Asset Pack',
      slug: '3d-sci-fi-helmet-pack',
      price: 699,
      category: 'Blender 3D',
      rating: 5.0,
      sales: 180,
      thumbnail: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '3',
      name: 'Cinematic Trailer SFX & Riser Pack',
      slug: 'cinematic-trailer-sfx-pack',
      price: 249,
      category: 'Audio & SFX',
      rating: 4.8,
      sales: 450,
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="min-h-screen pb-16">
      {/* Banner Header */}
      <div className="h-64 md:h-80 w-full relative bg-slate-900 overflow-hidden">
        <img
          src={shop.bannerImageUrl}
          alt={shop.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/40 to-transparent" />
      </div>

      {/* Creator Info Header Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6 border border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <img
              src={shop.profileImageUrl}
              alt={shop.name}
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-sky-500/40 shadow-xl shadow-sky-500/10"
            />
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">{shop.name}</h1>
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">{shop.description}</p>
              
              {/* Stats Pills */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-xs font-semibold text-slate-300">
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {shop.ratingAvg} Rating
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-sky-400" /> {shop.salesCount} Sales
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  {followerCount} Followers
                </span>
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <button
            onClick={handleFollowToggle}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 shrink-0 ${
              following
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25'
            }`}
          >
            {following ? (
              <>
                <UserCheck className="w-4 h-4" /> Following
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Follow Shop
              </>
            )}
          </button>
        </div>

        {/* Creator Catalog Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" /> Shop Catalog ({sampleProducts.length} Assets)
            </h2>
          </div>

          {/* Asset Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {sampleProducts.map((product) => (
              <div
                key={product.id}
                className="glass-panel rounded-2xl overflow-hidden group hover:border-sky-500/40 transition duration-300 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-400 border border-slate-800">
                    {product.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-extrabold text-white border border-sky-500/30">
                    ₹{product.price}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white group-hover:text-sky-400 transition text-base">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <span className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" /> {product.rating}
                      </span>
                      <span>•</span>
                      <span>{product.sales} buyers</span>
                    </div>
                  </div>

                  <a
                    href={`/product/${product.slug}`}
                    className="mt-5 w-full py-2.5 bg-slate-800/80 hover:bg-sky-600 text-slate-200 hover:text-white font-semibold rounded-xl transition text-center text-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> View Asset Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
