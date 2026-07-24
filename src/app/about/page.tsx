/* agent-notes: { ctx: "About Us page describing CeliteCreators marketplace mission, creator revenue split, and R2 presigned security", deps: [], state: active, last: "dani@2026-07-23" } */

import Link from 'next/link';
import { ShieldCheck, IndianRupee, Zap, Sparkles, Users, Lock, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <span className="px-4 py-1.5 text-xs font-bold rounded-full bg-sky-50 text-sky-600 border border-sky-200">
          Our Mission & Philosophy
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Empowering India's Digital Creators with Pay-Per-Product Assets
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          CeliteCreators was built to solve a simple problem: digital creators in India (video editors, 3D Blender artists, sound engineers, and UI designers) should not be forced into expensive recurring monthly subscriptions just to access source files.
        </p>
      </div>

      {/* 3 Key Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm hover:border-sky-500/30 transition">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Pay-Per-Product Model</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Pay only for the single asset you need in Indian Rupees (₹) via Razorpay, GPay, PhonePe, or Cards. No hidden recurring auto-debits.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm hover:border-sky-500/30 transition">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">80/20 Revenue Split</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Creators keep 80% of every sale. Payouts trigger automatically once net earnings reach ₹1,000 INR directly into their Indian bank accounts.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm hover:border-sky-500/30 transition">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Presigned R2 Storage</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Source packages are secured on Cloudflare R2 object storage. Download links use 15-minute time-to-live tokens generated after HMAC webhook verification.
          </p>
        </div>
      </div>

      {/* Platform Governance & Stats */}
      <div className="glass-panel-glow p-8 md:p-12 rounded-3xl border border-sky-500/30 bg-white grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <span className="text-3xl sm:text-4xl font-black text-slate-900 block">500+</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 block">Active Creators</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-black text-sky-600 block">₹1.8L+</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 block">Gross Volume</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-black text-slate-900 block">1,400+</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 block">Assets Sold</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-black text-emerald-600 block">4.9★</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 block">Buyer Rating</span>
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-500 to-sky-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Sell Your Digital Assets?</h2>
          <p className="text-sky-100 text-sm">Join top motion designers, 3D artists, and sound engineers earning on CeliteCreators.</p>
        </div>
        <Link
          href="/creator/register"
          className="px-8 py-4 bg-white text-sky-700 hover:bg-slate-50 font-bold rounded-xl text-sm transition shadow-lg shrink-0 flex items-center gap-2"
        >
          Open a Creator Shop <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
