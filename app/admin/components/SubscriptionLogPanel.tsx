// agent-notes: { ctx: "Admin checkout logs panel with touchpoint attribution badges, journey modal, and channel filters", deps: ["lib/supabaseClient.ts"], state: active, last: "sato@2026-08-14" }
"use client";

import { useEffect, useState, useMemo } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabaseClient';

type AttributionSnapshot = {
  first_source: string | null;
  first_medium: string | null;
  first_campaign: string | null;
  first_content: string | null;
  first_term: string | null;
  first_landing_page: string | null;
  first_referrer: string | null;
  first_product_viewed: string | null;
  first_visit_at: string | null;
  last_source: string | null;
  last_medium: string | null;
  last_campaign: string | null;
  last_content: string | null;
  last_term: string | null;
  last_landing_page: string | null;
  last_referrer: string | null;
  last_product_viewed: string | null;
  last_visit_at: string | null;
  touchpoint_count: number;
};

type CheckoutRow = {
  id: string;
  user_id: string;
  checkout_type: string;
  billing_name: string | null;
  billing_email: string | null;
  billing_mobile: string | null;
  subscription_plan: string | null;
  total_amount: string | null;
  status: string; // 'initiated' | 'completed' | 'failed'
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  cart_items_parsed?: Array<{ slug?: string; name?: string; price?: number; img?: string }>;
  created_at: string;
  updated_at: string;
  attribution?: AttributionSnapshot | null;
};

type StatusType = 'completed' | 'initiated' | 'failed';

