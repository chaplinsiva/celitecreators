// agent-notes: { ctx: "Admin panel for reviewing marketplace templates and approving/rejecting Celite subscription pool inclusion", deps: ["lib/supabaseClient.ts"], state: active, last: "sato@2026-08-14" }
"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";
import Link from "next/link";
import { Check, X, ShieldCheck, Sparkles, ShoppingBag, CheckCircle2, XCircle } from "lucide-react";

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
  const [marketplaceSubTab, setMarketplaceSubTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const vendorTemplates = (templates || []).filter(
    (t) => t.creator_shop_id || t.vendor_name
  );

  const pendingMarketplace = vendorTemplates.filter(t => (t.status || 'pending') === 'pending');
  const approvedMarketplace = vendorTemplates.filter(t => t.status === 'approved');
  const rejectedMarketplace = vendorTemplates.filter(t => t.status === 'rejected');

  const pendingSubscription = vendorTemplates.filter(t => t.subscription_submission_status === 'PENDING_REVIEW');
  const allSubscriptionPool = (templates || []).filter(t => t.available_on_celite_subscription || t.subscription_submission_status === 'PENDING_REVIEW');

  // Filter marketplace list based on sub-tab and search query
  const displayedMarketplaceTemplates = vendorTemplates.filter(t => {
    const currentStatus = (t.status || 'pending').toLowerCase();
    const matchesStatus =
      marketplaceSubTab === 'all' ? true : currentStatus === marketplaceSubTab;

    if (!matchesStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        t.name?.toLowerCase().includes(q) ||
        t.slug?.toLowerCase().includes(q) ||
        t.vendor_name?.toLowerCase().includes(q)
      );
    }

    return true;
  });

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
            Manage marketplace template approvals, inspect approved live assets, and re-reject or restore anytime.
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
              <span className="bg-sky-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
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
            Celite Subscription Pool
            {pendingSubscription.length > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingSubscription.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Tab 1: Marketplace Approvals */}
      {activeTab === 'marketplace' && (
        <section className="space-y-5">
          {/* Sub-Tabs and Search Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMarketplaceSubTab('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  marketplaceSubTab === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Pending Review
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  marketplaceSubTab === 'pending' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {pendingMarketplace.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMarketplaceSubTab('approved')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  marketplaceSubTab === 'approved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                ✓ Approved (Live)
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  marketplaceSubTab === 'approved' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {approvedMarketplace.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMarketplaceSubTab('rejected')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  marketplaceSubTab === 'rejected'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                ✕ Rejected
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  marketplaceSubTab === 'rejected' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                  {rejectedMarketplace.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMarketplaceSubTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  marketplaceSubTab === 'all'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                All Submissions ({vendorTemplates.length})
              </button>
            </div>

            {/* Quick Search Box */}
            <div className="w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates or creator..."
                className="w-full px-3.5 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-sky-500 shadow-xs"
              />
            </div>
          </div>

          {displayedMarketplaceTemplates.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
              {searchQuery ? `No templates found matching "${searchQuery}".` : `No templates found in ${marketplaceSubTab} status.`}
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayedMarketplaceTemplates.map((t) => {
                const vendor = t.vendor_name || "Unknown Creator";
                const price = t.price || 399;
                const inSubscription = !!t.available_on_celite_subscription;
                const status = (t.status || 'pending').toLowerCase();

                return (
                  <li
                    key={t.slug}
                    className={`rounded-2xl border bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-4 ${
                      status === 'approved'
                        ? 'border-emerald-200'
                        : status === 'rejected'
                        ? 'border-rose-200'
                        : 'border-zinc-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {status === 'approved' ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            ✓ Approved & Live
                          </span>
                        ) : status === 'rejected' ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            ✕ Rejected
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            Pending Review
                          </span>
                        )}

                        <span className="text-xs font-black text-sky-950 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          ₹{price}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-zinc-900 line-clamp-1">{t.name}</h3>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">{t.slug}</p>
                      <p className="text-xs text-zinc-600 font-medium mt-2">
                        Creator: <span className="font-bold text-zinc-900">{vendor}</span>
                      </p>

                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
                        <span className="text-zinc-400">Subscription Pool:</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          inSubscription ? 'bg-indigo-100 text-indigo-800' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {inSubscription ? '✓ Active in Celite' : '✕ Excluded (Default)'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-zinc-100">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/product/${t.slug}`}
                          target="_blank"
                          className="flex-1 text-center py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-700 transition"
                        >
                          Preview Asset
                        </Link>
                      </div>

                      {/* Dynamic Action Buttons Based on Status */}
                      {status === 'approved' ? (
                        <button
                          type="button"
                          disabled={actionLoading === t.slug}
                          onClick={() => handleReviewMarketplace(t.slug, "rejected")}
                          className="w-full py-2 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-extrabold transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Reject Asset (Remove from Store)
                        </button>
                      ) : status === 'rejected' ? (
                        <button
                          type="button"
                          disabled={actionLoading === t.slug}
                          onClick={() => handleReviewMarketplace(t.slug, "approved")}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Re-Approve Asset (Make Live)
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={actionLoading === t.slug}
                            onClick={() => handleReviewMarketplace(t.slug, "approved")}
                            className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading === t.slug}
                            onClick={() => handleReviewMarketplace(t.slug, "rejected")}
                            className="w-full py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-extrabold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Tab 2: Celite Subscription Inclusion Requests (Approve / Reject directly) */}
      {activeTab === 'subscription' && (
        <section className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <span className="font-extrabold text-sm block text-indigo-950 mb-1">
                ⭐ Celite.in Subscription Pool Authorization
              </span>
              Creators submit templates for inclusion in the Celite subscription pool. By default, uploaded market templates are <strong>excluded</strong>. Approve templates below to make them downloadable by Celite.in subscribers.
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-200 text-indigo-900 font-bold text-xs">
                {pendingSubscription.length} Pending
              </span>
            </div>
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
                    className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                          Subscription Request
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Pending Approval
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-zinc-900 line-clamp-1">{t.name}</h3>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">{t.slug}</p>
                      <p className="text-xs text-zinc-600 font-medium mt-2">
                        Creator: <span className="font-bold text-zinc-900">{vendor}</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Market Price: <strong className="text-zinc-800">₹{t.price || 399}</strong>
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

                      {/* Direct Subscription Pool Approval Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={actionLoading === t.slug}
                          onClick={() => handleReviewSubscription(t.slug, "APPROVED")}
                          className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === t.slug}
                          onClick={() => handleReviewSubscription(t.slug, "REJECTED")}
                          className="w-full py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-extrabold transition flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
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
    </div>
  );
}
