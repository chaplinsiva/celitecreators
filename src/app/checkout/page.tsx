/* agent-notes: { ctx: "Single-product Checkout page with Razorpay order summary and presigned R2 download link box in crisp light theme", deps: [src/lib/razorpay.ts, src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, Download, Zap, IndianRupee, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const product = {
    name: 'Cyberpunk HUD Video Opener 4K',
    slug: 'cyberpunk-hud-opener-4k',
    category: 'After Effects Template',
    price: 399,
    creatorName: 'Apex Motion Studio',
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) return;
    setProcessing(true);

    // Simulate Razorpay Order Creation & HMAC Verification
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setProcessing(false);
    setCompleted(true);
    setDownloadUrl('https://r2.celitecreators.in/mock-presigned-source-download.zip?token=mock_15min_ttl');
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Back to Catalog */}
      <Link href="/browse" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Single-Item Checkout</h1>
          <p className="text-slate-500 text-sm mt-1">Pay once in INR (₹) and get instant 15-minute presigned R2 direct download link.</p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-600 border border-sky-200 text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-sky-600" /> Razorpay HMAC Verified
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Order Summary */}
        <div className="md:col-span-1 glass-panel p-6 rounded-2xl space-y-6 border border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">Order Summary</h2>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded bg-sky-100 text-sky-700">
                {product.category}
              </span>
              <h3 className="font-bold text-slate-900 text-sm leading-snug">{product.name}</h3>
              <p className="text-xs text-slate-500">By {product.creatorName}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-4">
              <div className="flex justify-between">
                <span>Item Price</span>
                <span className="font-semibold text-slate-900">₹{product.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Handling Fee</span>
                <span className="font-semibold text-emerald-600">FREE (₹0)</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-3">
                <span>Total Amount Due</span>
                <span className="text-sky-600">₹{product.price} INR</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-800 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-sky-600 text-sky-600" /> No Monthly Subscription
            </div>
            <p className="text-[11px] text-sky-700 leading-normal">
              You own this license forever for commercial projects.
            </p>
          </div>
        </div>

        {/* Right Column: Customer Details & Payment Trigger */}
        <div className="md:col-span-2 glass-panel-glow p-6 sm:p-8 rounded-2xl space-y-6 border border-sky-500/30 bg-white">
          {completed ? (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900">Payment Successful!</h2>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Your Razorpay payment transaction has been verified via HMAC timing-safe signatures.
                </p>
              </div>

              <div className="p-5 bg-sky-50 border border-sky-200 rounded-2xl max-w-md mx-auto space-y-3">
                <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                  Presigned Cloudflare R2 Download
                </div>
                <a
                  href={downloadUrl || '#'}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-base"
                >
                  <Download className="w-5 h-5" /> Download Source (.zip)
                </a>
                <p className="text-[11px] text-slate-500">Link expires in 15 minutes to prevent unauthorized distribution.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Customer Delivery Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">Enter your email to receive invoice copy & presigned download link.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@studio.in"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white text-sm transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Phone Number (UPI / Mobile)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white text-sm transition"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-sky-600/20 transition flex items-center justify-center gap-2 text-base"
                >
                  <IndianRupee className="w-5 h-5" />
                  {processing ? 'Processing Razorpay Order...' : `Pay ₹${product.price} INR with Razorpay`}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Secured by Razorpay • GPay, PhonePe, Paytm, Cards & NetBanking
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
