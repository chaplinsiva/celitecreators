"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import { convertR2UrlToCdn } from '@/lib/utils';
import { Zap, ShoppingBag, ShieldCheck, Sparkles, Download, Play } from 'lucide-react';

type RealVideoTemplate = {
  slug: string;
  name: string;
  subtitle?: string | null;
  video_path: string | null;
  img?: string | null;
  thumbnail_path?: string | null;
};

// REAL CELITE MARKET TEMPLATES WITH REAL CDN MP4 VIDEO & THUMBNAIL PREVIEWS
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

function PreviewCard({ template, isFeatured = false }: { template: RealVideoTemplate; isFeatured?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  
  const rawVideo = template.video_path;
  const videoUrl = rawVideo ? convertR2UrlToCdn(rawVideo) : null;
  const rawThumb = template.thumbnail_path || template.img;
  const posterUrl = rawThumb ? convertR2UrlToCdn(rawThumb) : undefined;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && videoUrl) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Link
      href={`/product/${template.slug}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col rounded-xl bg-[#0F172A]/90 border border-slate-800/80 overflow-hidden shadow-xl hover:border-sky-500/50 hover:shadow-sky-500/10 transition-all duration-300 ${
        isFeatured ? 'col-span-2 sm:col-span-2' : 'col-span-1'
      }`}
    >
      {/* Clean Media Box - No unwanted text overlays on video */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl || undefined}
            autoPlay={isFeatured}
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <img
            src={posterUrl || undefined}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </div>

      {/* Clean Minimal Title Bar Below Video */}
      <div className="p-2.5 sm:p-3 flex items-center justify-between bg-[#0D111A] border-t border-slate-800/60">
        <div className="min-w-0 pr-2">
          <p className="text-xs font-bold text-white truncate group-hover:text-sky-400 transition-colors">
            {template.name}
          </p>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {template.subtitle || 'Real Template Preview'}
          </p>
        </div>
        <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:bg-sky-500 group-hover:text-white transition-colors shrink-0">
          <Play className="w-3 h-3 fill-current" />
        </div>
      </div>
    </Link>
  );
}

export default function Hero() {
  const [templates, setTemplates] = useState<RealVideoTemplate[]>(REAL_MARKETPLACE_TEMPLATES);

  // Fetch 3 real approved templates with video_path from Supabase
  useEffect(() => {
    const fetchThreeTemplates = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('templates')
          .select('slug, name, subtitle, video_path, img, thumbnail_path, status')
          .eq('status', 'approved')
          .not('video_path', 'is', null)
          .order('created_at', { ascending: false })
          .limit(3);

        if (data && data.length >= 3) {
          setTemplates(data);
        }
      } catch (err) {
        console.error('Error loading real 3 templates:', err);
      }
    };

    fetchThreeTemplates();
  }, []);

  return (
    <section className="relative w-full pt-4 pb-4 md:pt-6 md:pb-6 px-4 sm:px-6 bg-[#0B0F17] overflow-hidden">
      {/* Background Ambient Mesh Light FX */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-sky-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-l from-blue-600/15 via-sky-500/10 to-transparent blur-[110px] pointer-events-none rounded-full" />

      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

          {/* Left Column: Headline, Value Proposition & Actions */}
          <div className="lg:col-span-6 space-y-4 text-left">
            
            {/* Category Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>India's Pay-Per-Product Creative Marketplace</span>
            </div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.02]">
                Elevate Your Edits With <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
                  CELITE MARKET
                </span>
              </h1>
            </motion.div>

            {/* Subtitle & Value Badges */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-3"
            >
              <p className="text-sm sm:text-base font-medium text-slate-300 max-w-xl leading-relaxed">
                Buy &amp; sell individual After Effects templates, sound effects, stock music, 3D models, and web templates. Pay only for what you download — no forced monthly subscriptions.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-400 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <div className="p-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Zap className="w-3 h-3 fill-sky-400" />
                  </div>
                  Pay-Per-Product
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="p-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  Commercial License
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="p-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Download className="w-3 h-3" />
                  </div>
                  Instant R2 Download
                </span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              <Link
                href="/templates"
                className="px-6 py-3 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-sky-500/20 text-xs sm:text-sm flex items-center gap-2 transition-all duration-300 active:scale-95 group"
              >
                <Zap className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                <span>Explore 10,000+ Assets</span>
              </Link>
              <Link
                href="/start-selling"
                className="px-5 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold rounded-xl border border-slate-700/80 text-xs sm:text-sm flex items-center gap-2 transition-all duration-300"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
                <span>Sell on Celite Market</span>
              </Link>
            </motion.div>

          </div>

          {/* Right Column: 3 Stylish Real Template Preview Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="lg:col-span-6 relative"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.slice(0, 3).map((tpl, i) => (
                <PreviewCard key={tpl.slug || i} template={tpl} isFeatured={i === 0} />
              ))}
            </div>
          </motion.div>

        </div>

        {/* Integrated Compact Bottom Metric Strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800/60"
        >
          {[
            { metric: '50,000+', label: 'Asset Downloads' },
            { metric: '1,200+', label: 'Independent Creators' },
            { metric: '100%', label: 'Pay-Per-Product' },
            { metric: '< 1 Sec', label: 'Cloudflare R2 Speed' },
          ].map((stat, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#0F172A]/60 border border-slate-800/60 text-center hover:border-slate-700/80 transition-colors">
              <p className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-400">
                {stat.metric}
              </p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
