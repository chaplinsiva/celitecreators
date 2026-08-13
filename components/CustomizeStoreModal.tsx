"use client";

import { useState, useRef } from "react";
import { X, Upload, Image, Sparkles, Check, Globe, Instagram, Youtube, Twitter, MapPin, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

import type { ShopData } from "@/app/[shopSlug]/CreatorShopClient";

interface CustomizeStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: ShopData;
  onUpdated: (updatedShop: ShopData) => void;
}

const PRESET_BANNERS = [
  {
    name: "Dark Metallic Glass",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Neon Mesh Gradient",
    url: "https://images.unsplash.com/photo-1550684848-bac1c5b4e853?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Audio Workstation Console",
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Cinematic Camera Flare",
    url: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "3D Animation Studio",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80",
  },
];

export default function CustomizeStoreModal({
  isOpen,
  onClose,
  shop,
  onUpdated,
}: CustomizeStoreModalProps) {
  const [activeTab, setActiveTab] = useState<"branding" | "details" | "socials">("branding");

  const [name, setName] = useState(shop.name || "");
  const [tagline, setTagline] = useState(shop.tagline || "");
  const [description, setDescription] = useState(shop.description || "");
  const [location, setLocation] = useState(shop.location || "");

  const [bannerUrl, setBannerUrl] = useState(shop.banner_url || "");
  const [logoUrl, setLogoUrl] = useState(shop.logo_url || "");

  const [websiteUrl, setWebsiteUrl] = useState(shop.website_url || "");
  const [instagramUrl, setInstagramUrl] = useState(shop.instagram_url || "");
  const [youtubeUrl, setYoutubeUrl] = useState(shop.youtube_url || "");
  const [twitterUrl, setTwitterUrl] = useState(shop.twitter_url || "");

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File, type: "banner" | "logo") => {
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

      setSuccessMsg(`${type === "banner" ? "Banner" : "Logo"} uploaded to R2 CDN!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      console.error(`Upload ${type} error:`, e);
      setError(e?.message || `Failed to upload ${type}`);
    } finally {
      if (type === "banner") setUploadingBanner(false);
      else setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error("Missing auth session token. Please log in again.");
      }

      const res = await fetch("/api/creator/shop/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          tagline,
          description,
          location,
          banner_url: bannerUrl,
          logo_url: logoUrl,
          website_url: websiteUrl,
          instagram_url: instagramUrl,
          youtube_url: youtubeUrl,
          twitter_url: twitterUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to update storefront details");
      }

      onUpdated({ ...shop, ...data.shop });
      setSuccessMsg("Storefront updated successfully!");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } catch (e: any) {
      console.error("Save store error:", e);
      setError(e?.message || "Failed to save storefront updates");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#090D16] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Customize Studio Store</h3>
              <p className="text-xs text-slate-400 font-medium">Personalize your shop banner, logo &amp; social profiles</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-[#0F172A] rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("branding")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "branding"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Banner &amp; Logo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "details"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("socials")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "socials"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Social Handles</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: BRANDING */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              {/* Studio Banner Customization */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Studio Store Banner
                </label>

                {/* Banner Preview Box */}
                <div className="relative aspect-[3/1] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group">
                  {bannerUrl ? (
                    <img
                      src={bannerUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-sky-950 via-slate-900 to-purple-950 flex items-center justify-center text-slate-400 text-xs font-medium">
                      No Custom Banner Selected (Default Studio Theme Active)
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => bannerFileInputRef.current?.click()}
                      disabled={uploadingBanner}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-sky-400"
                    >
                      {uploadingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Upload Banner</span>
                    </button>
                  </div>
                </div>

                {/* Preset Banner Selector */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Choose from Preset Unsplash Studio Banners:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {PRESET_BANNERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBannerUrl(preset.url)}
                        className={`relative aspect-video rounded-xl overflow-hidden border transition-all ${
                          bannerUrl === preset.url
                            ? "border-sky-500 ring-2 ring-sky-500/40"
                            : "border-slate-800 hover:border-slate-600 opacity-75 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                        {bannerUrl === preset.url && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Banner Upload & URL Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Paste custom Banner Image URL..."
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />

                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0], "banner");
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {uploadingBanner ? (
                      <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    ) : (
                      <Upload className="w-4 h-4 text-sky-400" />
                    )}
                    <span>Upload File</span>
                  </button>
                </div>
              </div>

              {/* Studio Logo Customization */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Studio Logo / Avatar
                </label>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-sky-500/50 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-black text-sky-400">
                        {name ? name.charAt(0).toUpperCase() : "S"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Paste custom Studio Logo URL..."
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                      />

                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], "logo");
                          }
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        {uploadingLogo ? (
                          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                        ) : (
                          <Upload className="w-4 h-4 text-sky-400" />
                        )}
                        <span>Upload Logo</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Upload transparent PNG or WEBP for best studio look on CDN.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Studio Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. DT Studios"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Headline / Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Senior After Effects VFX Specialist &amp; 3D Motion Designer"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Studio Bio / About Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell clients about your studio experience, software stack, and asset specialities..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>Studio Location</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai, India"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: SOCIALS */}
          {activeTab === "socials" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Personal / Studio Website</span>
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourstudio.com"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram Profile / Handle</span>
                </label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/yourhandle or @yourhandle"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>YouTube Channel</span>
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@yourchannel"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  <span>X / Twitter Handle</span>
                </label>
                <input
                  type="text"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/yourhandle or @yourhandle"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2 disabled:opacity-60 active:scale-95"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Store Details...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Storefront Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
