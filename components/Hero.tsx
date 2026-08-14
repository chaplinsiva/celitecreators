// agent-notes: { ctx: "Cinematic Dark Studio Hero with direct pay-per-product & sell your templates messaging", deps: ["framer-motion", "lib/supabaseClient.ts", "lib/utils.ts"], state: active, last: "sato@2026-08-14" }
"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import { convertR2UrlToCdn } from '@/lib/utils';
import { Zap, ShoppingBag, ShieldCheck, Sparkles, Download, ArrowRight, TrendingUp } from 'lucide-react';

type RealVideoTemplate = {
  slug: string;
  name: string;
  subtitle?: string | null;
  video_path: string | null;
  img?: string | null;
  thumbnail_path?: string | null;
};

// Real Marketplace templates fallback with real CDN MP4 previews
const REAL_MARKETPLACE_TEMPLATES: RealVideoTemplate[] = [
  {
    slug: 'bum-baa-diga-lyrical-after-effects-template',
    name: 'Bum Baa Diga Lyrical',
    subtitle: 'Lyrical Video Template',
    video_path: 'https://preview.celite.in/preview/video/video-templates/after-effects/movie-templates/bum-baa-diga-lyrical-after-effects-template/bum-baa-diga-lyrical-after-effects-template.mp4',
    thumbnail_path: 'https://preview.celite.in/preview/thumbnail/video-templates/after-effects/movie-templates/bum-baa-diga-lyrical-after-effects-template/bum-baa-diga-lyrical-after-effects-template.jpg'
  },
  {
    slug: 'classic-ivory-save-date-template',
    name: 'Classic Ivory Save Date',
    subtitle: 'Wedding Save Date',
    video_path: 'https://preview.celite.in/preview/video/video-templates/after-effects/save-date/classic-ivory-save-date-template/classic-ivory-save-date-template.mp4',
    thumbnail_path: 'https://preview.celite.in/preview/thumbnail/video-templates/after-effects/save-date/classic-ivory-save-date-template/classic-ivory-save-date-template.jpg'
  },
  {
    slug: '3d-parallax-intro',
    name: '3D Parallax Intro',
    subtitle: '3D Motion Graphics',
    video_path: 'https://preview.celite.in/preview/video/video-templates/after-effects/motion-graphics/3d-parallax-intro/3d-parallax-intro.mp4',
    thumbnail_path: 'https://preview.celite.in/preview/thumbnail/video-templates/after-effects/motion-graphics/3d-parallax-intro/3d-parallax-intro.jpg'
  }
];

