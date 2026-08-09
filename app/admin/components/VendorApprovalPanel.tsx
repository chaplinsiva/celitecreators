"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";
import Link from "next/link";
import { Check, X, ShieldCheck, Sparkles, ShoppingBag } from "lucide-react";

type TemplateRow = {
  slug: string;
  name: string;
  img: string | null;
  video?: string | null;
  price?: number | null;
  vendor_name?: string | null;
  creator_shop_id?: string | null;
  status?: string | null;
  subscription_submission_status?: string | null;
  available_on_celite_market?: boolean;
  available_on_celite_subscription?: boolean;
};

export default function VendorApprovalPanel({
  templates,
  onReviewed,
}: {
  templates: TemplateRow[];
  onReviewed: () => Promise<void> | void;
}) {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'subscription'>('marketplace');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const vendorTemplates = (templates || []).filter(
    (t) => t.creator_shop_id || t.vendor_name
  );

  const pendingMarketplace = vendorTemplates.filter(t => t.status === 'pending');
  const pendingSubscription = vendorTemplates.filter(t => t.subscription_submission_status === 'PENDING_REVIEW');

  const handleReviewMarketplace = async (
    slug: string,
    status: "approved" | "rejected"
  ) => {
    setActionLoading(slug);
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/templates/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ slug, status }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        await onReviewed();
      }
    } catch (e) {
      console.error("Failed to review marketplace template", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewSubscription = async (
    slug: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setActionLoading(slug);
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/subscription/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ slug, status }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        await onReviewed();
      }
    } catch (e) {
      console.error("Failed to review subscription request", e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">CELITE MARKET Approval Center</h2>
          <p className="mt-1 text-xs text-zinc-500 font-medium">
            Manage single product marketplace approvals and Celite.in subscription pool requests.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-2xl border border-zinc-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'marketplace' ? 'bg-white text-sky-600 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Marketplace Approvals
            {pendingMarketplace.length > 0 && (
              <span className="bg-sky-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingMarketplace.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'subscription' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Celite Sub Requests
            {pendingSubscription.length > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingSubscription.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Tab 1: Marketplace Approvals */}
      {activeTab === 'marketplace' && (
        <section className="space-y-4">
          {pendingMarketplace.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
              ✓ All marketplace creator submissions have been reviewed!
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pendingMarketplace.map((t) => {
                const vendor = t.vendor_name || "Unknown Creator";
                const price = t.price || 399;

                return (
                  <li
                    key={t.slug}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Approval
                        </span>
                        <span className="text-xs font-black text-sky-950 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          ₹{price}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-zinc-900 line-clamp-1">{t.name}</h3>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">{t.slug}</p>
                      <p className="text-xs text-zinc-600 font-medium mt-2">
                        Creator: <span className="font-bold text-zinc-900">{vendor}</span>
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-zinc-100">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/product/${t.slug}`}
                          target="_blank"
                          className="flex-1 text-center py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-700 transition"
                        >
                          Preview
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={actionLoading === t.slug}
                          onClick={() => handleReviewMarketplace(t.slug, "approved")}
                          className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === t.slug}
                          onClick={() => handleReviewMarketplace(t.slug, "rejected")}
                          className="w-full py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-extrabold transition flex items-center justify-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Tab 2: Celite Subscription Inclusion Requests (View Only on Market Admin) */}
      {activeTab === 'subscription' && (
        <section className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900 font-medium flex items-center justify-between">
            <div>
              <span className="font-bold block text-indigo-950">ℹ️ Subscription Approval Authority</span>
              Celite Subscription pool inclusion requests submitted by creators are reviewed and approved on the <strong>Celite.in Admin Panel</strong>. You can inspect pending requests below.
            </div>
            <a
              href="https://celite.in/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shrink-0 transition"
            >
              Open Celite.in Admin →
            </a>
          </div>

          {pendingSubscription.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
              ✓ No pending Celite.in subscription inclusion requests!
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pendingSubscription.map((t) => {
                const vendor = t.vendor_name || "Unknown Creator";

                return (
                  <li
                    key={t.slug}
                    className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                          Subscription Request
                        </span>
                        <span className="text-[10px] font-bold text-amber-700">Pending Celite.in Review</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-zinc-900 line-clamp-1">{t.name}</h3>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">{t.slug}</p>
                      <p className="text-xs text-zinc-600 font-medium mt-2">
                        Creator: <span className="font-bold text-zinc-900">{vendor}</span>
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-indigo-100">
                      <Link
                        href={`/product/${t.slug}`}
                        target="_blank"
                        className="block w-full text-center py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-xs font-bold text-indigo-900 transition"
                      >
                        Preview Asset
                      </Link>
                      <p className="text-[10px] text-zinc-500 text-center font-medium">
                        Approve via <a href="https://celite.in/admin" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-bold">Celite.in Admin</a>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
