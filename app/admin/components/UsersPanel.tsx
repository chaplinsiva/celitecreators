// agent-notes: { ctx: "Admin panel for Creator Shops financial holdings breakdown, individual creator details, and platform users", deps: ["lib/supabaseClient.ts", "lib/creatorShopDetails.ts"], state: active, last: "sato@2026-08-21" }
"use client";

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabaseClient';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Wallet, 
  CheckCircle2, 
  ExternalLink, 
  Phone, 
  Mail, 
  MessageCircle, 
  CreditCard, 
  Eye, 
  X,
  Search
} from 'lucide-react';

type UserRow = { 
  id: string; 
  email: string | null; 
  first_name: string | null; 
  last_name: string | null; 
  created_at: string 
};

type CreatorShop = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  direct_upload_enabled: boolean;
  created_at: string;
  user_id: string;
  phone?: string | null;
  email?: string | null;
  joined_community?: boolean | null;
  bank_upi_id?: string | null;
  bank_account_name?: string | null;
  upi_id?: string | null;
  account_holder_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  payout_mode?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  users: { id: string; email: string | null } | null;
  financials?: {
    totalSales: number;
    grossRevenue: number;
    lifetimeEarnings: number;
    paidOutAmount: number;
    holdingBalance: number;
    pendingPayoutAmount: number;
  };
  templateMetrics?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  templates?: Array<{
    slug: string;
    name: string;
    status: string;
    price: number;
    created_at: string;
  }>;
};

