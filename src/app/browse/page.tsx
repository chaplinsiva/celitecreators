/* agent-notes: { ctx: "Marketplace Search & Filter Catalog page with software compatibility filters", deps: [src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState } from 'react';
import { Search, Filter, Star, Eye, Sparkles, Check } from 'lucide-react';

export default function BrowseCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState(1000);

  const softwareOptions = ['After Effects CC', 'Premiere Pro', 'Blender 3D', 'Figma', 'DaVinci Resolve'];

  const sampleProducts = [
    {
      id: '1',
      name: 'Cyberpunk HUD Video Opener 4K',
      slug: 'cyberpunk-hud-opener-4k',
      price: 399,
      category: 'video-templates',
      software: 'After Effects CC',
      rating: 4.9,
      sales: 320,
      thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '2',
      name: 'Futuristic 3D Sci-Fi Helmet Asset Pack',
      slug: '3d-sci-fi-helmet-pack',
      price: 699,
      category: '3d-models',
      software: 'Blender 3D',
      rating: 5.0,
      sales: 180,
      thumbnail: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '3',
      name: 'Cinematic Trailer SFX & Riser Pack',
      slug: 'cinematic-trailer-sfx-pack',
      price: 249,
      category: 'audio-sfx',
      software: 'Premiere Pro',
      rating: 4.8,
      sales: 450,
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '4',
      name: 'Neomorphic Mobile App Figma UI Kit',
      slug: 'neomorphic-mobile-app-ui-kit',
      price: 499,
      category: 'graphics-ui',
      software: 'Figma',
      rating: 4.9,
      sales: 290,
      thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const toggleSoftware = (sw: string) => {
    if (selectedSoftware.includes(sw)) {
      setSelectedSoftware(selectedSoftware.filter((item) => item !== sw));
    } else {
      setSelectedSoftware([...selectedSoftware, sw]);
    }
  };

  const filteredProducts = sampleProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSoftware = selectedSoftware.length === 0 || selectedSoftware.includes(product.software);
    const matchesPrice = product.price <= priceMax;
    return matchesSearch && matchesCat && matchesSoftware && matchesPrice;
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Standalone Digital Assets
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-4">
          Browse Creator Market Catalog
        </h1>
        <p className="text-slate-400 text-base mt-2">
          Filter by software compatibility, resolution, and price in INR (₹).
        </p>

        {/* Search Input */}
        <div className="mt-6 relative max-w-xl mx-auto">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search After Effects templates, Blender assets, SFX..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition shadow-xl"
          />
        </div>
      </div>

      {/* Main Grid with Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-800 h-fit space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Filter className="w-4 h-4 text-sky-400" /> Catalog Filters
          </h2>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Asset Category
            </label>
            <div className="space-y-2 text-sm text-slate-300">
              {[
                { label: 'All Categories', value: 'all' },
                { label: 'Video Templates', value: 'video-templates' },
                { label: '3D Models & Assets', value: '3d-models' },
                { label: 'Audio & SFX Packs', value: 'audio-sfx' },
                { label: 'Graphics & UI Kits', value: 'graphics-ui' },
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition text-xs font-medium flex items-center justify-between ${
                    selectedCategory === cat.value
                      ? 'bg-sky-600 text-white font-bold'
                      : 'hover:bg-slate-800/80 text-slate-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Software Compatibility Checkboxes */}
          <div className="border-t border-slate-800 pt-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Software Compatibility
            </label>
            <div className="space-y-2">
              {softwareOptions.map((sw) => {
                const isSelected = selectedSoftware.includes(sw);
                return (
                  <button
                    key={sw}
                    onClick={() => toggleSoftware(sw)}
                    className="w-full text-left flex items-center gap-2.5 text-xs text-slate-300 py-1.5 hover:text-white"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                        isSelected ? 'bg-sky-600 border-sky-500 text-white' : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <span>{sw}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="border-t border-slate-800 pt-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Max Price</span>
              <span className="text-sky-400 font-bold">₹{priceMax}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="glass-panel rounded-2xl overflow-hidden group hover:border-sky-500/40 transition duration-300 flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-400 border border-slate-800">
                    {product.software}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-extrabold text-white border border-sky-500/30">
                    ₹{product.price}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white group-hover:text-sky-400 transition text-base leading-snug">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <span className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" /> {product.rating}
                      </span>
                      <span>•</span>
                      <span>{product.sales} sales</span>
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
