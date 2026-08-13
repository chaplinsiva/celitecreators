"use client";

import { useState } from "react";
import { X, Copy, Check, Share2, QrCode, MessageCircle, Twitter, Linkedin, Facebook, Download } from "lucide-react";

interface ShareStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  shopSlug: string;
  shopTagline?: string | null;
}

export default function ShareStoreModal({
  isOpen,
  onClose,
  shopName,
  shopSlug,
  shopTagline,
}: ShareStoreModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  if (!isOpen) return null;

  const storeUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${shopSlug}`
    : `https://celitemarket.in/${shopSlug}`;

  const shareTitle = `${shopName} | Celite Creator Studio`;
  const shareText = shopTagline || `Check out ${shopName}'s digital assets storefront on Celite Market!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = storeUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: storeUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      copyToClipboard();
    }
  };

  const encodedUrl = encodeURIComponent(storeUrl);
  const encodedText = encodeURIComponent(`${shareText}\n\n`);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}&format=png&color=0284c7&bg=090d16`;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#090D16] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Share Studio Store</h3>
              <p className="text-xs text-slate-400 font-medium">Send your portfolio link to clients &amp; followers</p>
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

        {/* Link Copy Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Direct Store Link
          </label>
          <div className="flex items-center gap-2 bg-[#0F172A] border border-slate-800 rounded-2xl p-2 pl-4">
            <input
              type="text"
              readOnly
              value={storeUrl}
              className="bg-transparent text-sm text-sky-300 w-full focus:outline-none font-mono selection:bg-sky-500 selection:text-white truncate"
            />
            <button
              type="button"
              onClick={copyToClipboard}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                copied
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 active:scale-95"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Share to Social Channels
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 transition-all text-xs font-semibold group"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>WhatsApp</span>
            </a>

            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/10 text-slate-300 hover:text-sky-400 transition-all text-xs font-semibold group"
            >
              <Twitter className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span>X (Twitter)</span>
            </a>

            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-300 hover:text-blue-400 transition-all text-xs font-semibold group"
            >
              <Linkedin className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>LinkedIn</span>
            </a>

            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-300 hover:text-indigo-400 transition-all text-xs font-semibold group"
            >
              <Facebook className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Facebook</span>
            </a>
          </div>
        </div>

        {/* QR Code Section Toggle */}
        <div className="pt-2 border-t border-slate-800/80">
          {!showQrCode ? (
            <button
              type="button"
              onClick={() => setShowQrCode(true)}
              className="w-full py-3 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-sky-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <QrCode className="w-4 h-4 text-sky-400" />
              <span>Show Studio QR Code for Mobile Scanning</span>
            </button>
          ) : (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 text-center space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" />
                  <span>Studio QR Code</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowQrCode(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Hide
                </button>
              </div>

              <div className="flex justify-center p-3 bg-white rounded-xl shadow-inner w-fit mx-auto border-4 border-sky-500/20">
                <img
                  src={qrCodeUrl}
                  alt={`${shopName} Store QR Code`}
                  className="w-44 h-44 object-contain rounded-lg"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Scan with any mobile camera to immediately open {shopName}&apos;s studio storefront.
              </p>

              <a
                href={qrCodeUrl}
                download={`${shopSlug}-qr-code.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download High-Res QR Image</span>
              </a>
            </div>
          )}
        </div>

        {/* Native Web Share Button if supported */}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via Phone / Device Apps</span>
          </button>
        )}
      </div>
    </div>
  );
}