function getStatus(s: CheckoutRow): StatusType {
  if (s.status === 'completed') return 'completed';
  if (s.status === 'failed') return 'failed';
  return 'initiated';
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;

  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  const dateFormatted = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${dateFormatted}, ${timeStr}`;
}

const STATUS_CONFIG: Record<StatusType, { label: string; bg: string; text: string; border: string; icon: string }> = {
  completed: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '✓' },
  initiated: { label: 'Initiated', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '◌' },
  failed: { label: 'Failed', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '✕' },
};

const SOURCE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Instagram Paid': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  'Instagram Organic': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Facebook Paid': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  'Facebook Organic': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  'Google Ads': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  'Google Organic': { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  'YouTube': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  'ChatGPT / AI': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  'Referral': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  'Direct': { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-300' },
  'Other': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
};

function getSourceStyle(sourceName: string | null) {
  if (!sourceName) return SOURCE_COLORS['Direct'];
  return SOURCE_COLORS[sourceName] || { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-200' };
}

const FILTER_TABS = ['all', 'completed', 'initiated', 'failed'] as const;
type FilterTab = typeof FILTER_TABS[number];

const ALL_SOURCES = [
  'All Sources',
  'Instagram Paid',
  'Instagram Organic',
  'Facebook Paid',
  'Facebook Organic',
  'Google Ads',
  'Google Organic',
  'YouTube',
  'ChatGPT / AI',
  'Referral',
  'Direct',
  'Other',
];

export default function SubscriptionLogPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkouts, setCheckouts] = useState<CheckoutRow[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('All Sources');
  const [search, setSearch] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [selectedJourney, setSelectedJourney] = useState<CheckoutRow | null>(null);
  const logsPerPage = 20;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError('Not signed in'); setLoading(false); return; }

        const res = await fetch('/api/admin/checkout-logs', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const json = await res.json();
        if (!res.ok || !json.ok) { setError(json.error || 'Failed to load'); setLoading(false); return; }
        setCheckouts(json.data || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredCheckouts = useMemo(() => {
    let list = [...checkouts];

    if (filter !== 'all') {
      list = list.filter(s => getStatus(s) === filter);
    }

    if (sourceFilter !== 'All Sources') {
      list = list.filter(s => {
        const ft = s.attribution?.first_source || 'Direct';
        const lt = s.attribution?.last_source || 'Direct';
        return ft === sourceFilter || lt === sourceFilter;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.billing_email || '').toLowerCase().includes(q) ||
        (s.billing_name || '').toLowerCase().includes(q) ||
        (s.billing_mobile || '').includes(q) ||
        (s.attribution?.first_campaign || '').toLowerCase().includes(q) ||
        (s.attribution?.first_source || '').toLowerCase().includes(q) ||
        (s.attribution?.last_source || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [checkouts, filter, sourceFilter, search]);

  useEffect(() => {
    setLogPage(1);
  }, [filter, sourceFilter, search]);

  const totalLogPages = Math.ceil(filteredCheckouts.length / logsPerPage);
  const paginatedCheckouts = filteredCheckouts.slice(
    (logPage - 1) * logsPerPage,
    logPage * logsPerPage
  );

  const counts = useMemo(() => {
    const c = { all: checkouts.length, completed: 0, initiated: 0, failed: 0 };
    checkouts.forEach(s => { c[getStatus(s)]++; });
    return c;
  }, [checkouts]);

  const totalRevenue = useMemo(() => {
    return checkouts
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + Number(c.total_amount || 0), 0);
  }, [checkouts]);

  if (loading) return <div className="text-center py-8 text-zinc-500">Loading product checkout & attribution logs…</div>;
  if (error) return <div className="text-sm text-red-500 py-8 text-center">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Checkout & Attribution Logs</h2>
          <p className="text-sm text-zinc-500 mt-1">Real-time marketplace orders with First-Touch and Last-Touch source tracking</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{counts.completed}</div>
          <div className="text-[11px] font-medium text-green-600 mt-1">Completed Orders</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{counts.initiated}</div>
          <div className="text-[11px] font-medium text-amber-600 mt-1">Initiated Checkouts</div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{counts.failed}</div>
          <div className="text-[11px] font-medium text-red-600 mt-1">Failed Attempts</div>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-center">
          <div className="text-2xl font-bold text-sky-700">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] font-medium text-sky-600 mt-1">Completed Revenue</div>
        </div>
      </div>

      {/* Filters + Source + Search */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status tabs */}
            <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-1">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filter === tab
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="ml-1.5 text-zinc-400">({counts[tab]})</span>
                </button>
              ))}
            </div>

            {/* Source dropdown */}
            <div className="relative">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {ALL_SOURCES.map((src) => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search name, email, campaign, source..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-72"
            />
          </div>
        </div>
      </div>

      {/* Log entries */}
      <div className="space-y-2">
        {filteredCheckouts.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center text-zinc-400">
            No checkout logs matching the selected filters
          </div>
        ) : (
          paginatedCheckouts.map((c) => {
            const status = getStatus(c);
            const cfg = STATUS_CONFIG[status];
            const name = c.billing_name || 'Customer';
            const phone = (c.billing_mobile || '').replace(/[^0-9]/g, '');

            const firstSource = c.attribution?.first_source || 'Direct';
            const lastSource = c.attribution?.last_source || 'Direct';
            const campaign = c.attribution?.first_campaign || c.attribution?.last_campaign || null;
            const ftStyle = getSourceStyle(firstSource);
            const ltStyle = getSourceStyle(lastSource);

            const waMsg = status === 'completed'
              ? encodeURIComponent(`Hi ${name}, thank you for your purchase on Celite Market! If you need any assistance downloading your files, feel free to ask.`)
              : encodeURIComponent(`Hi ${name}, we noticed you initiated a checkout on Celite Market. Can we help you with any questions?`);

            const emSubject = status === 'completed'
              ? encodeURIComponent('Thank you for your Celite Market purchase!')
              : encodeURIComponent('Need help with your Celite Market order?');

            const emBody = encodeURIComponent(`Hi ${name},\n\nThank you for choosing Celite Market! Reach out if you have any questions.\n\nBest regards,\nCelite Market Team`);
            const waUrl = phone ? `https://wa.me/${phone}?text=${waMsg}` : `https://wa.me/?text=${waMsg}`;
            const emUrl = c.billing_email ? `mailto:${c.billing_email}?subject=${emSubject}&body=${emBody}` : '';

            return (
              <div key={c.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {/* Left: Status & Customer Info */}
                  <div className="flex items-center gap-3 min-w-[240px]">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                      <span>{cfg.icon}</span> {cfg.label}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        {name}
                        {c.billing_email && <span className="text-xs font-normal text-zinc-500">{c.billing_email}</span>}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-medium">
                        {c.billing_mobile && <span className="mr-2">{c.billing_mobile}</span>}
                        <span>{formatDateTime(c.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Attribution Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* First Touch Badge */}
                    <span
                      title={`First Touch Discovery: ${firstSource}${c.attribution?.first_medium ? ` (${c.attribution.first_medium})` : ''}`}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${ftStyle.bg} ${ftStyle.text} ${ftStyle.border}`}
                    >
                      <span className="font-extrabold text-[9px] uppercase tracking-wider opacity-75">FT:</span>
                      {firstSource}
                    </span>

                    {/* Arrow if Assisted conversion */}
                    {firstSource !== lastSource && (
                      <span className="text-zinc-400 text-xs font-bold">➔</span>
                    )}

                    {/* Last Touch Badge (if different from first touch) */}
                    {firstSource !== lastSource && (
                      <span
                        title={`Last Touch Conversion: ${lastSource}${c.attribution?.last_medium ? ` (${c.attribution.last_medium})` : ''}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${ltStyle.bg} ${ltStyle.text} ${ltStyle.border}`}
                      >
                        <span className="font-extrabold text-[9px] uppercase tracking-wider opacity-75">LT:</span>
                        {lastSource}
                      </span>
                    )}

                    {/* Campaign tag */}
                    {campaign && (
                      <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded text-[11px] font-medium max-w-[150px] truncate" title={`Campaign: ${campaign}`}>
                        🏷️ {campaign}
                      </span>
                    )}

                    {/* Touchpoint Journey Button */}
                    <button
                      onClick={() => setSelectedJourney(c)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition-colors"
                      title="View full customer touchpoint journey"
                    >
                      <span>🎯 Journey</span>
                      {c.attribution?.touchpoint_count && c.attribution.touchpoint_count > 1 && (
                        <span className="bg-sky-600 text-white rounded-full px-1.5 py-0.2 text-[9px] font-bold">
                          {c.attribution.touchpoint_count}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-zinc-900">₹{Number(c.total_amount || 0).toLocaleString('en-IN')}</div>
                      {c.cart_items_parsed && c.cart_items_parsed.length > 0 && (
                        <div className="text-[10px] text-zinc-400 font-medium">
                          {c.cart_items_parsed.length} {c.cart_items_parsed.length === 1 ? 'asset' : 'assets'}
                        </div>
                      )}
                    </div>

                    {/* Direct Contact CTAs */}
                    <div className="flex items-center gap-1 border-l border-zinc-200 pl-2">
                      <a href={waUrl} target="_blank" rel="noopener noreferrer" title={`WhatsApp ${name}`} className="p-1.5 rounded-lg hover:bg-green-50 text-zinc-400 hover:text-green-600 transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.264-1.222l-.306-.183-2.869.852.852-2.869-.183-.306A8 8 0 1112 20z"/>
                        </svg>
                      </a>
                      {emUrl && (
                        <a href={emUrl} title={`Email ${name}`} className="p-1.5 rounded-lg hover:bg-sky-50 text-zinc-400 hover:text-sky-600 transition-colors">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalLogPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
          <div className="text-xs text-zinc-500 font-medium">
            Showing {(logPage - 1) * logsPerPage + 1}–{Math.min(logPage * logsPerPage, filteredCheckouts.length)} of {filteredCheckouts.length} entries
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Page {logPage} of {totalLogPages}</span>
            <button
              onClick={() => setLogPage(p => Math.max(1, p - 1))}
              disabled={logPage === 1}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setLogPage(p => Math.min(totalLogPages, p + 1))}
              disabled={logPage === totalLogPages}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Customer Journey Modal Popup */}
      {selectedJourney && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div>
                <h3 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2">
                  <span>🎯 Customer Marketing Journey</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    {selectedJourney.attribution?.touchpoint_count || 1} Touchpoints
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Customer: <strong className="text-zinc-800">{selectedJourney.billing_name || 'Customer'}</strong> ({selectedJourney.billing_email || 'N/A'})
                </p>
              </div>
              <button
                onClick={() => setSelectedJourney(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Journey Stepper */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. First Touch (Discovery) */}
                <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold tracking-wider text-pink-700 uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-600 animate-pulse"></span>
                      1. First Touch (Discovery)
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSourceStyle(selectedJourney.attribution?.first_source || 'Direct').bg} ${getSourceStyle(selectedJourney.attribution?.first_source || 'Direct').text} ${getSourceStyle(selectedJourney.attribution?.first_source || 'Direct').border}`}>
                      {selectedJourney.attribution?.first_source || 'Direct'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-600 bg-white/80 rounded-lg p-3 border border-pink-100">
                    <div><span className="font-semibold text-zinc-800">Campaign:</span> {selectedJourney.attribution?.first_campaign || '—'}</div>
                    <div><span className="font-semibold text-zinc-800">Medium:</span> {selectedJourney.attribution?.first_medium || '—'}</div>
                    <div><span className="font-semibold text-zinc-800">Content:</span> {selectedJourney.attribution?.first_content || '—'}</div>
                    <div><span className="font-semibold text-zinc-800">Term:</span> {selectedJourney.attribution?.first_term || '—'}</div>
                    <div className="truncate"><span className="font-semibold text-zinc-800">Referrer:</span> {selectedJourney.attribution?.first_referrer || 'None (Direct)'}</div>
                    <div className="truncate"><span className="font-semibold text-zinc-800">Landing:</span> <code className="text-zinc-800">{selectedJourney.attribution?.first_landing_page || '/'}</code></div>
                    <div><span className="font-semibold text-zinc-800">First Product:</span> {selectedJourney.attribution?.first_product_viewed || 'None'}</div>
                    <div><span className="font-semibold text-zinc-800">Time:</span> {selectedJourney.attribution?.first_visit_at ? new Date(selectedJourney.attribution.first_visit_at).toLocaleString() : 'N/A'}</div>
                  </div>
                </div>

                {/* 2. Last Touch (Conversion) */}
                <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold tracking-wider text-sky-700 uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                      2. Last Touch (Conversion)
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSourceStyle(selectedJourney.attribution?.last_source || 'Direct').bg} ${getSourceStyle(selectedJourney.attribution?.last_source || 'Direct').text} ${getSourceStyle(selectedJourney.attribution?.last_source || 'Direct').border}`}>
                      {selectedJourney.attribution?.last_source || 'Direct'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-600 bg-white/80 rounded-lg p-3 border border-sky-100">
                    <div><span className="font-semibold text-zinc-800">Campaign:</span> {selectedJourney.attribution?.last_campaign || '—'}</div>
                    <div><span className="font-semibold text-zinc-800">Medium:</span> {selectedJourney.attribution?.last_medium || '—'}</div>
                    <div><span className="font-semibold text-zinc-800">Content:</span> {selectedJourney.attribution?.last_content || '—'}</div>
                    <div><span className="font-semibold text-zinc-800">Term:</span> {selectedJourney.attribution?.last_term || '—'}</div>
                    <div className="truncate"><span className="font-semibold text-zinc-800">Referrer:</span> {selectedJourney.attribution?.last_referrer || 'None (Direct)'}</div>
                    <div className="truncate"><span className="font-semibold text-zinc-800">Landing:</span> <code className="text-zinc-800">{selectedJourney.attribution?.last_landing_page || '/checkout'}</code></div>
                    <div><span className="font-semibold text-zinc-800">Last Product:</span> {selectedJourney.attribution?.last_product_viewed || 'None'}</div>
                    <div><span className="font-semibold text-zinc-800">Time:</span> {selectedJourney.attribution?.last_visit_at ? new Date(selectedJourney.attribution.last_visit_at).toLocaleString() : 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Order summary & purchased items */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                  <span>Purchased Digital Assets ({selectedJourney.cart_items_parsed?.length || 1})</span>
                  <span className="text-sm font-extrabold text-sky-700">Total: ₹{Number(selectedJourney.total_amount || 0).toLocaleString('en-IN')}</span>
                </div>

                {selectedJourney.cart_items_parsed && selectedJourney.cart_items_parsed.length > 0 ? (
                  <div className="divide-y divide-zinc-200 bg-white rounded-lg border border-zinc-200 overflow-hidden">
                    {selectedJourney.cart_items_parsed.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {item.img && (
                            <img src={item.img} alt={item.name || 'item'} className="w-8 h-8 rounded object-cover border border-zinc-200" />
                          )}
                          <div>
                            <div className="font-bold text-zinc-900">{item.name || item.slug}</div>
                            <div className="text-[10px] text-zinc-400">{item.slug}</div>
                          </div>
                        </div>
                        <div className="font-bold text-zinc-800">₹{Number(item.price || 0).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 bg-white p-3 rounded-lg border border-zinc-200">
                    Product Details: {selectedJourney.razorpay_order_id ? `Order ID: ${selectedJourney.razorpay_order_id}` : 'Direct Single Product'}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedJourney(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold transition-all shadow-sm"
              >
                Close Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
