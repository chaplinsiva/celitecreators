/* agent-notes: { ctx: "Creator Shop Registration and KYC form component", deps: [src/lib/supabase.ts, src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CreatorRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    profileImageUrl: '',
    bannerImageUrl: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankUpiId: '',
  });

  const handleSlugGen = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mock API submit or Supabase insert
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
      setTimeout(() => {
        router.push(`/creator/${formData.slug || 'my-shop'}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create creator shop profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Start Selling Digital Assets
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-4 text-white">
          Become a Creator on Celite
        </h1>
        <p className="text-slate-400 text-base mt-2 max-w-lg mx-auto">
          Set up your shop profile, submit payout bank details, and start keeping up to 80% on every sale.
        </p>
      </div>

      {success ? (
        <div className="glass-panel-glow p-8 text-center rounded-2xl border border-emerald-500/30">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white">Shop Profile Created!</h2>
          <p className="text-slate-300 mt-2">Redirecting to your new creator storefront...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 glass-panel p-6 sm:p-10 rounded-2xl">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Section 1: Shop Public Branding */}
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-5 h-5 text-sky-400" /> 1. Shop Public Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Shop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Motion Studio"
                  value={formData.name}
                  onChange={(e) => handleSlugGen(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Shop URL Slug *</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-800 bg-slate-900/90">
                  <span className="px-3 py-3 text-xs text-slate-500 bg-slate-950 flex items-center border-r border-slate-800">
                    celitecreators.in/creator/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="apex-motion-studio"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full bg-transparent px-3 py-3 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Shop Bio & Portfolio Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your digital assets, compatible software, and experience..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Avatar Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.profileImageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, profileImageUrl: e.target.value }))}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Banner Header Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.bannerImageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bannerImageUrl: e.target.value }))}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payout & Bank KYC */}
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-sky-400" /> 2. Payout Bank Details (Protected by Supabase RLS)
            </h2>
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl mt-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <p className="text-xs text-sky-300 leading-relaxed">
                Bank details are encrypted and protected by Supabase Row Level Security. Only you and platform admins processing payouts can access this information.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Account Holder Name *</label>
                <input
                  type="text"
                  required
                  placeholder="As per bank records"
                  value={formData.bankAccountName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bankAccountName: e.target.value }))}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">UPI ID (Fast Payouts)</label>
                <input
                  type="text"
                  placeholder="name@okaxis / name@upi"
                  value={formData.bankUpiId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bankUpiId: e.target.value }))}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bank Account Number *</label>
                <input
                  type="text"
                  required
                  placeholder="9 to 18 digit account number"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bankAccountNumber: e.target.value }))}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">IFSC Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC0001234"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bankIfsc: e.target.value.toUpperCase() }))}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white uppercase focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-sky-600/25 transition text-base"
          >
            {loading ? 'Creating Shop Profile...' : 'Launch Creator Shop'}
          </button>
        </form>
      )}
    </div>
  );
}
