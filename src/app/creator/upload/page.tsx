/* agent-notes: { ctx: "5-Step Asset Upload Wizard component with R2 presigned upload", deps: [src/lib/r2.ts, src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState } from 'react';
import { Upload, CheckCircle2, FileArchive, Video, Image as ImageIcon, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AssetUploadWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    category: 'video-templates',
    price: '399',
    thumbnailUrl: '',
    previewVideoUrl: '',
    audioPreviewUrl: '',
    sourceFileName: '',
    softwareTags: ['After Effects CC', 'Premiere Pro'],
  });

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate R2 presigned upload confirmation and Supabase record creation
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header & Stepper Progress */}
      <div className="text-center mb-10">
        <span className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Creator Portal
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-4 text-white">
          Upload New Digital Asset
        </h1>
      </div>

      {/* Stepper Bar */}
      <div className="flex items-center justify-between mb-10 px-2 sm:px-6">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition ${
                currentStep === step
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 border border-sky-400'
                  : currentStep > step
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {currentStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
            </div>
            {step < 5 && (
              <div
                className={`h-1 w-8 sm:w-16 mx-1 sm:mx-2 rounded ${
                  currentStep > step ? 'bg-emerald-500/40' : 'bg-slate-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {submitted ? (
        <div className="glass-panel-glow p-10 text-center rounded-2xl border border-emerald-500/30">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white">Asset Submitted for Review!</h2>
          <p className="text-slate-300 mt-2 max-w-md mx-auto text-sm">
            Your asset <span className="text-sky-400 font-semibold">{formData.title}</span> has been uploaded to Cloudflare R2 and is pending Admin moderation approval.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/creator/dashboard"
              className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-sky-600/25"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 sm:p-10 rounded-2xl">
          {/* Step 1: Basic Metadata */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
                Step 1: Basic Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Asset Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Cyberpunk HUD 4K Opener"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
                >
                  <option value="video-templates">Video Templates (After Effects, Premiere)</option>
                  <option value="3d-models">3D Models & Assets (Blender, C4D)</option>
                  <option value="audio-sfx">Audio & SFX Packs</option>
                  <option value="graphics-ui">Graphics & Figma UI Kits</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Clean 4K motion graphics template with customizable sound FX"
                  value={formData.subtitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
                Step 2: Pricing & License (INR ₹)
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Price in INR (₹) *</label>
                <div className="flex items-center rounded-xl overflow-hidden border border-slate-800 bg-slate-900/90">
                  <span className="px-4 py-3 text-lg font-bold text-sky-400 bg-slate-950 border-r border-slate-800">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-transparent px-4 py-3 text-white text-lg font-bold focus:outline-none"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  You earn 80% (₹{Math.round(Number(formData.price || 0) * 0.8)}) per single purchase.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Media Previews */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
                Step 3: Media Previews
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Thumbnail Image URL (WebP/JPG)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Video Preview MP4 URL (1080p, H.264)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.previewVideoUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, previewVideoUrl: e.target.value }))}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>
          )}

          {/* Step 4: Direct R2 Source Zip Upload */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Step 4: Source File Upload (.zip)</span>
                <span className="text-xs text-sky-400 font-semibold bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-lg">
                  Direct Cloudflare R2 Upload
                </span>
              </h2>
              <div className="border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-2xl p-8 text-center bg-slate-900/50 transition cursor-pointer">
                <FileArchive className="w-12 h-12 text-sky-400 mx-auto mb-3" />
                <p className="text-white font-semibold">Drag & drop your source `.zip` package here</p>
                <p className="text-xs text-slate-400 mt-1">Includes template project file, fonts, and instructions (Max 2GB)</p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition"
                >
                  Browse Source File
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
                Step 5: Review & Submit
              </h2>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-sm">
                <p className="text-slate-300">
                  <span className="text-slate-500 font-medium">Title:</span> {formData.title || 'Untitled Asset'}
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500 font-medium">Category:</span> {formData.category}
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500 font-medium">Price:</span> ₹{formData.price}
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-500 font-medium">Status:</span> Pending Moderation
                </p>
              </div>
            </div>
          )}

          {/* Stepper Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-30 font-semibold text-sm transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition shadow-lg shadow-sky-600/25 flex items-center gap-2"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/25 flex items-center gap-2"
              >
                {loading ? 'Submitting to R2...' : 'Submit Asset for Review'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
