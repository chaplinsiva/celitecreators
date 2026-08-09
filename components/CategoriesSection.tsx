"use client";

import Link from "next/link";
import { Video, Globe, Music, Volume2, Box, Image as ImageIcon, Layers, ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Video Templates",
    href: "/video-templates",
    icon: Video,
    count: "4,500+ Assets",
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80",
    accentColor: "border-sky-500/40 text-sky-400",
  },
  {
    name: "Web Templates",
    href: "/web-templates",
    icon: Globe,
    count: "1,200+ Assets",
    imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80",
    accentColor: "border-indigo-500/40 text-indigo-400",
  },
  {
    name: "Stock Music",
    href: "/stock-musics",
    icon: Music,
    count: "2,800+ Tracks",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    accentColor: "border-purple-500/40 text-purple-400",
  },
  {
    name: "Sound Effects",
    href: "/sound-effects",
    icon: Volume2,
    count: "5,100+ SFX",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80",
    accentColor: "border-teal-500/40 text-teal-400",
  },
  {
    name: "3D Models",
    href: "/3d-models",
    icon: Box,
    count: "850+ Models",
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
    accentColor: "border-amber-500/40 text-amber-400",
  },
  {
    name: "Graphics & LUTs",
    href: "/graphics",
    icon: ImageIcon,
    count: "3,200+ Packs",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
    accentColor: "border-rose-500/40 text-rose-400",
  },
];

export default function CategoriesSection() {
  return (
    <section className="py-8 sm:py-10 bg-[#0B0F17] border-t border-slate-800/80 text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-5">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Explore Categories
            </h2>
          </div>

          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Compact Grid with Background Images */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                href={cat.href}
                className="group relative flex flex-col justify-end h-28 sm:h-32 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden hover:border-sky-500/50 transition-all duration-300 shadow-md"
              >
                {/* Background Image with Dark Shading */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/80 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 space-y-1">
                  <div className={`p-1.5 rounded-md bg-[#0F172A]/90 border border-slate-700/80 w-fit text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {cat.count}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
