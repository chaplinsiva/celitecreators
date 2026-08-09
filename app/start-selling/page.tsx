"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../../context/AppContext";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export default function StartSellingPage() {
  const router = useRouter();
  const { user } = useAppContext();

  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankUpiId, setBankUpiId] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingSlug, setExistingSlug] = useState<string | null>(null);

  const previewSlug = useMemo(() => {
    if (existingSlug) return existingSlug;
    const base = slugify(shopName || (user?.email.split("@")[0] ?? ""));
    return base || "your-shop";
  }, [shopName, existingSlug, user]);

  // If user is not logged in, send them to login
  useEffect(() => {
    if (!user) {
      router.replace("/login?redirect=/start-selling");
    }
  }, [user, router]);

  // Load existing shop if any
  useEffect(() => {
    const loadExistingShop = async () => {
      if (!user) return;
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("creator_shops")
        .select(
          "name, description, slug, bank_account_name, bank_account_number, bank_ifsc, bank_upi_id"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) return;

      setShopName(data.name ?? "");
      setDescription(data.description ?? "");
      setExistingSlug(data.slug ?? null);
      setBankAccountName(data.bank_account_name ?? "");
      setBankAccountNumber(data.bank_account_number ?? "");
      setBankIfsc(data.bank_ifsc ?? "");
      setBankUpiId(data.bank_upi_id ?? "");
      setAgreeTerms(true); // Pre-check if existing shop owner
    };

    loadExistingShop();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!user) {
      setError("Please log in to start selling.");
      return;
    }

    if (!agreeTerms) {
      setError("Please read and tick the box to agree to the Creator Rules & Seller Policy before creating your account.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    setLoading(true);

    try {
      const baseSlug = slugify(shopName || user.email.split("@")[0]);
      if (!baseSlug) {
        setError("Please enter a valid shop name.");
        setLoading(false);
        return;
      }

      // Ensure unique slug
      let finalSlug = baseSlug;
      if (!existingSlug || existingSlug !== baseSlug) {
        let suffix = 1;
        // Loop until we find a free slug OR it's our own existing record
        // (public read policy allows this)
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { data: existing } = await supabase
            .from("creator_shops")
            .select("id, user_id")
            .eq("slug", finalSlug)
            .maybeSingle();

          if (!existing || existing.user_id === user.id) {
            break;
          }

          suffix += 1;
          finalSlug = `${baseSlug}-${suffix}`;
        }
      } else {
        finalSlug = existingSlug;
      }

      const payload = {
        user_id: user.id,
        slug: finalSlug,
        name: shopName.trim(),
        description: description.trim() || null,
        bank_account_name: bankAccountName.trim() || null,
        bank_account_number: bankAccountNumber.trim() || null,
        bank_ifsc: bankIfsc.trim() || null,
        bank_upi_id: bankUpiId.trim() || null,
      };

      const { data, error } = await supabase
        .from("creator_shops")
        .upsert(payload, { onConflict: "user_id" })
        .select("slug")
        .maybeSingle();

      if (error || !data) {
        setError(error?.message || "Failed to save creator profile.");
        setLoading(false);
        return;
      }

      setExistingSlug(data.slug);
      setMessage("Creator profile saved! Your page is ready.");

      // Small delay so user can see the success message
      setTimeout(() => {
        router.push(`/${data.slug}`);
      }, 800);
    } catch (err: any) {
      console.error("Error creating creator shop:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#0B0F17] min-h-screen pt-28 pb-20 px-4 text-white">
      <div className="max-w-3xl mx-auto bg-[#090D16] rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
            Start Selling on Celite Market
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-medium">
            Create your verified creator shop with a direct storefront link:{" "}
            <span className="font-mono text-xs sm:text-sm text-sky-400 bg-[#0F172A] border border-slate-800 px-3 py-1 rounded-xl inline-block mt-1 sm:mt-0 font-bold">
              celitemarket.in/{previewSlug}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Shop Name
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g., DT Studios"
              className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 outline-none transition-all font-medium"
              required
            />
            <p className="mt-1 text-xs text-slate-400">
              This controls your public studio name and shop URL slug.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Studio Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell buyers what After Effects templates, sound effects, or 3D models you create."
              rows={4}
              className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 outline-none transition-all resize-none font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Bank Account Name
              </label>
              <input
                type="text"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="Name on bank account"
                className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Bank Account Number
              </label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="Account number"
                className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                placeholder="IFSC Code"
                className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                UPI ID (optional)
              </label>
              <input
                type="text"
                value={bankUpiId}
                onChange={(e) => setBankUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Creator Rules & Selling Policy Agreement Box */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Creator Rules &amp; Selling Policies
            </h3>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
              <li>You must own 100% full copyright or valid commercial redistribution rights for all uploaded assets.</li>
              <li>Pay-per-product model: Creators earn 80% net revenue on all direct marketplace sales.</li>
              <li>Bank payouts are processed via Razorpay Automated Payouts upon reaching the ₹800 threshold.</li>
            </ul>
            <label className="flex items-start gap-3 pt-2 cursor-pointer text-xs sm:text-sm text-slate-200 font-semibold select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-[#090D16] text-sky-500 focus:ring-sky-500 shrink-0"
                required
              />
              <span>
                I have read and agree to Celite Market's <a href="/faq" target="_blank" className="text-sky-400 underline hover:text-sky-300">Creator Rules, Seller Policy &amp; Commission Terms</a>.
              </span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-rose-300 bg-rose-950/80 border border-rose-800 rounded-xl px-4 py-3 font-medium">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-emerald-300 bg-emerald-950/80 border border-emerald-800 rounded-xl px-4 py-3 font-medium">
              {message}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 font-medium">
              Your public storefront page:
              <span className="ml-1.5 font-mono text-xs text-sky-400 font-bold">
                celitemarket.in/{previewSlug}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !agreeTerms}
              className="inline-flex items-center justify-center rounded-2xl bg-sky-600 hover:bg-sky-500 text-white px-7 py-3.5 text-sm font-extrabold shadow-lg shadow-sky-600/30 hover:shadow-sky-600/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? "Saving Profile..." : existingSlug ? "Update Shop" : "Create Creator Shop"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}


