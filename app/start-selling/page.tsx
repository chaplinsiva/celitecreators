"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppContext } from "../../context/AppContext";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";
import {
  ShieldCheck,
  CheckCircle2,
  Store,
  Landmark,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  AlertCircle,
  Lock,
} from "lucide-react";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

const STEPS = [
  { id: 1, name: "Studio Identity", description: "Shop name & bio", icon: Store },
  { id: 2, name: "Payout Setup", description: "Bank & UPI details", icon: Landmark },
  { id: 3, name: "Policy Agreement", description: "Terms & verification", icon: FileCheck },
];

export default function StartSellingPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAppContext();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [shopName, setShopName] = useState("");
  const [specialty, setSpecialty] = useState("Video Templates & Motion Graphics");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [confirmBankAccountNumber, setConfirmBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankUpiId, setBankUpiId] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingSlug, setExistingSlug] = useState<string | null>(null);

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const handleBrandingUpload = async (file: File, type: "banner" | "logo") => {
    setError(null);
    if (type === "banner") setUploadingBanner(true);
    else setUploadingLogo(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error("You must be logged in to upload store branding images.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/creator/shop/upload-branding", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Failed to upload ${type}`);
      }

      if (type === "banner") {
        setBannerUrl(data.url);
      } else {
        setLogoUrl(data.url);
      }
    } catch (err: any) {
      setError(err?.message || `Failed to upload ${type}`);
    } finally {
      if (type === "banner") setUploadingBanner(false);
      else setUploadingLogo(false);
    }
  };

  const previewSlug = useMemo(() => {
    if (existingSlug) return existingSlug;
    const base = slugify(shopName || (user?.email.split("@")[0] ?? ""));
    return base || "your-shop";
  }, [shopName, existingSlug, user]);

  // Calculate percentage completion
  const progressPercent = useMemo(() => {
    if (currentStep === 1) return 33;
    if (currentStep === 2) return 66;
    return 100;
  }, [currentStep]);

  // If user is not logged in, redirect to login (after auth session finishes loading)
  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.replace("/login?return=/start-selling");
    }
  }, [user, isAuthLoading, router]);

  // Check if user already has an active creator shop
  useEffect(() => {
    const loadExistingShop = async () => {
      if (!user) return;
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("creator_shops")
        .select("id, name, slug")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data && data.id) {
        // User already has an active creator shop – redirect directly to creator dashboard!
        router.replace("/creator/dashboard");
        return;
      }
    };

    loadExistingShop();
  }, [user, router]);

  // Step 1 Validation & Next
  const handleStep1Next = () => {
    setError(null);
    if (!shopName.trim()) {
      setError("Please enter a Shop Name to proceed.");
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Validation & Next
  const handleStep2Next = () => {
    setError(null);
    if (bankAccountNumber && confirmBankAccountNumber && bankAccountNumber !== confirmBankAccountNumber) {
      setError("Bank account numbers do not match.");
      return;
    }
    setCurrentStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!user) {
      setError("Please log in to start selling.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Creator Rules & Seller Policy before launching your shop.");
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
        logo_url: logoUrl.trim() || null,
        banner_url: bannerUrl.trim() || null,
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
      setMessage("🎉 Congratulations! Your Creator Shop has been launched successfully.");

      setTimeout(() => {
        router.push(`/${data.slug}`);
      }, 1000);
    } catch (err: any) {
      console.error("Error creating creator shop:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <main className="bg-[#0B0F17] min-h-screen text-white flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-md w-full bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 shadow-2xl text-center relative z-10 space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">
            Loading Seller Onboarding...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#0B0F17] min-h-screen pt-28 pb-20 px-4 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/60 border border-sky-800/50 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Seller Onboarding
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Launch Your Creator Shop
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Sell After Effects templates, SFX, 3D models, and graphics. Direct payouts &bull; 80% revenue share.
          </p>
        </div>

        {/* Step-by-Step Progress Card */}
        <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-8">
          {/* Progress Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="text-slate-300">
                Step {currentStep} of 3 &bull; <span className="text-sky-400 font-bold">{STEPS[currentStep - 1].name}</span>
              </span>
              <span className="text-sky-400 font-bold font-mono">{progressPercent}% Completed</span>
            </div>

            {/* Percentage Bar */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-500 ease-out shadow-sm shadow-sky-500/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Step Badges Navigation */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (step.id < currentStep) setCurrentStep(step.id);
                    }}
                    disabled={step.id > currentStep}
                    className={`flex flex-col sm:flex-row items-center sm:items-start gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      isActive
                        ? "bg-slate-900 border-sky-500/80 text-white shadow-lg shadow-sky-950/40"
                        : isCompleted
                        ? "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 cursor-pointer"
                        : "bg-slate-950/40 border-slate-900 text-slate-500 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-sky-600 text-white"
                          : isCompleted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs font-bold leading-tight">{step.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{step.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-800/80" />

          {/* Form Content Steps */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: STUDIO IDENTITY */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Shop / Studio Name <span className="text-sky-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. MotionCraft Studios"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all font-medium"
                    required
                  />
                  <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                    <span>Storefront URL:</span>
                    <span className="font-mono text-sky-400 font-bold bg-[#0F172A] px-2.5 py-1 rounded-lg border border-slate-800">
                      celitemarket.in/{previewSlug}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Primary Creative Specialty
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all font-medium"
                  >
                    <option value="Video Templates & Motion Graphics">Video Templates &amp; Motion Graphics</option>
                    <option value="Sound Effects & Audio">Sound Effects &amp; Audio</option>
                    <option value="3D Models & Assets">3D Models &amp; Assets</option>
                    <option value="Stock Photos & Graphics">Stock Photos &amp; Graphics</option>
                    <option value="Web & UI Templates">Web &amp; UI Templates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Studio Bio &amp; Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Introduce your studio to buyers. What kind of assets do you produce?"
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all resize-none font-medium"
                  />
                </div>

                {/* Optional Branding Setup */}
                <div className="p-4 rounded-2xl bg-[#0F172A]/70 border border-slate-800 space-y-4">
                  <p className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Store Branding &amp; Media (Optional)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Studio Logo / Avatar
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                          {logoUrl ? (
                            <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-slate-500 text-[10px] font-bold font-mono">Logo</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {uploadingLogo ? "Uploading..." : "Upload Logo"}
                        </button>
                        <input
                          ref={logoFileInputRef}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBrandingUpload(file, "logo");
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Header Cover Banner
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                          {bannerUrl ? (
                            <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-slate-500 text-[10px] font-bold font-mono">Banner</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => bannerFileInputRef.current?.click()}
                          disabled={uploadingBanner}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {uploadingBanner ? "Uploading..." : "Upload Banner"}
                        </button>
                        <input
                          ref={bannerFileInputRef}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBrandingUpload(file, "banner");
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PAYOUT SETUP */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-sky-950/30 border border-sky-800/40 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                  <Lock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white mb-0.5">Secure Automated Payouts</p>
                    <p className="text-slate-400">
                      Your payout details are encrypted. Revenues are automatically transferred directly to your bank account via Razorpay.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Bank Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="Full name on bank account"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-sky-500 outline-none transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-sky-500 outline-none transition-all font-medium uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="Account number"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-sky-500 outline-none transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Confirm Account Number
                    </label>
                    <input
                      type="text"
                      value={confirmBankAccountNumber}
                      onChange={(e) => setConfirmBankAccountNumber(e.target.value)}
                      placeholder="Re-enter account number"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-sky-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    UPI ID (Optional Payout Method)
                  </label>
                  <input
                    type="text"
                    value={bankUpiId}
                    onChange={(e) => setBankUpiId(e.target.value)}
                    placeholder="e.g. yourname@upi"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-sky-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: POLICY AGREEMENT & LAUNCH */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Creator Terms &amp; Revenue Policy</h3>
                      <p className="text-xs text-slate-400 font-medium">Please review our seller terms before proceeding.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-[#090D16] border border-slate-800 rounded-xl p-3.5 text-center">
                      <p className="text-xl font-extrabold text-sky-400">80%</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Creator Net Revenue</p>
                    </div>
                    <div className="bg-[#090D16] border border-slate-800 rounded-xl p-3.5 text-center">
                      <p className="text-xl font-extrabold text-white">₹800</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Auto Payout Threshold</p>
                    </div>
                    <div className="bg-[#090D16] border border-slate-800 rounded-xl p-3.5 text-center">
                      <p className="text-xl font-extrabold text-emerald-400">100%</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Direct Asset Rights</p>
                    </div>
                  </div>

                  <ul className="text-xs sm:text-sm text-slate-300 space-y-2 list-disc list-inside font-medium leading-relaxed pt-2">
                    <li>You warrant that you hold full original copyright or redistribution permissions for all products.</li>
                    <li>Pay-per-product access grants perpetual lifetime download rights to valid purchasers.</li>
                    <li>Automated bank transfers execute upon reaching the payout threshold.</li>
                  </ul>

                  <label className="flex items-start gap-3 pt-3 border-t border-slate-800/80 cursor-pointer text-xs sm:text-sm text-slate-200 font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 bg-[#090D16] text-sky-500 focus:ring-sky-500 shrink-0"
                      required
                    />
                    <span>
                      I have read, understood, and agree to Celite Market's{" "}
                      <a href="/faq" target="_blank" className="text-sky-400 underline hover:text-sky-300">
                        Creator Rules, Seller Policy &amp; Revenue Terms
                      </a>.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3.5 flex items-start gap-2.5 text-red-400 text-sm font-medium">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Message Notification */}
            {message && (
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3.5 flex items-start gap-2.5 text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{message}</p>
              </div>
            )}

            {/* Step Controls / Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-800 bg-[#0F172A]/80 hover:bg-[#0F172A] text-slate-200 text-sm font-semibold transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={currentStep === 1 ? handleStep1Next : handleStep2Next}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-lg shadow-sky-950/50 hover:shadow-sky-900/50 transition-all ml-auto"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !agreeTerms}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold shadow-lg shadow-sky-950/50 hover:shadow-sky-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all ml-auto active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Launching Shop...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {existingSlug ? "Update Creator Shop" : "Launch Creator Shop"}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}


