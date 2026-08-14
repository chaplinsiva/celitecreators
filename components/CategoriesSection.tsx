// agent-notes: { ctx: "Deep black CategoriesSection with smooth blue-rose AI gradient accents and hover glows", deps: ["lucide-react", "next/link"], state: active, last: "sato@2026-08-14" }
"use client";

import Link from "next/link";
import { Video, Globe, Music, Volume2, Box, Image as ImageIcon, Layers, ArrowRight, Sparkles } from "lucide-react";

const categories = [
  {
    name: "Video Templates",
    href: "/video-templates",
    icon: Video,
    count: "4,500+ Assets",
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    name: "Web Templates",
    href: "/web-templates",
    icon: Globe,
    count: "1,200+ Assets",
    imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    name: "Stock Music",
    href: "/stock-musics",
    icon: Music,
    count: "2,800+ Tracks",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    name: "Sound Effects",
    href: "/sound-effects",
    icon: Volume2,
    count: "5,100+ SFX",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80",
    gradient: "from-purple-500 to-rose-500",
  },
  {
    name: "3D Models",
    href: "/3d-models",
    icon: Box,
    count: "850+ Models",
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    name: "Graphics & LUTs",
    href: "/graphics",
    icon: ImageIcon,
    count: "3,200+ Packs",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
    gradient: "from-sky-500 via-purple-500 to-rose-500",
  },
];

export default function CategoriesSection() {
  return (
    <section className="py-8 sm:py-10 bg-black border-y border-zinc-900 text-white relative overflow-hidden">
      {/* Subtle Ethereal Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-32 bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-rose-500/10 blur-[90px] pointer-events-none rounded-full" />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 space-y-5">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-black border border-zinc-800 text-sky-400">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-rose-300">
              Explore Asset Categories
            </h2>
          </div>

          <Link
            href="/video-templates"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-rose-300 transition-colors group"
          >
            <span>View All Assets</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
                className="group relative flex flex-col justify-end h-28 sm:h-32 p-3.5 rounded-2xl bg-[#04060A] border border-zinc-850 overflow-hidden hover:border-transparent hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Glowing Gradient Border Aura on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 p-[1px] rounded-2xl" />

                {/* Background Image with Dark Shading */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/30" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 space-y-1.5">
                  <div className="p-1.5 rounded-xl bg-black/90 border border-zinc-800 w-fit text-sky-400 group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:via-purple-500 group-hover:to-rose-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-md">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-medium truncate">
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