export default function UsersPanel() {
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'creators' | 'users'>('creators');
  const [creatorShops, setCreatorShops] = useState<CreatorShop[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const [updatingShop, setUpdatingShop] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<CreatorShop | null>(null);
  const [creatorSearch, setCreatorSearch] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 50;

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Not signed in'); setLoadingUsers(false); return; }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search.trim()
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
      const json = await res.json();
      if (!res.ok || !json.ok) { setError(json.error || 'Failed to load users'); setLoadingUsers(false); return; }
      setUsers(json.users || []);
      setTotalUsers(json.total || 0);

      const { data: admins } = await supabase.from('admins').select('user_id');
      setAdminIds(new Set((admins ?? []).map((a: any) => a.user_id)));
    } catch (e: any) {
      setError(e?.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadCreators = async () => {
    try {
      setLoadingCreators(true);
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin/creator-shops', { headers: { Authorization: `Bearer ${session.access_token}` } });
      const json = await res.json();
      if (res.ok && json.ok) {
        setCreatorShops(json.shops || []);
      }
    } catch (e: any) {
      console.error('Failed to load creator shops:', e);
    } finally {
      setLoadingCreators(false);
    }
  };

  const toggleDirectUpload = async (shopId: string, enabled: boolean) => {
    try {
      setUpdatingShop(shopId);
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin/creator-shops', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ shop_id: shopId, direct_upload_enabled: enabled }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        await loadCreators();
      } else {
        alert(json.error || 'Failed to update');
      }
    } catch (e: any) {
      console.error('Failed to toggle direct upload:', e);
      alert('Error updating creator shop');
    } finally {
      setUpdatingShop(null);
    }
  };

  useEffect(() => {
    loadCreators();
  }, []);

  useEffect(() => {
    if (tab === 'users') {
      loadUsers();
    }
  }, [tab, page, search]);

  // Financial aggregates across all creators
  const totalHoldingBalance = creatorShops.reduce((acc, s) => acc + (s.financials?.holdingBalance || 0), 0);
  const totalLifetimeEarnings = creatorShops.reduce((acc, s) => acc + (s.financials?.lifetimeEarnings || 0), 0);
  const totalPaidOut = creatorShops.reduce((acc, s) => acc + (s.financials?.paidOutAmount || 0), 0);
  const totalSalesCount = creatorShops.reduce((acc, s) => acc + (s.financials?.totalSales || 0), 0);

  // Filtered creators for search
  const filteredCreators = creatorShops.filter((shop) => {
    if (!creatorSearch.trim()) return true;
    const q = creatorSearch.toLowerCase().trim();
    return (
      shop.name?.toLowerCase().includes(q) ||
      shop.slug?.toLowerCase().includes(q) ||
      shop.phone?.toLowerCase().includes(q) ||
      shop.email?.toLowerCase().includes(q) ||
      shop.users?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Creator Shops & Users Management</h2>
          <p className="mt-1 text-xs text-zinc-500 font-medium">
            Monitor registered creators, payments holding balances, contact details, and individual creator portfolios.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-2xl border border-zinc-200 text-xs font-bold">
          <button
            onClick={() => setTab('creators')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              tab === 'creators' ? 'bg-white text-sky-600 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Creator Shops ({creatorShops.length})
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              tab === 'users' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            👥 Platform Users ({totalUsers || users.length})
          </button>
        </div>
      </header>

      {tab === 'creators' && (
        <div className="space-y-6">
          {/* Overview Metric Cards for Creator Financials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Creator Balance Held</span>
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-700">₹{totalHoldingBalance.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Available for creator payouts</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Lifetime Creator Net</span>
                <span className="text-xs font-black text-sky-600">80%</span>
              </div>
              <p className="mt-2 text-2xl font-black text-zinc-900">₹{totalLifetimeEarnings.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{totalSalesCount} total creator sales</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Paid Out</span>
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
              </div>
              <p className="mt-2 text-2xl font-black text-zinc-900">₹{totalPaidOut.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Approved & distributed</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Creator Shops</span>
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="mt-2 text-2xl font-black text-zinc-900">{creatorShops.length}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Verified creator accounts</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={creatorSearch}
                onChange={(e) => setCreatorSearch(e.target.value)}
                placeholder="Search creator by name, slug, email, or phone..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-sky-500 shadow-xs"
              />
            </div>
            <span className="text-xs font-bold text-zinc-600">
              Showing {filteredCreators.length} of {creatorShops.length} creators
            </span>
          </div>

          {loadingCreators ? (
            <div className="text-sm text-zinc-500 p-8 text-center bg-white rounded-2xl border border-zinc-200">
              Loading creator shops & financial records…
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-50/80 border-b border-zinc-200 text-left text-xs uppercase tracking-wider text-zinc-500 font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Creator & Shop</th>
                    <th className="px-5 py-3.5">Contact Details</th>
                    <th className="px-5 py-3.5">Holding Balance</th>
                    <th className="px-5 py-3.5">Earnings & Sales</th>
                    <th className="px-5 py-3.5">Templates</th>
                    <th className="px-5 py-3.5">Direct Upload</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredCreators.map((shop) => {
                    const email = shop.email || shop.users?.email || 'N/A';
                    const phone = shop.phone || 'Not Provided';
                    const holding = shop.financials?.holdingBalance || 0;
                    const lifetime = shop.financials?.lifetimeEarnings || 0;
                    const sales = shop.financials?.totalSales || 0;
                    const approvedTpls = shop.templateMetrics?.approved || 0;
                    const totalTpls = shop.templateMetrics?.total || 0;
                    const joined = new Date(shop.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <tr key={shop.id} className="hover:bg-zinc-50/60 transition-colors">
                        {/* Shop info */}
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-zinc-900 flex items-center gap-2">
                            {shop.name}
                            <Link
                              href={`/${shop.slug}`}
                              target="_blank"
                              className="text-zinc-400 hover:text-sky-600 transition-colors"
                              title="Visit Creator Shop"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono">/{shop.slug}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">Joined {joined}</div>
                        </td>

                        {/* Contact details */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-800 font-medium">
                            <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-600 mt-1">
                            <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{phone}</span>
                          </div>
                          <div className="mt-1.5">
                            {shop.joined_community ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <MessageCircle className="w-3 h-3" /> Community Member
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-500">
                                Not in Community
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Holding Balance */}
                        <td className="px-5 py-4">
                          <div className="text-sm font-black text-emerald-700">
                            ₹{holding.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            Paid out: ₹{(shop.financials?.paidOutAmount || 0).toLocaleString('en-IN')}
                          </div>
                        </td>

                        {/* Earnings & Sales */}
                        <td className="px-5 py-4">
                          <div className="text-xs font-bold text-zinc-900">
                            ₹{lifetime.toLocaleString('en-IN')} Net
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {sales} {sales === 1 ? 'sale' : 'sales'} (Gross: ₹{(shop.financials?.grossRevenue || 0).toLocaleString('en-IN')})
                          </div>
                        </td>

                        {/* Templates count */}
                        <td className="px-5 py-4">
                          <div className="text-xs font-bold text-zinc-800">
                            {approvedTpls} Live / {totalTpls} Total
                          </div>
                          {(shop.templateMetrics?.pending || 0) > 0 && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-100 text-amber-800">
                              {shop.templateMetrics?.pending} Pending Review
                            </span>
                          )}
                        </td>

                        {/* Direct upload status */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => toggleDirectUpload(shop.id, !shop.direct_upload_enabled)}
                            disabled={updatingShop === shop.id}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                              shop.direct_upload_enabled
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200'
                            }`}
                          >
                            {updatingShop === shop.id
                              ? 'Saving...'
                              : shop.direct_upload_enabled
                              ? '✓ Direct Upload'
                              : '✕ Requires Review'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedShop(shop)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-extrabold transition-all shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCreators.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-zinc-500 italic">
                        {creatorSearch ? `No creator shops found matching "${creatorSearch}".` : 'No creator shops found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Individual Creator Shop Details Modal */}
          {selectedShop && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-200 shadow-2xl p-6 space-y-6">
                <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                      Creator Account Details
                    </span>
                    <h3 className="text-xl font-black text-zinc-900 mt-1">{selectedShop.name}</h3>
                    <p className="text-xs font-mono text-zinc-500">Shop Slug: /{selectedShop.slug}</p>
                  </div>
                  <button
                    onClick={() => setSelectedShop(null)}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Financial Holdings Breakdown */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 border border-emerald-200 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-700" /> Payment & Holding Summary
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                    <div>
                      <span className="text-[11px] text-emerald-800 font-medium">Currently Held Balance:</span>
                      <p className="text-xl font-black text-emerald-900">
                        ₹{(selectedShop.financials?.holdingBalance || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-600 font-medium">Total Lifetime Net (80%):</span>
                      <p className="text-base font-bold text-zinc-900">
                        ₹{(selectedShop.financials?.lifetimeEarnings || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-600 font-medium">Total Paid Out:</span>
                      <p className="text-base font-bold text-zinc-900">
                        ₹{(selectedShop.financials?.paidOutAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-600 font-medium">Gross Revenue Generated:</span>
                      <p className="text-sm font-bold text-zinc-800">
                        ₹{(selectedShop.financials?.grossRevenue || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-600 font-medium">Total Sales:</span>
                      <p className="text-sm font-bold text-zinc-800">
                        {selectedShop.financials?.totalSales || 0} order items
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-600 font-medium">Pending Payout Requests:</span>
                      <p className="text-sm font-bold text-amber-700">
                        ₹{(selectedShop.financials?.pendingPayoutAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact & Joining Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50/50 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" /> Contact Details
                    </h4>
                    <div className="text-xs space-y-1">
                      <p className="text-zinc-600">
                        Email: <strong className="text-zinc-900">{selectedShop.email || selectedShop.users?.email || 'N/A'}</strong>
                      </p>
                      <p className="text-zinc-600">
                        Phone: <strong className="text-zinc-900">{selectedShop.phone || 'Not Provided'}</strong>
                      </p>
                      <p className="text-zinc-600">
                        Community: {selectedShop.joined_community ? (
                          <strong className="text-emerald-600 font-bold">✓ WhatsApp Member</strong>
                        ) : (
                          <span className="text-zinc-400">Not Joined</span>
                        )}
                      </p>
                      <p className="text-zinc-600">
                        Joined Date: <span className="text-zinc-800 font-medium">{new Date(selectedShop.created_at).toLocaleDateString('en-IN')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50/50 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-zinc-400" /> Payout Destination
                    </h4>
                    <div className="text-xs space-y-1">
                      {selectedShop.bank_upi_id || selectedShop.upi_id ? (
                        <>
                          <p className="text-zinc-600">Method: <strong className="text-sky-700">UPI Transfer</strong></p>
                          <p className="text-zinc-600">UPI ID: <strong className="text-zinc-900 font-mono">{selectedShop.bank_upi_id || selectedShop.upi_id}</strong></p>
                          <p className="text-zinc-600">Holder: {selectedShop.bank_account_name || selectedShop.account_holder_name || 'N/A'}</p>
                        </>
                      ) : selectedShop.bank_account_number ? (
                        <>
                          <p className="text-zinc-600">Method: <strong className="text-sky-700">Bank Transfer (NEFT/IMPS)</strong></p>
                          <p className="text-zinc-600">Account: <strong className="text-zinc-900 font-mono">{selectedShop.bank_account_number}</strong></p>
                          <p className="text-zinc-600">IFSC: <span className="text-zinc-900 font-mono">{selectedShop.bank_ifsc || 'N/A'}</span></p>
                          <p className="text-zinc-600">Holder: {selectedShop.bank_account_name || selectedShop.account_holder_name || 'N/A'}</p>
                        </>
                      ) : (
                        <p className="text-zinc-400 italic">No payout method configured yet by creator.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Templates Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Uploaded Templates ({selectedShop.templateMetrics?.total || 0})
                    </h4>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        {selectedShop.templateMetrics?.approved || 0} Approved
                      </span>
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                        {selectedShop.templateMetrics?.pending || 0} Pending
                      </span>
                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">
                        {selectedShop.templateMetrics?.rejected || 0} Rejected
                      </span>
                    </div>
                  </div>

                  {(selectedShop.templates || []).length > 0 ? (
                    <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100">
                      {selectedShop.templates?.map((tpl) => (
                        <div key={tpl.slug} className="p-3 flex items-center justify-between text-xs hover:bg-zinc-50 transition-colors">
                          <div>
                            <p className="font-bold text-zinc-900">{tpl.name}</p>
                            <p className="text-[10px] text-zinc-400 font-mono">/{tpl.slug}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-zinc-700">₹{tpl.price || 399}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tpl.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : tpl.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {tpl.status || 'pending'}
                            </span>
                            <Link
                              href={`/product/${tpl.slug}`}
                              target="_blank"
                              className="text-sky-600 hover:text-sky-700 font-bold text-[11px]"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic p-3 text-center bg-zinc-50 rounded-xl border border-zinc-100">
                      No templates uploaded yet.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                  <Link
                    href={`/${selectedShop.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Visit Public Creator Shop
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedShop(null)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <>
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center justify-between gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                placeholder="Search users by email or name..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-sky-500 shadow-xs"
              />
            </div>
            <button
              onClick={() => loadUsers()}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Search
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50/80 border-b border-zinc-200 text-left text-xs uppercase tracking-wider text-zinc-500 font-bold">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((u) => {
                  const isAdminUser = adminIds.has(u.id);
                  const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || (u.email ? u.email.split('@')[0] : '');
                  return (
                    <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-zinc-900">{name}</td>
                      <td className="px-5 py-3.5 text-zinc-600 font-medium">{u.email || 'N/A'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                          isAdminUser ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {isAdminUser ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 text-xs">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  );
                })}
                {loadingUsers && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-zinc-500 italic">
                      Loading users...
                    </td>
                  </tr>
                )}
                {!loadingUsers && users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-zinc-500 italic">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalUsers > limit && (
            <div className="flex items-center justify-between border border-zinc-200 bg-white p-4 rounded-2xl shadow-xs text-xs">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="font-bold text-zinc-500">
                Page {page} of {Math.ceil(totalUsers / limit)} ({totalUsers} total users)
              </span>
              <button
                type="button"
                disabled={page === Math.ceil(totalUsers / limit)}
                onClick={() => setPage(p => Math.min(Math.ceil(totalUsers / limit), p + 1))}
                className="rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
