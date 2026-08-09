"use client";

import { ArrowRight } from 'lucide-react';

export default function PromoBanner() {
    return (
        <div className="w-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white py-2.5 sm:py-3 px-6 sm:px-8 shadow-md border-b border-sky-400/20">
            <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-2 flex-wrap justify-center text-center">
                    <span className="whitespace-nowrap font-extrabold text-amber-300">🎉 3rd Anniversary Offer</span>
                    <span className="text-sky-200 hidden sm:inline">•</span>
                    <span className="whitespace-nowrap font-bold text-white">₹499 for monthly</span>
                    <span className="text-sky-200 hidden sm:inline">•</span>
                    <span className="font-extrabold text-sky-200 whitespace-nowrap">Unlimited Downloads</span>
                </div>

                <a
                    href="https://celite.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-sky-950 px-4 py-1.5 rounded-full text-xs font-black hover:bg-sky-50 transition-all duration-300 hover:scale-105 flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-md group"
                >
                    Get it now
                    <ArrowRight className="w-3 h-3 text-sky-700 group-hover:translate-x-0.5 transition-transform" />
                </a>
            </div>
        </div>
    );
}