function PreviewCard({ template }: { template: RealVideoTemplate }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  const rawVideo = template.video_path;
  const videoUrl = rawVideo ? convertR2UrlToCdn(rawVideo) : null;
  const rawThumb = template.thumbnail_path || template.img;
  const posterUrl = rawThumb ? (convertR2UrlToCdn(rawThumb) || undefined) : undefined;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && videoUrl) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl bg-[#04060A] border border-zinc-800/90 overflow-hidden shadow-2xl hover:border-sky-500/50 hover:shadow-sky-500/10 transition-all duration-300 flex flex-col justify-between"
    >
      <Link href={`/product/${template.slug}`} className="block relative aspect-video w-full overflow-hidden bg-black">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <img
            src={posterUrl || '/placeholder.png'}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Shading overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Live Hover Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all duration-200 shadow-md ${
            isHovered ? 'bg-sky-500 text-white' : 'bg-black/80 text-zinc-300 border border-zinc-800'
          }`}>
            {isHovered ? 'Previewing' : 'After Effects'}
          </span>
        </div>
      </Link>

      {/* Card Info Footer */}
      <div className="p-3.5 bg-[#04060A] border-t border-zinc-900 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/product/${template.slug}`} className="text-xs font-bold text-white hover:text-sky-400 transition-colors truncate block">
            {template.name}
          </Link>
          <p className="text-[10px] text-zinc-400 truncate">
            {template.subtitle || "Pay-Per-Product Asset"}
          </p>
        </div>
        <Link
          href={`/product/${template.slug}`}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-sky-500 text-zinc-400 hover:text-white transition-all shrink-0 border border-zinc-800 hover:border-transparent"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function Hero() {
  const [templates, setTemplates] = useState<RealVideoTemplate[]>(REAL_MARKETPLACE_TEMPLATES);

  useEffect(() => {
    const fetchThreeTemplates = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('templates')
          .select('slug, name, subtitle, video_path, img, thumbnail_path')
          .eq('status', 'APPROVED')
          .not('video_path', 'is', null)
          .order('created_at', { ascending: false })
          .limit(3);

        if (data && data.length > 0 && !error) {
          setTemplates(data as RealVideoTemplate[]);
        }
      } catch (err) {
        console.error('Error loading real 3 templates:', err);
      }
    };

    fetchThreeTemplates();
  }, []);

  return (
    <section className="relative w-full pt-6 pb-6 md:pt-8 md:pb-8 px-4 sm:px-6 bg-black text-white overflow-hidden">
      {/* Background Ambient Mesh Light FX (Blue, Indigo & Subtle Rose Glow) */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-sky-600/15 via-indigo-600/10 to-rose-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-l from-blue-600/15 via-purple-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column: Headline, Value Proposition & Actions */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            {/* Dual Badge: Marketplace + Sell Your Templates */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span>India's Pay-Per-Product Creative Marketplace</span>
              </div>
              <Link
                href="/start-selling"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm group"
              >
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Sell Templates &amp; Earn 80%</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight text-white leading-[1.05]">
                Elevate Your Edits With <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-rose-400">
                  CELITE MARKET
                </span>
              </h1>
            </motion.div>

            {/* Direct Message & Copy */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-4"
            >
              <p className="text-sm sm:text-base font-medium text-zinc-300 max-w-xl leading-relaxed">
                Buy &amp; sell individual After Effects templates, sound effects, stock music, 3D models, and web templates. Pay only for what you download — no forced monthly subscriptions.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-zinc-400 text-xs font-semibold">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                  <Zap className="w-3 h-3 text-sky-400 fill-sky-400" />
                  Pay-Per-Product
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Commercial License
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  Instant High-Res Download
                </span>
              </div>
            </motion.div>

            {/* High-Impact Dual Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <Link
                href="/video-templates"
                className="px-6 py-3 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-sky-500/25 text-xs sm:text-sm flex items-center gap-2 transition-all duration-300 active:scale-95 group"
              >
                <Zap className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                <span>Explore 10,000+ Assets</span>
              </Link>
              
              <Link
                href="/start-selling"
                className="px-5 py-3 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 hover:text-white font-bold rounded-xl border border-zinc-700/80 hover:border-emerald-500/50 text-xs sm:text-sm flex items-center gap-2 transition-all duration-300 shadow-md group"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Sell Your Templates Here &rarr;</span>
              </Link>
            </motion.div>

          </div>

          {/* Right Column: 3 Real Marketplace Video Previews */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="lg:col-span-6 relative"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.slice(0, 3).map((tpl, i) => (
                <PreviewCard key={tpl.slug || i} template={tpl} />
              ))}
            </div>
          </motion.div>

        </div>

        {/* Integrated Bottom Metric Strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-5 border-t border-zinc-900"
        >
          {[
            { metric: '50,000+', label: 'Verified Asset Downloads' },
            { metric: '80% Payout', label: 'Direct to Creator Bank / UPI' },
            { metric: '100%', label: 'Pay-Per-Product & Lifetime Access' },
            { metric: '< 1 Sec', label: 'Cloudflare Global Edge Speed' },
          ].map((stat, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-[#04060A] border border-zinc-850 text-center hover:border-zinc-700 transition-colors shadow-lg shadow-black/60">
              <p className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-sky-400">
                {stat.metric}
              </p>
              <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
