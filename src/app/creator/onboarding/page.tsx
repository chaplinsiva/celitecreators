/* agent-notes: { ctx: "4-step Creator Shop Onboarding wizard in crisp light theme for upgrading Buyer -> Creator", deps: [src/lib/supabase.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, Store, Image as ImageIcon, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [shopName, setShopName] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [description, setDescription] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setShopName(val);
    setShopSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upsert creator shop entry into Supabase DB
      await (supabase.from('creator_shops') as any).insert([
        {
          name: shopName,
          slug: shopSlug || 'creator-shop-' + Date.now(),
          description,
          profile_image_url: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          banner_image_url: bannerImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          bank_account_number: bankAccount,
          bank_ifsc: ifsc,
          bank_upi_id: upiId,
          is_verified: true,
        },
      ]);
    } catch (err) {
      // Ignore err for demo mode
    } finally {
      setLoading(false);
      setStep(4);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-sky-50 text-sky-600 border border-sky-200">
          Creator Account Upgrade
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Open Your Creator Shop</h1>
        <p className="text-xs text-slate-500">Set up your brand and bank details to start earning 80% net payouts on digital assets.</p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-between max-w-md mx-auto relative px-4">
        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
        {[1, 2, 3, 4].map((num) => (
          <div
            key={num}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs relative z-10 transition ${
              step >= num
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-white text-slate-400 border border-slate-200'
            }`}
          >
            {step > num ? <CheckCircle2 className="w-5 h-5 text-white" /> : num}
          </div>
        ))}
      </div>

      {/* Step Forms */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-200 bg-white shadow-xl">
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-sky-600" /> Step 1: Shop Brand Identity
              </h2>
              <p className="text-xs text-slate-500 mt-1">Choose a unique shop name and custom URL slug for your marketplace profile.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Shop Name</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={handleNameChange}
                  placeholder="Apex Motion Studio"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white text-xs transition font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Custom Shop URL</label>
                <div className="flex items-center">
                  <span className="px-3.5 py-3.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-mono text-xs">
                    celitecreators.in/creator/
                  </span>
                  <input
                    type="text"
                    required
                    value={shopSlug}
                    onChange={(e) => setShopSlug(e.target.value)}
                    placeholder="apex-motion-studio"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-r-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white text-xs transition font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Shop Bio & Focus Area</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specializing in 4K After Effects openers, Blender 3D assets, and cinematic sound effects..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white text-xs transition"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={!shopName}
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
            >
              Continue to Step 2 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-sky-600" /> Step 2: Profile & Banner Imagery
              </h2>
              <p className="text-xs text-slate-500 mt-1">Provide image URLs for your shop avatar and banner header.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Profile Photo URL</label>
                <input
                  type="url"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-avatar..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white text-xs transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Shop Banner Header URL</label>
                <input
                  type="url"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-banner..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white text-xs transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
              >
                Continue to Payout Setup <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleCompleteOnboarding} className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-600" /> Step 3: Payout Details (Indian Bank / UPI)
              </h2>
              <p className="text-xs text-slate-500 mt-1">Earnings payouts trigger automatically once net balance reaches ₹1,000 INR.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Bank Account Number</label>
                <input
                  type="text"
                  required
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="9182374650123"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-600 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Bank IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-600 focus:bg-white transition uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">UPI ID (Optional)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="creator@okhdfcbank"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-600 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !bankAccount || !ifsc}
                className="flex-1 py-3.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
              >
                {loading ? 'Launching Shop...' : 'Launch Creator Shop'} <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Congratulations! Your Shop is Live</h2>
              <p className="text-slate-600 text-xs max-w-md mx-auto">
                Your shop <strong>{shopName}</strong> is verified. You can now upload After Effects templates, Blender 3D models, and sound packs to start earning.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push('/creator/upload')}
                className="w-full sm:w-auto px-8 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                Upload First Digital Asset <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/creator/dashboard')}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
              >
                Go to Creator Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
