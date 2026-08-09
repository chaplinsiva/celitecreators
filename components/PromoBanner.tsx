"use client";

import { ArrowRight, Sparkles } from 'lucide-react';

export default function PromoBanner() {
    return (
        <div className="w-full bg-black text-white py-2.5 sm:py-3 px-6 sm:px-8 border-b border-zinc-800/80 relative z-30">
            <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-2 flex-wrap justify-center text-center">
                    <span className="whitespace-nowrap font-extrabold text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 3rd Anniversary Offer
                    </span>
                    <span className="text-zinc-600 hidden sm:inline">•</span>
                    <span className="whitespace-nowrap font-bold text-zinc-200">₹499 for monthly</span>
                    <span className="text-zinc-600 hidden sm:inline">•</span>
                    <span className="font-extrabold text-sky-400 whitespace-nowrap">Unlimited Downloads</span>
                </div>

                <a
                    href="https://celitemarket.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-1.5 rounded-full text-xs font-extrabold transition-all duration-300 hover:scale-105 flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm group"
                >
                    Get it now
                    <ArrowRight className="w-3 h-3 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
            </div>
        </div>
    );
}
