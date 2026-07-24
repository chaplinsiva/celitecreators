/* agent-notes: { ctx: "Reusable Floating Glass Drawer component in crisp light theme with live 15-min presigned R2 download timer", deps: [src/lib/r2.ts, src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState, useEffect } from 'react';
import { X, ShieldCheck, Download, Zap, Clock, CheckCircle2 } from 'lucide-react';

interface BuyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    slug: string;
    price: number;
    creatorName: string;
    sourcePathKey?: string;
  };
}

export default function BuyDrawer({ isOpen, onClose, product }: BuyDrawerProps) {
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 minutes = 900s

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (purchased && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [purchased, secondsRemaining]);

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleBuy = async () => {
    setPurchasing(true);
    // Simulate Razorpay order creation & HMAC verification
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setPurchasing(false);
    setPurchased(true);
    setDownloadUrl(
      `https://r2.celitecreators.in/source-files/${product.slug}.zip?token=mock_15min_ttl`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Floating Light Glass Drawer */}
      <div className="w-full max-w-md h-full glass-panel-glow bg-white/98 p-6 md:p-8 flex flex-col justify-between border-l border-sky-500/40 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-sky-50 text-sky-600 border border-sky-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-sky-600" /> 1-Click Purchase
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Product Summary */}
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{product.name}</h2>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                By <strong className="text-sky-600 font-bold">{product.creatorName}</strong>{' '}
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              </span>
              <span className="text-xl font-black text-slate-900">₹{product.price}</span>
            </div>
          </div>

          {/* Purchased State with Live 15-min Countdown */}
          {purchased ? (
            <div className="mt-8 space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Payment Verified!</h3>
                <p className="text-xs text-slate-600">
                  Your Cloudflare R2 presigned download link is active.
                </p>
              </div>

              {/* Countdown Badge */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between text-xs font-semibold text-sky-700">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600 animate-spin" /> Link Validity Window
                </span>
                <span className="font-mono text-base font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                  {formatTimer(secondsRemaining)}
                </span>
              </div>

              {/* Download Action */}
              <a
                href={downloadUrl || '#'}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-base"
              >
                <Download className="w-5 h-5" /> Download Source Package (.zip)
              </a>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Asset Type:</span>
                  <span className="font-semibold text-slate-900">Digital Source File</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Delivery Method:</span>
                  <span className="font-semibold text-sky-600">Presigned R2 Link</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">License:</span>
                  <span className="font-semibold text-slate-900">Commercial Use</span>
                </div>
              </div>

              {/* Buy Trigger */}
              <button
                onClick={handleBuy}
                disabled={purchasing}
                className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-sky-600/25 transition flex items-center justify-center gap-2 text-base"
              >
                <Zap className="w-5 h-5 fill-white" />
                {purchasing ? 'Opening Razorpay Modal...' : `Pay ₹${product.price} via Razorpay`}
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          🔒 Secure Pay-Per-Product Transaction • CeliteCreators Marketplace
        </div>
      </div>
    </div>
  );
}
