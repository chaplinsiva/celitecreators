// agent-notes: { ctx: "Storefront global footer with navigation and policy links", deps: ["next/link"], state: active, last: "antigravity@2026-08-13" }
"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/10 mt-auto text-slate-300">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tight">CELITE MARKET</span>
                <span className="text-xs font-bold text-sky-400 tracking-widest uppercase">Digital Asset Marketplace</span>
              </div>
            </Link>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              Buy and sell premium digital creative assets. Pay-per-product access to After Effects templates, sound effects, stock music, 3D models, and graphics from verified independent creators.
            </p>
          </div>

          {/* Marketplace Navigation */}
          <div>
            <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">Marketplace</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/templates" className="text-zinc-400 hover:text-white transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-zinc-400 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/start-selling" className="text-zinc-400 hover:text-white transition-colors">
                  Sell on Celite Market
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
                  My Purchases
                </Link>
              </li>
            </ul>
          </div>

          {/* Celite Subscription Cross-Link */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-sky-500/20 space-y-2.5">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Celite Subscription</h3>
            <p className="text-xs text-zinc-300 font-medium leading-relaxed">
              Get unlimited access to Celite Original templates for just <strong className="text-white">₹499/month</strong>.
            </p>
            <a
              href="https://celite.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 rounded-xl transition shadow"
            >
              Visit Celite.in →
            </a>
          </div>

          {/* Policies & Legal */}
          <div>
            <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">Support & Legal</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-zinc-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-zinc-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-zinc-400 hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-zinc-400 hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info & Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-400">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Support Email:</span>
                <a href="mailto:celitecontactsupport@celite.in" className="hover:text-white transition-colors">
                  celitecontactsupport@celite.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Phone:</span>
                <a href="tel:8939079627" className="hover:text-white transition-colors">
                  +91 89390 79627
                </a>
              </div>
            </div>
            <p className="text-zinc-500">© {new Date().getFullYear()} Celite Market. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}


