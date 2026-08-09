"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { convertR2UrlToCdn } from "@/lib/utils";
import { ArrowRight, Play, Heart, Sparkles } from "lucide-react";

type SaveDateItem = {
  slug: string;
  name: string;
  subtitle?: string | null;
  img?: string | null;
  video_path?: string | null;
  thumbnail_path?: string | null;
  price?: number;
};

type SaveDateShowcaseProps = {
  initialTemplates?: SaveDateItem[];
};

function SaveDateCard({ template }: { template: SaveDateItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const rawVideo = template.video_path;
  const videoUrl = rawVideo ? convertR2UrlToCdn(rawVideo) : null;
  const rawThumb = template.thumbnail_path || template.img;
  const posterUrl = rawThumb ? convertR2UrlToCdn(rawThumb) : undefined;

  const handleMouseEnter = () => {
    if (videoRef.current && videoUrl) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <Link
      href={`/product/${template.slug}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col rounded-2xl bg-[#0F172A]/90 border border-slate-800/80 overflow-hidden shadow-xl hover:border-amber-500/50 hover:shadow-amber-500/10 transition-all duration-300"
    >
      {/* Video Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl || undefined}
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

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Top Heart Badge */}
        <div className="absolute top-3 right-3 p-2 rounded-full bg-[#0F172A]/90 border border-slate-700/80 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-md">
          <Heart className="w-3.5 h-3.5 fill-current" />
        </div>

        {/* Wedding Tag */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-[#0B0F17]/90 border border-slate-800 text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
          Save The Date
        </div>
      </div>

      {/* Info Bar */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-[#0D111A]">
        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
            {template.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-medium">
            {template.subtitle || "Cinematic Wedding Invitation Template"}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-xs font-black text-amber-400">
            ₹299 <span className="text-[10px] text-slate-500 font-semibold">/ product</span>
          </span>
          <span className="text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-1 transition-colors">
            View Template <ArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function SaveDateShowcase({ initialTemplates }: SaveDateShowcaseProps) {
  const [templates, setTemplates] = useState<SaveDateItem[]>(initialTemplates || []);
  const [loading, setLoading] = useState(!initialTemplates || initialTemplates.length === 0);

  useEffect(() => {
    if (initialTemplates && initialTemplates.length > 0) return;

    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        
        // Fetch "Save Date" sub-subcategory ID
        const { data: subCat } = await supabase
          .from("sub_subcategories")
          .select("id")
          .eq("slug", "save-date")
          .maybeSingle();

        if (subCat?.id) {
          const { data } = await supabase
            .from("templates")
            .select("slug, name, subtitle, img, video_path, thumbnail_path, price")
            .eq("status", "approved")
            .eq("sub_subcategory_id", subCat.id)
            .order("created_at", { ascending: false })
            .limit(8);

          setTemplates(data || []);
        }
      } catch (err) {
        console.error("Error loading Save Date templates:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [initialTemplates]);

  if (!loading && templates.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-[#0B0F17] border-t border-slate-800/80 text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold w-fit shadow-sm">
              <Heart className="w-3.5 h-3.5 text-amber-400" />
              <span>Wedding &amp; Invites</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-300">
              Save The Date Templates
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl">
              Cinematic wedding invitation templates, WhatsApp invitation videos &amp; royal Save The Date intros.
            </p>
          </div>

          <Link
            href="/video-templates?sub_subcategory=save-date"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0 group"
          >
            <span>View All Save Date</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {templates.map((template) => (
            <SaveDateCard key={template.slug} template={template} />
          ))}
        </div>

      </div>
    </section>
  );
}
