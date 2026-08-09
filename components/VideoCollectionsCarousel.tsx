"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Film } from 'lucide-react';

const collections = [
  {
    name: "Cinema Templates",
    slug: "cinema-templates",
    imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80",
  },
  {
    name: "Logo Reveals",
    slug: "logo-reveals",
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80",
  },
  {
    name: "Social Media",
    slug: "social-media-templates",
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80",
  },
  {
    name: "Titles & Typography",
    slug: "titles-typography",
    imageUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&q=80",
  },
  {
    name: "Intros & Openers",
    slug: "intros-openers",
    imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80",
  },
  {
    name: "Product Promo",
    slug: "product-promo",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
  },
  {
    name: "Slideshows",
    slug: "slideshows",
    imageUrl: "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=600&q=80",
  },
  {
    name: "Infographics",
    slug: "infographics",
    imageUrl: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=600&q=80",
  },
  {
    name: "Transitions",
    slug: "transitions",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
  }
];

export default function VideoCollectionsCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-8 sm:py-10 bg-[#090D16] border-t border-slate-800/80 text-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-5">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-sky-400" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Video Collections
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-[#0F172A] border border-slate-800 hover:border-sky-500 text-slate-300 hover:text-white transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-[#0F172A] border border-slate-800 hover:border-sky-500 text-slate-300 hover:text-white transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Carousel Cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {collections.map((item, index) => (
            <Link
              key={index}
              href={`/video-templates?subcategory=${item.slug}`}
              className="group relative flex-shrink-0 w-[180px] sm:w-[220px] h-28 sm:h-32 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden snap-start hover:border-sky-500/50 transition-all duration-300 shadow-md"
            >
              {/* Cover Image */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-45 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/75 to-transparent" />
              </div>

              {/* Title Overlay */}
              <div className="relative z-10 flex flex-col justify-end h-full">
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
                  {item.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
