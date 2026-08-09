"use client";

import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const faqs = [
  {
    question: "What is Celite Market?",
    answer: "Celite Market (celitemarket.in) is India's premier pay-per-product marketplace for digital creators. Download After Effects video templates, wedding save the dates, stock music, sound effects, 3D models, and graphics without forced monthly subscription commitments."
  },
  {
    question: "How does Pay-Per-Product purchasing work?",
    answer: "On Celite Market, you pay only for the individual assets you download. Browse 10,000+ verified templates, complete 1-click instant checkout via Razorpay (UPI, GPay, Cards, NetBanking), and receive instant source file downloads."
  },
  {
    question: "What license is included with my purchases?",
    answer: "Every product on Celite Market includes a standard commercial royalty-free license. You can use downloaded templates for personal projects, YouTube monetization, client assignments, wedding films, and commercial broadcasts worldwide."
  },
  {
    question: "How do I edit After Effects & Save The Date templates?",
    answer: "Download the .aep project zip folder, open it in Adobe After Effects (CC 2020 or newer recommended), swap text, logo, photo, and music placeholders, then render your video in 4K or Full HD."
  },
  {
    question: "How can I sell my templates on Celite Market?",
    answer: "Independent video editors, 3D artists, motion designers, and sound creators can open a verified studio shop on Celite Market. List your templates and earn direct bank payouts with automated Razorpay payouts."
  }
];

export default function FAQAndSubscribe() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Generate FAQPage structured data for Google rich snippets
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <section className="w-full py-12 md:py-16 bg-[#090D16] border-t border-slate-800/80 text-white px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold w-fit shadow-sm">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Celite Market Help Center</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-400">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl">
              Everything you need to know about purchasing, licensing, and selling on Celite Market.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: FAQ Items */}
            <div className="lg:col-span-7 space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800/80 bg-[#0F172A]/90 overflow-hidden hover:border-slate-700 transition-colors"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                  >
                    <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {faq.question}
                    </span>
                    <div className="flex-shrink-0 ml-4 p-1 rounded bg-slate-800 border border-slate-700 text-sky-400">
                      {openIndex === index ? (
                        <Minus className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 sm:p-5 pt-0 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-800/60 mt-1">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right Column: Celite Market Call to Action */}
            <div className="lg:col-span-5">
              <div className="bg-[#0F172A]/90 p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold w-fit">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Pay-Per-Product Guarantee</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Start Editing With Celite Market
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    No subscriptions. No monthly commitments. Pay only for what you download and get instant Cloudflare R2 files with commercial rights.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Link
                    href="/templates"
                    className="inline-flex items-center justify-center w-full py-3 px-5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl font-black text-xs sm:text-sm transition-all shadow-lg shadow-sky-500/20 active:scale-95 group"
                  >
                    <span>Browse 10,000+ Assets</span>
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/start-selling"
                    className="inline-flex items-center justify-center w-full py-3 px-5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-xl font-bold text-xs sm:text-sm transition-all"
                  >
                    <span>Become a Creator</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
