// agent-notes: { ctx: "Client dashboard showing user lifetime purchased assets", deps: ["context/AppContext.tsx", "lib/supabaseClient.ts"], state: active, last: "antigravity@2026-08-13" }
"use client";

import Link from "next/link";
import { useAppContext } from "../../context/AppContext";
import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";
import { formatPrice } from "../../lib/currency";
import PurchaseDownloadButton from "./PurchaseDownloadButton";
import { GlowingEffect } from "../../components/ui/glowing-effect";
import { cn, convertR2UrlToCdn } from "../../lib/utils";
import LoadingSpinner from "../../components/ui/loading-spinner";
import PongalProgressBar from "../../components/PongalProgressBar";

type DownloadItemRow = {
  slug: string;
  name: string;
  img: string | null;
  downloaded_at: string;
};

type CreatorShop = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_upi_id: string | null;
};

// Component that uses search params (needs to be in Suspense)
function DashboardContent() {
  const { user, logout } = useAppContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sub, setSub] = useState<{ is_active: boolean; plan: string | null; valid_until: string | null; created_at: string | null; updated_at: string | null; autopay_enabled: boolean | null } | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState<number | null>(null);
  const [yearlyPrice, setYearlyPrice] = useState<number | null>(null);
  const [recentDownloads, setRecentDownloads] = useState<DownloadItemRow[]>([]);
  const [creatorShop, setCreatorShop] = useState<CreatorShop | null>(null);
  const [viewMode, setViewMode] = useState<"buyer" | "seller">("buyer");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showManageSubscription, setShowManageSubscription] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRenewConfirm, setShowRenewConfirm] = useState(false);
  const [userMetadata, setUserMetadata] = useState<{ first_name: string | null; last_name: string | null }>({ first_name: null, last_name: null });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Seller stats & payouts states
  const [stats, setStats] = useState<any>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // Show success message if redirected from payment
  useEffect(() => {
    if (searchParams?.get('payment') === 'success') {
      setMessage('Payment successful! Your purchase is now available.');
      setTimeout(() => setMessage(null), 5000);
      // Remove query param from URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  // Function to reload all dashboard data
  const reloadDashboardData = useCallback(async () => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();

    // Load user metadata
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser?.user_metadata) {
      setUserMetadata({
        first_name: currentUser.user_metadata.first_name || null,
        last_name: currentUser.user_metadata.last_name || null,
      });
    }

    // Load subscription - use realtime subscription for auto-updates
    const { data: s } = await supabase
      .from('subscriptions')
      .select('is_active, plan, valid_until, created_at, updated_at, autopay_enabled')
      .eq('user_id', (user as any).id)
      .maybeSingle();
    if (s) {
      setSub({
        is_active: !!s.is_active,
        plan: s.plan ?? null,
        valid_until: s.valid_until ?? null,
        created_at: s.created_at ?? null,
        updated_at: s.updated_at ?? null,
        autopay_enabled: typeof s.autopay_enabled === 'boolean' ? s.autopay_enabled : null,
      });
    } else {
      setSub(null);
    }

    // Load pricing from settings
    const { data: settings } = await supabase.from('settings').select('key,value');
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((row: any) => {
        map[row.key] = row.value;
      });
      // Use canonical conversion: all DB values are in paise (smallest unit)
      const { paiseToINR } = await import('../../lib/priceUtils');
      const parsePaiseAmount = (value?: string): number | null => {
        if (!value) return null;
        const amount = Number(value);
        if (Number.isNaN(amount) || amount <= 0) return null;
        return paiseToINR(amount);
      };
      setMonthlyPrice(parsePaiseAmount(map.RAZORPAY_MONTHLY_AMOUNT));
      setYearlyPrice(parsePaiseAmount(map.RAZORPAY_YEARLY_AMOUNT));
    }

    // Load creator shop (if any)
    try {
      const { data: shop } = await supabase
        .from("creator_shops")
        .select("id, slug, name, description, bank_account_name, bank_account_number, bank_ifsc, bank_upi_id")
        .eq("user_id", (user as any).id)
        .maybeSingle();
      setCreatorShop((shop as CreatorShop) ?? null);
    } catch (e) {
      console.error("Failed to load creator shop", e);
      setCreatorShop(null);
    }

    // Load strictly paid one-time purchased templates (from orders & order_items)
    try {
      const purchasedMap = new Map<string, DownloadItemRow>();

      const { data: paidOrders } = await supabase
        .from('orders')
        .select('id, created_at')
        .eq('user_id', (user as any).id)
        .eq('status', 'paid');

      if (paidOrders && paidOrders.length > 0) {
        const orderIds = paidOrders.map((o: any) => o.id);
        const { data: items } = await supabase
          .from('order_items')
          .select('slug, name, created_at')
          .in('order_id', orderIds);

        if (items && items.length > 0) {
          const slugs = Array.from(new Set(items.map((i: any) => i.slug)));
          const { data: tpls } = await supabase
            .from('templates')
            .select('slug, name, img')
            .in('slug', slugs);

          const tplMap: Record<string, { name: string; img: string | null }> = {};
          (tpls ?? []).forEach((t: any) => {
            tplMap[t.slug] = { name: t.name, img: t.img ?? null };
          });

          items.forEach((i: any) => {
            if (i.slug && i.slug !== 'multiple') {
              purchasedMap.set(i.slug, {
                slug: i.slug,
                name: tplMap[i.slug]?.name || i.name || i.slug,
                img: tplMap[i.slug]?.img ?? null,
                downloaded_at: i.created_at,
              });
            }
          });
        }
      }

      const allPurchased = Array.from(purchasedMap.values());
      setRecentDownloads(allPurchased);
    } catch (e) {
      console.error('Failed to load purchased assets', e);
      setRecentDownloads([]);
    }
  }, [user]);

  const loadCreatorStats = useCallback(async () => {
    if (!creatorShop) return;
    setStatsLoading(true);
    setPayoutError(null);
    setPayoutMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/creator/templates", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setStats(json.stats);
      }
    } catch (e) {
      console.error("Failed to load creator stats:", e);
    } finally {
      setStatsLoading(false);
    }
  }, [creatorShop]);

  useEffect(() => {
    if (viewMode === "seller" && creatorShop) {
      loadCreatorStats();
    }
  }, [viewMode, creatorShop, loadCreatorStats]);

  const handleRequestPayout = async () => {
    if (!stats || stats.revenue < 800) return;
    setPayoutLoading(true);
    setPayoutError(null);
    setPayoutMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/creator/payout/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ amount: stats.revenue }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setPayoutError(json.error || "Failed to submit payout request.");
        return;
      }
      setPayoutMessage("Payout request submitted successfully! Admin will process transfer to your bank/UPI.");
      await loadCreatorStats();
    } catch (e: any) {
      setPayoutError(e?.message || "Failed to submit payout request.");
    } finally {
      setPayoutLoading(false);
    }
  };

  useEffect(() => {
    reloadDashboardData();

    // Set up periodic refresh every 30 seconds to catch new purchases
    const refreshInterval = setInterval(() => {
      reloadDashboardData();
    }, 30000); // 30 seconds

    // Also refresh when window regains focus (user comes back to tab)
    const handleFocus = () => {
      reloadDashboardData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [reloadDashboardData]);


  const handleEditProfile = async (firstName: string, lastName: string) => {
    try {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage('Session expired. Please log in again.');
        return;
      }

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Update failed');

      // Reload all dashboard data including user metadata
      await reloadDashboardData();

      setMessage('Profile updated successfully!');
      setShowEditProfile(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setMessage(e?.message || 'Failed to update profile');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (newPassword: string, confirmPassword: string) => {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage('Session expired. Please log in again.');
        return;
      }

      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Password change failed');

      setMessage('Password changed successfully!');
      setShowChangePassword(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setMessage(e?.message || 'Failed to change password');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelSubscription = async () => {
    setShowCancelConfirm(false);
    try {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage('Session expired. Please log in again.');
        return;
      }

      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Cancel failed');

      // Reload all dashboard data
      await reloadDashboardData();

      // Use the message from the API which includes the valid_until date
      setMessage(json.message || 'Autopay cancelled. You will keep access until the end of your billing period.');
      setShowManageSubscription(false);
      setTimeout(() => setMessage(null), 5000);
    } catch (e: any) {
      setMessage(e?.message || 'Failed to cancel subscription');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRenewSubscription = async () => {
    setShowRenewConfirm(true);
  };

  const confirmRenewSubscription = async () => {
    setShowRenewConfirm(false);
    // Redirect to marketplace catalog
    router.push('/video-templates');
  };

  // Check if subscription is actually active (is_active AND valid_until in future)
  const now = Date.now();
  const validUntil = sub?.valid_until ? new Date(sub.valid_until).getTime() : null;
  const isActuallyActive = !!sub?.is_active && (!validUntil || validUntil > now);
  const isPaused: boolean = !!(sub?.is_active && validUntil && validUntil <= now); // is_active true but validity expired
  const hasExpiredPlan = !sub?.is_active && sub?.plan; // Subscription expired and inactive
  const subscriptionTier = isActuallyActive
    ? (sub?.plan || 'Pro')
    : isPaused
      ? `${sub?.plan === 'yearly' ? 'Yearly' : 'Monthly'} Plan - Paused`
      : hasExpiredPlan
        ? `${sub?.plan === 'yearly' ? 'Yearly' : 'Monthly'} Plan Expired`
        : 'Free';
  const displayMonthlyPrice = formatPrice(monthlyPrice ?? 799);
  const displayYearlyPrice = formatPrice(yearlyPrice ?? 5499);

  if (!user) {
    return (
      <main className="bg-[#0B0F17] text-white min-h-screen pt-20 pb-20 px-6 relative">
        <div className="relative max-w-3xl mx-auto text-center mt-20">
          <div className="bg-[#090D16] rounded-3xl border border-slate-800/80 p-12 shadow-2xl text-white">
            <h1 className="text-3xl font-black text-white">Please sign in to view your dashboard</h1>
            <p className="mt-4 text-slate-300 text-lg font-medium">Access your purchased assets, subscription, and account settings.</p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center rounded-2xl bg-sky-600 px-8 py-3.5 text-base font-extrabold text-white transition hover:bg-sky-500 shadow-lg shadow-sky-600/30"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Get display name - prefer first/last name, fallback to email username
  const displayName = userMetadata.first_name || userMetadata.last_name
    ? `${userMetadata.first_name || ''} ${userMetadata.last_name || ''}`.trim()
    : user.email.split("@")[0];

  return (
    <main className="bg-[#0B0F17] text-white min-h-screen pt-20 pb-20 px-4 sm:px-6 relative">
      <div className="relative max-w-[1440px] mx-auto space-y-6">
        {/* Welcome Section */}
        <section className="bg-[#090D16] rounded-3xl border border-slate-800/80 p-8 shadow-2xl text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="uppercase tracking-wider text-xs font-black text-sky-400">Dashboard</p>
              <h1 className="mt-2 text-3xl font-black text-white">Welcome back, {displayName}</h1>
              <p className="text-xs text-slate-400 font-medium mt-1">Manage your profile and access your lifetime purchased creative assets.</p>
            </div>
            {/* Buyer / Seller mode toggle (only if user has a creator shop) */}
            {creatorShop && (
              <div className="inline-flex rounded-full bg-[#0F172A] border border-slate-800 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("buyer")}
                  className={`px-4 py-1.5 rounded-full font-bold transition-colors ${viewMode === "buyer"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                    }`}
                >
                  Buyer mode
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("seller")}
                  className={`px-4 py-1.5 rounded-full font-bold transition-colors ${viewMode === "seller"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                    }`}
                >
                  Seller mode
                </button>
              </div>
            )}
          </div>
        </section>

        {viewMode === "buyer" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Downloads & Lifetime Purchases (Main Column) */}
            <section className="lg:col-span-2 bg-[#0F172A]/90 rounded-3xl border border-slate-800/80 p-8 shadow-xl space-y-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">My Lifetime Purchased Assets</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Pay once, own forever. Re-download any of your purchased templates anytime below.
                  </p>
                </div>
                <Link href="/video-templates" className="text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline shrink-0">
                  Explore More Assets →
                </Link>
              </div>

              {recentDownloads.length === 0 ? (
                <div className="text-center py-12 bg-[#090D16] rounded-2xl border border-slate-800 border-dashed space-y-3">
                  <p className="text-sm text-slate-300 font-medium">You haven&apos;t purchased any single templates yet.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    All single product purchases on Celite Market come with lifetime access and permanent re-download capabilities.
                  </p>
                  <Link href="/video-templates" className="inline-flex items-center rounded-xl bg-sky-600 text-white px-4 py-2 text-xs font-extrabold shadow-sm hover:bg-sky-500 transition">
                    Browse Marketplace
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {recentDownloads.map((d) => (
                    <li key={`${d.slug}-${d.downloaded_at}`} className="group flex items-center justify-between p-4 rounded-2xl bg-[#090D16] hover:bg-slate-800/50 transition-colors border border-slate-800/80">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-20 overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative">
                          {d.img ? (
                            <img src={convertR2UrlToCdn(d.img) || undefined} alt={d.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              <span className="text-xs">No img</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/product/${d.slug}`}
                            className="text-sm font-black text-white hover:text-sky-400 transition-colors"
                          >
                            {d.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                              ✓ Lifetime Owned
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Purchased on {new Date(d.downloaded_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/product/${d.slug}`}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition"
                        >
                          Re-Download File
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Sidebar: Account Info */}
            <div className="space-y-6">
              {/* Account Settings */}
              <section className="bg-[#0F172A]/90 rounded-3xl border border-slate-800/80 p-8 shadow-xl text-white">
                <h2 className="text-xl font-bold text-white mb-2">Account Settings</h2>
                <p className="text-sm text-slate-400 mb-6">Manage your profile and security.</p>

                <div className="flex flex-col gap-3">
                  <button onClick={() => setShowEditProfile(true)} className="w-full text-left px-4 py-3 rounded-xl bg-[#090D16] hover:bg-slate-800 border border-slate-800 text-sm font-medium text-slate-200 transition-colors flex justify-between group">
                    Edit Profile
                    <span className="text-slate-400 group-hover:text-white">→</span>
                  </button>
                  <button onClick={() => setShowChangePassword(true)} className="w-full text-left px-4 py-3 rounded-xl bg-[#090D16] hover:bg-slate-800 border border-slate-800 text-sm font-medium text-slate-200 transition-colors flex justify-between group">
                    Change Password
                    <span className="text-slate-400 group-hover:text-white">→</span>
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-950/50 border border-transparent hover:border-rose-900 text-sm font-bold transition-colors mt-2"
                  >
                    Log Out
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {viewMode === "seller" && creatorShop && (
          <section className="mt-6 bg-[#0F172A]/90 rounded-3xl border border-slate-800/80 p-8 shadow-xl text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Seller Hub & Payouts</h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Manage your store earnings, verify payouts, and request withdrawals.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`/${creatorShop.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-xs font-bold bg-[#090D16] border border-slate-800 rounded-xl text-slate-300 hover:text-white transition inline-flex items-center gap-1.5"
                >
                  🌐 View Public Store
                </a>
                <button
                  type="button"
                  onClick={() => router.push("/creator/dashboard")}
                  className="px-4 py-2 text-xs font-black bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-md shadow-sky-600/10 transition active:scale-95 cursor-pointer"
                >
                  🚀 Creator Studio Dashboard
                </button>
              </div>
            </div>

            {/* Earnings stats grid */}
            {statsLoading && !stats ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <LoadingSpinner />
                <p className="text-xs font-semibold">Loading earnings ledger...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Withdrawable Balance */}
                  <div className="bg-[#090D16] border border-slate-800/80 rounded-2xl p-5">
                    <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Withdrawable Balance</p>
                    <p className="text-2xl font-black text-white mt-1.5">
                      ₹{stats ? Math.round(stats.revenue).toLocaleString('en-IN') : '0'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Available for immediate transfer</p>
                  </div>

                  {/* Gross Earnings */}
                  <div className="bg-[#090D16] border border-slate-800/80 rounded-2xl p-5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Earnings</p>
                    <p className="text-2xl font-black text-white mt-1.5">
                      ₹{stats ? Math.round(stats.totalEarnings).toLocaleString('en-IN') : '0'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Total revenue share earned</p>
                  </div>

                  {/* Pending Payouts */}
                  <div className="bg-[#090D16] border border-slate-800/80 rounded-2xl p-5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Payouts</p>
                    <p className="text-2xl font-black text-slate-300 mt-1.5">
                      ₹{stats ? Math.round(stats.pendingPayoutAmount).toLocaleString('en-IN') : '0'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Under review by platform admins</p>
                  </div>

                  {/* Paid Out */}
                  <div className="bg-[#090D16] border border-slate-800/80 rounded-2xl p-5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Paid Out</p>
                    <p className="text-2xl font-black text-slate-300 mt-1.5">
                      ₹{stats ? Math.round(stats.paidOutAmount).toLocaleString('en-IN') : '0'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Successfully transferred to bank/UPI</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Bank Details section */}
                  <div className="bg-[#090D16] border border-slate-800/80 rounded-2xl p-6 md:col-span-7 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-4">Bank Account & UPI Details</h3>
                      <div className="space-y-2.5 text-xs font-medium text-slate-300">
                        <div className="flex justify-between border-b border-slate-900 pb-2">
                          <span className="text-slate-500">Account Name:</span>
                          <span className="text-white">{creatorShop.bank_account_name || "Not Set"}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-2">
                          <span className="text-slate-500">Account Number:</span>
                          <span className="text-white">{creatorShop.bank_account_number || "Not Set"}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-2">
                          <span className="text-slate-500">IFSC Code:</span>
                          <span className="text-white">{creatorShop.bank_ifsc || "Not Set"}</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-slate-500">UPI ID:</span>
                          <span className="text-white">{creatorShop.bank_upi_id || "Not Set"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-900">
                      <button
                        type="button"
                        onClick={() => router.push("/creator/dashboard")}
                        className="text-xs font-bold text-sky-400 hover:text-sky-300 transition cursor-pointer"
                      >
                        ✏️ Edit Studio &amp; Payout Settings
                      </button>
                    </div>
                  </div>

                  {/* Payout Request options */}
                  <div className="bg-[#090D16] border border-slate-800/80 rounded-2xl p-6 md:col-span-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-3">Withdraw Payout</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Request a withdrawal of your current withdrawable earnings directly to your bank account or UPI ID.
                      </p>

                      {payoutError && (
                        <div className="mt-3 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-400 text-xs font-semibold">
                          ⚠️ {payoutError}
                        </div>
                      )}
                      {payoutMessage && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-400 text-xs font-semibold">
                          ✓ {payoutMessage}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 space-y-3">
                      {stats && stats.revenue >= 800 ? (
                        <>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                            <span>✓</span> Eligible for immediate withdrawal
                          </div>
                          <button
                            type="button"
                            onClick={handleRequestPayout}
                            disabled={payoutLoading}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-700/10 transition active:scale-95 cursor-pointer disabled:opacity-60"
                          >
                            {payoutLoading ? "Submitting Request..." : `Request Payout (₹${Math.round(stats.revenue)})`}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="text-xs font-medium text-amber-500/90 leading-tight">
                            ⚠️ Payout minimum threshold is ₹800.
                          </div>
                          <button
                            type="button"
                            disabled
                            className="w-full py-3 bg-slate-800 text-slate-500 rounded-xl text-xs font-black border border-slate-700/60 opacity-60 cursor-not-allowed"
                          >
                            Request Payout (₹{stats ? Math.round(stats.revenue) : 0})
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md" onClick={() => setShowEditProfile(false)}>
          <div className="bg-[#0F172A] text-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-800" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold mb-4 text-white">Edit Profile</h2>
            <EditProfileForm
              firstName={userMetadata.first_name || ''}
              lastName={userMetadata.last_name || ''}
              onSubmit={handleEditProfile}
              onCancel={() => setShowEditProfile(false)}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md" onClick={() => setShowChangePassword(false)}>
          <div className="bg-[#0F172A] text-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-800" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold mb-4 text-white">Change Password</h2>
            <ChangePasswordForm
              onSubmit={handleChangePassword}
              onCancel={() => setShowChangePassword(false)}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Manage Subscription Modal */}
      {/* Message Toast */}
      {message && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-[#090D16] border border-slate-800 rounded-xl px-6 py-4 shadow-2xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-sm font-bold text-white">{message}</p>
          </div>
        </div>
      )}
    </main>
  );
}

function EditProfileForm({ firstName, lastName, onSubmit, onCancel, loading }: { firstName: string; lastName: string; onSubmit: (firstName: string, lastName: string) => void; onCancel: () => void; loading: boolean }) {
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);

  useEffect(() => {
    setFirst(firstName);
    setLast(lastName);
  }, [firstName, lastName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(first.trim(), last.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">First Name</label>
        <input
          type="text"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#090D16] border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500 transition-all"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Last Name</label>
        <input
          type="text"
          value={last}
          onChange={(e) => setLast(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#090D16] border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500 transition-all"
          required
        />
      </div>
      <div className="flex gap-3 mt-8">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-sky-600 text-white font-extrabold hover:bg-sky-500 transition disabled:opacity-60 shadow-md shadow-sky-600/30"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-slate-800 bg-[#090D16] text-slate-300 font-bold hover:bg-slate-800 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ChangePasswordForm({ onSubmit, onCancel, loading }: { onSubmit: (newPassword: string, confirmPassword: string) => void; onCancel: () => void; loading: boolean }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newPassword, confirmPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#090D16] border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500 transition-all"
          minLength={6}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#090D16] border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500 transition-all"
          minLength={6}
          required
        />
      </div>
      <div className="flex gap-3 mt-8">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-sky-600 text-white font-extrabold hover:bg-sky-500 transition disabled:opacity-60 shadow-md shadow-sky-600/30"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-slate-800 bg-[#090D16] text-slate-300 font-bold hover:bg-slate-800 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Main component with Suspense boundary
export default function DashboardClient() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading dashboard..." fullScreen />}>
      <DashboardContent />
    </Suspense>
  );
}

