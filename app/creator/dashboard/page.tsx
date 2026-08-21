"use client";

/* agent-notes: { "last": "sato@2026-08-21", "ctx": "Add missing contact info red action bar, WhatsApp community buttons, and phone/email settings", "deps": ["lib/creatorValidation.ts"], "state": "active" } */

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppContext } from "../../../context/AppContext";
import { getSupabaseBrowserClient } from "../../../lib/supabaseClient";
import { convertR2UrlToCdn } from "../../../lib/utils";
import {
  isCreatorContactMissing,
  CREATOR_COMMUNITY_WHATSAPP_URL,
} from "../../../lib/creatorValidation";

type CreatorShop = {
  id?: string;
  user_id?: string;
  slug: string;
  name: string;
  description: string | null;
  bio?: string | null;
  phone?: string | null;
  email?: string | null;
  joined_community?: boolean | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_upi_id: string | null;
  direct_upload_enabled?: boolean;
  banner_url?: string | null;
  logo_url?: string | null;
  profile_image_url?: string | null;
  tagline?: string | null;
  location?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  twitter_url?: string | null;
};

type CreatorTemplateRow = {
  slug: string;
  name: string;
  subtitle: string | null;
  video: string | null;
  img?: string | null;
  created_at: string | null;
  downloadCount: number;
  status?: string | null;
  price?: number | null;
  available_on_celite_market?: boolean;
  available_on_celite_subscription?: boolean;
  subscription_submission_status?: string | null;
  description?: string | null;
  video_path?: string | null;
  thumbnail_path?: string | null;
  audio_preview_path?: string | null;
  model_3d_path?: string | null;
  source_path?: string | null;
  features?: string[] | null;
  software?: string[] | null;
  plugins?: string[] | null;
  tags?: string[] | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  sub_subcategory_id?: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
};

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAppContext();

  const [shop, setShop] = useState<CreatorShop | null>(null);
  const [templates, setTemplates] = useState<CreatorTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [totalDownloads, setTotalDownloads] = useState<number>(0);
  const [uniqueUserPeriods, setUniqueUserPeriods] = useState<number>(0);
  const [subscriptionPoolRevenue, setSubscriptionPoolRevenue] = useState<number>(0);
  const [marketplaceSalesRevenue, setMarketplaceSalesRevenue] = useState<number>(0);
  const [marketplaceSalesCount, setMarketplaceSalesCount] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0); // Available balance
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [paidOutAmount, setPaidOutAmount] = useState<number>(0);
  const [pendingPayoutAmount, setPendingPayoutAmount] = useState<number>(0);

  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    subtitle: "",
    price: "399",
    request_subscription: false,
    video: "",
    video_path: "",
    thumbnail_path: "",
    audio_preview_path: "",
    model_3d_path: "",
    source_path: "",
    description: "",
    category_id: "",
    subcategory_id: "",
    sub_subcategory_id: "",
    features: "",
    software: "",
    plugins: "",
    tags: "",
  });
  const sourceInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const audioPreviewInputRef = useRef<HTMLInputElement | null>(null);
  const model3DInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingSource, setUploadingSource] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingAudioPreview, setUploadingAudioPreview] = useState(false);
  const [uploadingModel3D, setUploadingModel3D] = useState(false);

  // Autofill with AI state
  const [autofillOpen, setAutofillOpen] = useState(false);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [autofillTemplateType, setAutofillTemplateType] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{
    source: number;
    video: number;
    thumbnail: number;
    audio_preview: number;
    model_3d: number;
  }>({
    source: 0,
    video: 0,
    thumbnail: 0,
    audio_preview: 0,
    model_3d: 0,
  });
  const [uploadSpeed, setUploadSpeed] = useState<{
    source: string;
    video: string;
    thumbnail: string;
    audio_preview: string;
    model_3d: string;
  }>({
    source: '',
    video: '',
    thumbnail: '',
    audio_preview: '',
    model_3d: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    Subcategory[]
  >([]);
  const [subSubcategories, setSubSubcategories] = useState<Array<{ id: string; subcategory_id: string; name: string; slug: string }>>([]);
  const [filteredSubSubcategories, setFilteredSubSubcategories] = useState<Array<{ id: string; subcategory_id: string; name: string; slug: string }>>([]);

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      subtitle: "",
      price: "399",
      request_subscription: false,
      video: "",
      video_path: "",
      thumbnail_path: "",
      audio_preview_path: "",
      model_3d_path: "",
      source_path: "",
      description: "",
      category_id: "",
      subcategory_id: "",
      sub_subcategory_id: "",
      features: "",
      software: "",
      plugins: "",
      tags: "",
    });
    setSlugManuallyEdited(false);
    setIsEditing(false);
    setEditingSlug(null);
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
    if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  // Chunk size: 5MB (S3/R2 multipart minimum is 5MB except for last part)
  // NOTE: Requires Vercel Pro plan (50MB body limit). Hobby plan (4.5MB) is too small.
  const CHUNK_SIZE = 5 * 1024 * 1024;
  // Threshold for chunked upload: 4MB (files larger than this use chunked upload)
  const CHUNKED_UPLOAD_THRESHOLD = 4 * 1024 * 1024;
  // Maximum file size: 1GB
  const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024;

  // Safe JSON parse helper
  const safeJsonParse = async (response: Response): Promise<any> => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      // If not JSON, return error object with the text
      return { ok: false, error: text || `HTTP ${response.status}` };
    }
  };

  // Direct browser-to-R2 upload using presigned URLs (bypasses Vercel entirely)
  const uploadFileChunked = async (
    kind: 'source' | 'video' | 'thumbnail' | 'audio_preview' | 'model_3d',
    file: File,
    accessToken: string
  ): Promise<{ url: string; key: string }> => {
    // Step 1: Initialize chunked upload and get presigned URLs
    const initRes = await fetch('/api/creator/chunked-upload/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        kind,
        category_id: form.category_id,
        subcategory_id: form.subcategory_id || null,
        sub_subcategory_id: form.sub_subcategory_id || null,
        slug: form.slug || null,
        template_name: form.name,
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        fileSize: file.size,
      }),
    });

    const initData = await safeJsonParse(initRes);
    if (!initRes.ok || !initData.ok) {
      throw new Error(initData.error || 'Failed to initialize upload');
    }

    const { uploadId, key, bucket, totalChunks, presignedUrls, publicUrl, chunkSize } = initData;
    const parts: { partNumber: number; eTag: string }[] = [];
    let uploadedBytes = 0;
    const startTime = Date.now();

    // Use the chunk size from server (5MB for S3 minimum)
    const serverChunkSize = chunkSize || CHUNK_SIZE;

    try {
      // Step 2: Upload each chunk directly to R2 using presigned URLs
      for (let i = 0; i < presignedUrls.length; i++) {
        const { partNumber, presignedUrl } = presignedUrls[i];
        const start = (partNumber - 1) * serverChunkSize;
        const end = Math.min(start + serverChunkSize, file.size);
        const chunk = file.slice(start, end);

        // Upload directly to R2 using presigned URL (bypasses Vercel!)
        const uploadRes = await fetch(presignedUrl, {
          method: 'PUT',
          body: chunk,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(`Failed to upload part ${partNumber}: ${errorText || uploadRes.status}`);
        }

        // Get ETag from response headers (required for completing multipart upload)
        const eTag = uploadRes.headers.get('ETag');
        if (!eTag) {
          throw new Error(`No ETag received for part ${partNumber}`);
        }

        parts.push({ partNumber, eTag: eTag.replace(/"/g, '') });
        uploadedBytes += (end - start);

        // Update progress
        const progress = Math.round((uploadedBytes / file.size) * 100);
        setUploadProgress((prev) => ({ ...prev, [kind]: progress }));

        // Calculate speed
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed > 0) {
          const speed = uploadedBytes / elapsed;
          setUploadSpeed((prev) => ({ ...prev, [kind]: formatSpeed(speed) }));
        }
      }

      // Step 3: Complete the upload (tell R2 to assemble all parts)
      const completeRes = await fetch('/api/creator/chunked-upload/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          uploadId,
          key,
          bucket,
          kind,
          parts,
        }),
      });

      const completeData = await safeJsonParse(completeRes);
      if (!completeRes.ok || !completeData.ok) {
        throw new Error(completeData.error || 'Failed to complete upload');
      }

      return { url: publicUrl || completeData.url, key: completeData.key };
    } catch (error) {
      // Abort the multipart upload on failure
      try {
        await fetch('/api/creator/chunked-upload/complete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ uploadId, key, bucket }),
        });
      } catch (abortError) {
        console.error('Failed to abort upload:', abortError);
      }
      throw error;
    }
  };

  const uploadFile = async (kind: 'source' | 'video' | 'thumbnail' | 'audio_preview' | 'model_3d', file: File) => {
    if (!form.category_id) {
      setError('Please select a category first');
      return;
    }

    // Check file size limit (1GB max)
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 1GB.');
      return;
    }

    // Compress thumbnail images before uploading
    let fileToUpload = file;
    if (kind === 'thumbnail' && file.type.startsWith('image/')) {
      try {
        // Show compression message
        setMessage('Compressing thumbnail image...');
        const { compressThumbnail } = await import('../../../lib/imageCompression');
        fileToUpload = await compressThumbnail(file);
        const originalSize = (file.size / 1024 / 1024).toFixed(2);
        const compressedSize = (fileToUpload.size / 1024 / 1024).toFixed(2);
        console.log(`Thumbnail compressed: ${originalSize}MB → ${compressedSize}MB`);
      } catch (compressionError) {
        console.warn('Image compression failed, uploading original:', compressionError);
        // Continue with original file if compression fails
      }
    }

    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Reset progress and set uploading state
    setUploadProgress((prev) => ({ ...prev, [kind]: 0 }));
    setUploadSpeed((prev) => ({ ...prev, [kind]: '' }));
    if (kind === 'source') setUploadingSource(true);
    else if (kind === 'video') setUploadingVideo(true);
    else if (kind === 'thumbnail') setUploadingThumbnail(true);
    else if (kind === 'audio_preview') setUploadingAudioPreview(true);
    else if (kind === 'model_3d') setUploadingModel3D(true);

    try {
      // Use chunked upload for large files (> 4MB)
      if (fileToUpload.size > CHUNKED_UPLOAD_THRESHOLD) {
        setMessage(`Uploading large file (${(fileToUpload.size / (1024 * 1024)).toFixed(1)}MB)...`);
        const result = await uploadFileChunked(kind, fileToUpload, session.access_token);

        if (kind === 'source') {
          setForm((f) => ({ ...f, source_path: result.key }));
        } else if (kind === 'video') {
          setForm((f) => ({ ...f, video_path: result.url }));
        } else if (kind === 'thumbnail') {
          setForm((f) => ({ ...f, thumbnail_path: result.url }));
        } else if (kind === 'audio_preview') {
          setForm((f) => ({ ...f, audio_preview_path: result.url }));
        } else if (kind === 'model_3d') {
          setForm((f) => ({ ...f, model_3d_path: result.url }));
        }
        setMessage('File uploaded successfully');
        setUploadProgress((prev) => ({ ...prev, [kind]: 100 }));
        setUploadSpeed((prev) => ({ ...prev, [kind]: '' }));
        return;
      }

      // Regular upload for small files (< 4MB)
      const fd = new FormData();
      fd.append('file', fileToUpload);
      fd.append('kind', kind);
      fd.append('category_id', form.category_id);
      if (form.subcategory_id) fd.append('subcategory_id', form.subcategory_id);
      if (form.sub_subcategory_id) fd.append('sub_subcategory_id', form.sub_subcategory_id);
      if (form.slug) fd.append('slug', form.slug);
      if (form.name) fd.append('template_name', form.name);

      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let lastLoaded = 0;
        let lastTime = Date.now();

        // Track upload progress with speed calculation
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress((prev) => ({ ...prev, [kind]: percentComplete }));

            // Calculate speed
            const now = Date.now();
            const timeDelta = (now - lastTime) / 1000;
            if (timeDelta > 0.5) {
              const bytesDelta = e.loaded - lastLoaded;
              const speed = bytesDelta / timeDelta;
              setUploadSpeed((prev) => ({ ...prev, [kind]: formatSpeed(speed) }));
              lastLoaded = e.loaded;
              lastTime = now;
            }
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              if (json.ok && json.url) {
                if (kind === 'source') {
                  setForm((f) => ({ ...f, source_path: json.key }));
                } else if (kind === 'video') {
                  setForm((f) => ({ ...f, video_path: json.url }));
                } else if (kind === 'thumbnail') {
                  setForm((f) => ({ ...f, thumbnail_path: json.url }));
                } else if (kind === 'audio_preview') {
                  setForm((f) => ({ ...f, audio_preview_path: json.url }));
                } else if (kind === 'model_3d') {
                  setForm((f) => ({ ...f, model_3d_path: json.url }));
                }
                setMessage('File uploaded successfully');
                setUploadProgress((prev) => ({ ...prev, [kind]: 100 }));
                setUploadSpeed((prev) => ({ ...prev, [kind]: '' }));
                resolve();
              } else {
                setError(json.error || 'Upload failed');
                reject(new Error(json.error || 'Upload failed'));
              }
            } catch (e) {
              setError('Failed to parse response');
              reject(e);
            }
          } else if (xhr.status === 413) {
            setError('File too large for single upload. Please try again.');
            reject(new Error('File too large'));
          } else {
            try {
              const json = JSON.parse(xhr.responseText);
              setError(json.error || 'Upload failed');
            } catch {
              setError('Upload failed');
            }
            reject(new Error('Upload failed'));
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          setError('Upload failed - network error');
          reject(new Error('Upload failed'));
        });

        xhr.addEventListener('abort', () => {
          setError('Upload cancelled');
          reject(new Error('Upload cancelled'));
        });

        // Open and send request
        xhr.open('POST', '/api/creator/upload-r2');
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
        xhr.send(fd);
      });
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      // Reset uploading state after a short delay to show 100% completion
      setTimeout(() => {
        if (kind === 'source') setUploadingSource(false);
        else if (kind === 'video') setUploadingVideo(false);
        else if (kind === 'thumbnail') setUploadingThumbnail(false);
        else if (kind === 'audio_preview') setUploadingAudioPreview(false);
        else if (kind === 'model_3d') setUploadingModel3D(false);
        setUploadProgress((prev) => ({ ...prev, [kind]: 0 }));
        setUploadSpeed((prev) => ({ ...prev, [kind]: '' }));
      }, 1000);
    }
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Autofill handler - uses Gemini to generate template metadata
  const handleAutofill = async () => {
    if (!autofillTemplateType.trim()) {
      setError("Please enter what kind of template this is");
      return;
    }

    setAutofillLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Session expired. Please log in again.");
        return;
      }

      const res = await fetch("/api/creator/autofill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ templateType: autofillTemplateType.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Failed to generate content");
        return;
      }

      const result = json.result;

      // Apply generated content to form (but NOT file paths)
      setForm((f) => ({
        ...f,
        name: result.name || f.name,
        slug: result.name && !slugManuallyEdited ? generateSlug(result.name) : f.slug,
        subtitle: result.subtitle || f.subtitle,
        description: result.description || f.description,
        tags: Array.isArray(result.tags) ? result.tags.join(", ") : f.tags,
        features: Array.isArray(result.features) ? result.features.join(", ") : f.features,
        software: Array.isArray(result.software) ? result.software.join(", ") : f.software,
        plugins: Array.isArray(result.plugins) ? result.plugins.join(", ") : f.plugins,
      }));

      setMessage("Content generated successfully!");
      setAutofillOpen(false);
      setAutofillTemplateType("");
    } catch (e: any) {
      console.error("Autofill error:", e);
      setError(e?.message || "Failed to generate content");
    } finally {
      setAutofillLoading(false);
    }
  };

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?redirect=/creator/dashboard");
        return;
      }

      // Fetch API and categories in parallel for faster loading
      const [apiResponse, catsResult, subsResult, subSubsResult] = await Promise.all([
        fetch("/api/creator/templates", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }),
        supabase.from("categories").select("id,name,slug").order("name"),
        supabase.from("subcategories").select("id,category_id,name,slug").order("name"),
        supabase.from("sub_subcategories").select("id,subcategory_id,name,slug").order("name"),
      ]);

      const json = await apiResponse.json();

      if (!apiResponse.ok || !json.ok) {
        setError(json.error || "Failed to load creator data.");
        setLoading(false);
        return;
      }

      setShop(json.shop);
      setTemplates(json.templates || []);
      setTransactions(json.transactions || []);
      setDownloadLogs(json.downloadLogs || []);
      setPayoutLogs(json.payoutRequests || []);
      if (json.stats) {
        setTotalDownloads(json.stats.totalDownloads ?? 0);
        setUniqueUserPeriods(json.stats.uniqueUserPeriods ?? 0);
        setSubscriptionPoolRevenue(json.stats.subscriptionPoolRevenue ?? 0);
        setMarketplaceSalesRevenue(json.stats.marketplaceSalesRevenue ?? 0);
        setMarketplaceSalesCount(json.stats.marketplaceSalesCount ?? 0);
        setTotalEarnings(json.stats.totalEarnings ?? json.stats.revenue ?? 0);
        setPaidOutAmount(json.stats.paidOutAmount ?? 0);
        setPendingPayoutAmount(json.stats.pendingPayoutAmount ?? 0);
        setRevenue(json.stats.revenue ?? 0);
      } else {
        const fallbackDownloads = (json.templates || []).reduce(
          (sum: number, t: any) => sum + (t.downloadCount || 0),
          0
        );
        setTotalDownloads(fallbackDownloads);
        setUniqueUserPeriods(0);
        setSubscriptionPoolRevenue(0);
        setMarketplaceSalesRevenue(0);
        setMarketplaceSalesCount(0);
        setTotalEarnings(0);
        setPaidOutAmount(0);
        setPendingPayoutAmount(0);
        setRevenue(0);
      }

      if (!json.shop) {
        // No shop yet – send to onboarding
        router.replace("/start-selling");
        return;
      }

      // Set categories data (already fetched in parallel)
      setCategories((catsResult.data as any) || []);
      setSubcategories((subsResult.data as any) || []);
      setFilteredSubcategories((subsResult.data as any) || []);
      setSubSubcategories((subSubsResult.data as any) || []);
      setFilteredSubSubcategories((subSubsResult.data as any) || []);
    } catch (e: any) {
      console.error("Failed to load creator dashboard:", e);
      setError(e?.message || "Failed to load creator dashboard.");
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  // Keep filtered subcategories in sync with selected category
  useEffect(() => {
    if (form.category_id) {
      const filtered = subcategories.filter(
        (s) => s.category_id === form.category_id
      );
      setFilteredSubcategories(filtered);
      if (
        form.subcategory_id &&
        !filtered.find((s) => s.id === form.subcategory_id)
      ) {
        setForm((f) => ({ ...f, subcategory_id: "", sub_subcategory_id: "" }));
      }
    } else {
      setFilteredSubcategories(subcategories);
      setForm((f) => ({ ...f, subcategory_id: "", sub_subcategory_id: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.category_id, subcategories]);

  // Keep filtered sub-subcategories in sync with selected subcategory
  useEffect(() => {
    if (form.subcategory_id) {
      const filtered = subSubcategories.filter(
        (s) => s.subcategory_id === form.subcategory_id
      );
      setFilteredSubSubcategories(filtered);
      if (
        form.sub_subcategory_id &&
        !filtered.find((s) => s.id === form.sub_subcategory_id)
      ) {
        setForm((f) => ({ ...f, sub_subcategory_id: "" }));
      }
    } else {
      setFilteredSubSubcategories([]);
      setForm((f) => ({ ...f, sub_subcategory_id: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.subcategory_id, subSubcategories]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.replace("/login?return=/creator/dashboard");
      return;
    }
    loadData();
  }, [user, isAuthLoading, loadData, router]);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?redirect=/creator/dashboard");
        return;
      }

      const slug = (form.slug || generateSlug(form.name)).trim().toLowerCase();
      if (!slug) {
        setError("Please enter a name to generate a slug.");
        setSaving(false);
        return;
      }

      const payload = {
        slug,
        original_slug: isEditing ? editingSlug : undefined,
        name: form.name,
        subtitle: form.subtitle,
        description: form.description,
        video_path: form.video_path,
        thumbnail_path: form.thumbnail_path,
        audio_preview_path: form.audio_preview_path,
        model_3d_path: form.model_3d_path,
        source_path: form.source_path,
        features: form.features
          ? form.features
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
          : [],
        software: form.software
          ? form.software
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
          : [],
        plugins: form.plugins
          ? form.plugins
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
          : [],
        tags: form.tags
          ? form.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
          : [],
        category_id: form.category_id || null,
        subcategory_id: form.subcategory_id || null,
        sub_subcategory_id: form.sub_subcategory_id || null,
        price: form.price ? Number(form.price) : 399,
      };

      const url = isEditing ? "/api/creator/templates/update" : "/api/creator/templates";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(isEditing ? payload : { template: payload }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Failed to save template.");
        setSaving(false);
        return;
      }

      setMessage(isEditing ? "✓ Template updated successfully!" : "✓ Template published successfully!");
      resetForm();
      setIsEditing(false);
      setEditingSlug(null);
      setFormOpen(false);
      setActive("templates");
      await loadData();
    } catch (e: any) {
      console.error("Failed to save template:", e);
      setError(e?.message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (tpl: CreatorTemplateRow) => {
    setError(null);
    setMessage(null);
    setForm({
      name: tpl.name || "",
      slug: tpl.slug || "",
      subtitle: tpl.subtitle || "",
      price: (tpl.price || 399).toString(),
      request_subscription: false,
      video: "",
      video_path: tpl.video_path || "",
      thumbnail_path: tpl.thumbnail_path || "",
      audio_preview_path: tpl.audio_preview_path || "",
      model_3d_path: tpl.model_3d_path || "",
      source_path: tpl.source_path || "",
      description: tpl.description || "",
      category_id: tpl.category_id || "",
      subcategory_id: tpl.subcategory_id || "",
      sub_subcategory_id: tpl.sub_subcategory_id || "",
      features: tpl.features ? (Array.isArray(tpl.features) ? tpl.features.join(", ") : tpl.features) : "",
      software: tpl.software ? (Array.isArray(tpl.software) ? tpl.software.join(", ") : tpl.software) : "",
      plugins: tpl.plugins ? (Array.isArray(tpl.plugins) ? tpl.plugins.join(", ") : tpl.plugins) : "",
      tags: tpl.tags ? (Array.isArray(tpl.tags) ? tpl.tags.join(", ") : tpl.tags) : "",
    });
    setIsEditing(true);
    setEditingSlug(tpl.slug);
    setFormOpen(true);
    setActive("upload");

    // Scroll to the top of the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteTemplate = async (slug: string) => {
    if (!confirm("Delete this template? This cannot be undone.")) return;
    setError(null);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?redirect=/creator/dashboard");
        return;
      }

      const res = await fetch("/api/creator/templates", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ slug }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Failed to delete template.");
        return;
      }

      setMessage("Template deleted.");
      await loadData();
    } catch (e: any) {
      console.error("Failed to delete template:", e);
      setError(e?.message || "Failed to delete template.");
    }
  };

  const [payoutLoading, setPayoutLoading] = useState(false);
  const handleRequestPayout = async () => {
    setError(null);
    setMessage(null);
    setPayoutLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?redirect=/creator/dashboard");
        return;
      }

      const res = await fetch("/api/creator/payout/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ amount: revenue }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Failed to submit payout request.");
        return;
      }

      setMessage("Payout request submitted successfully! Admin will process transfer to your bank/UPI.");
      await loadData();
    } catch (e: any) {
      console.error("Failed to request payout:", e);
      setError(e?.message || "Failed to submit payout request.");
    } finally {
      setPayoutLoading(false);
    }
  };

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_account_name: "",
    bank_account_number: "",
    bank_ifsc: "",
    bank_upi_id: "",
  });

  const [studioForm, setStudioForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    phone: "",
    email: "",
    location: "",
    website_url: "",
    instagram_url: "",
    youtube_url: "",
    twitter_url: "",
    logo_url: "",
    banner_url: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_ifsc: "",
    bank_upi_id: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Analytics & Transactions State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [downloadLogs, setDownloadLogs] = useState<any[]>([]);
  const [payoutLogs, setPayoutLogs] = useState<any[]>([]);
  const [analyticsSubTab, setAnalyticsSubTab] = useState<"transactions" | "downloads" | "performance" | "payouts">("transactions");
  const [analyticsSearch, setAnalyticsSearch] = useState("");

  useEffect(() => {
    if (shop) {
      setStudioForm({
        name: shop.name || "",
        slug: shop.slug || "",
        tagline: shop.tagline || "",
        description: shop.description || shop.bio || "",
        phone: shop.phone || "",
        email: shop.email || user?.email || "",
        location: shop.location || "",
        website_url: shop.website_url || "",
        instagram_url: shop.instagram_url || "",
        youtube_url: shop.youtube_url || "",
        twitter_url: shop.twitter_url || "",
        logo_url: shop.logo_url || shop.profile_image_url || "",
        banner_url: shop.banner_url || "",
        bank_account_name: shop.bank_account_name || "",
        bank_account_number: shop.bank_account_number || "",
        bank_ifsc: shop.bank_ifsc || "",
        bank_upi_id: shop.bank_upi_id || "",
      });
      setBankForm({
        bank_account_name: shop.bank_account_name || "",
        bank_account_number: shop.bank_account_number || "",
        bank_ifsc: shop.bank_ifsc || "",
        bank_upi_id: shop.bank_upi_id || "",
      });
    }
  }, [shop]);

  const handleUploadBranding = async (file: File, type: "logo" | "banner") => {
    if (!file) return;
    if (type === "logo") setUploadingLogo(true);
    if (type === "banner") setUploadingBanner(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);

      const res = await fetch("/api/creator/shop/upload-branding", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: fd,
      });

      const json = await res.json();
      if (res.ok && json.ok) {
        if (type === "logo") {
          setStudioForm((prev) => ({ ...prev, logo_url: json.url }));
        } else {
          setStudioForm((prev) => ({ ...prev, banner_url: json.url }));
        }
        setMessage(`✓ ${type === "logo" ? "Logo" : "Banner"} uploaded! Click "Save Studio & Payout Settings" to apply.`);
      } else {
        setError(json.error || `Failed to upload ${type}`);
      }
    } catch (e: any) {
      setError(e?.message || `Failed to upload ${type}`);
    } finally {
      if (type === "logo") setUploadingLogo(false);
      if (type === "banner") setUploadingBanner(false);
    }
  };

  const handleSaveStudioSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !shop) return;
    setSavingSettings(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?redirect=/creator/dashboard");
        return;
      }

      const res = await fetch("/api/creator/shop/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(studioForm),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to update studio & payout details");
      }

      setShop(json.shop);
      setMessage("✓ Studio profile, branding & payout details saved successfully!");
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to update studio details");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenBankModal = () => {
    if (shop) {
      setBankForm({
        bank_account_name: shop.bank_account_name || "",
        bank_account_number: shop.bank_account_number || "",
        bank_ifsc: shop.bank_ifsc || "",
        bank_upi_id: shop.bank_upi_id || "",
      });
    }
    setBankModalOpen(true);
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingBank(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: err } = await supabase
        .from("creator_shops")
        .update({
          bank_account_name: bankForm.bank_account_name.trim(),
          bank_account_number: bankForm.bank_account_number.trim(),
          bank_ifsc: bankForm.bank_ifsc.trim(),
          bank_upi_id: bankForm.bank_upi_id.trim(),
        })
        .eq("user_id", user.id);

      if (err) throw err;
      setMessage("Bank & payout details updated successfully!");
      setBankModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to update bank details.");
    } finally {
      setSavingBank(false);
    }
  };

  const [active, setActive] = useState<
    "overview" | "analytics" | "templates" | "upload" | "payouts" | "settings"
  >("overview");

  if (isAuthLoading || (loading && !shop)) {
    return (
      <main className="bg-[#0B0F17] min-h-screen text-white flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-md w-full bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 shadow-2xl text-center relative z-10 space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">
            Loading Creator Dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusLabel = (status?: string | null) => {
    if (!status || status === "approved") return "Approved";
    if (status === "pending") return "Pending review";
    if (status === "rejected") return "Rejected";
    return status;
  };

  return (
    <main className="bg-[#0B0F17] min-h-screen text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Creator Navbar */}
      <header className="h-16 border-b border-slate-800/90 flex items-center justify-between px-6 bg-[#0B0F17]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-3 focus:outline-none hover:opacity-95 transition-opacity shrink-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-700/80 overflow-hidden flex items-center justify-center shadow-lg shadow-sky-500/10 group-hover:border-sky-500/50 group-hover:scale-105 transition-all">
              <img
                src="/logo/logo.png"
                alt="Celite Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
              Celite<span className="text-sky-400">Market</span>
              <span className="text-[11px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2.5 py-0.5 rounded-lg hidden sm:inline-block">
                Creator Hub
              </span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={CREATOR_COMMUNITY_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-950/70 border border-emerald-800/80 hover:bg-emerald-900/80 text-emerald-400 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>💬</span>
            <span className="hidden sm:inline">Join Community</span>
          </a>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsEditing(false);
              setEditingSlug(null);
              setFormOpen(true);
              setActive("upload");
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="text-base leading-none font-black">+</span>
            <span>Upload Asset</span>
          </button>

          <Link
            href="/dashboard"
            className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 shadow-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[240px_1fr] relative z-10">
        {/* Sidebar */}
        <aside className="border-b md:border-b-0 md:border-r border-slate-800 bg-[#090D16]/90 backdrop-blur-xl px-4 py-6 space-y-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Creator Studio
          </div>
          <nav className="space-y-1 text-sm">
            <button
              type="button"
              onClick={() => setActive("overview")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2.5 ${active === "overview"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-950/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                }`}
            >
              <span>📊</span>
              <span>Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setActive("analytics")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2.5 ${active === "analytics"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-950/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                }`}
            >
              <span>📈</span>
              <span>Analytics &amp; Sales</span>
            </button>
            <button
              type="button"
              onClick={() => setActive("templates")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2.5 ${active === "templates"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-950/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                }`}
            >
              <span>📦</span>
              <span>My Templates ({templates.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActive("payouts")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2.5 ${active === "payouts"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-950/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                }`}
            >
              <span>💳</span>
              <span>Payouts &amp; Earnings</span>
            </button>
            <button
              type="button"
              onClick={() => setActive("settings")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2.5 ${active === "settings"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-950/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                }`}
            >
              <span>⚙️</span>
              <span>Studio Settings</span>
            </button>
          </nav>
        </aside>

        {/* Content area */}
        <div className="flex flex-col h-full overflow-hidden">
          <section className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
            {/* Action Required Red Bar for Missing Phone / Email */}
            {isCreatorContactMissing(shop) && (
              <div className="relative rounded-2xl bg-gradient-to-r from-red-950 via-rose-950/90 to-red-950 border-2 border-red-600/80 p-4 sm:p-5 shadow-2xl shadow-red-950/60 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                      <span className="text-xl">⚠️</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                          Action Required: Contact Details Missing
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white animate-pulse">
                          Action Needed
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-red-200/90 leading-relaxed max-w-3xl">
                        Please update your <strong>phone number</strong> and <strong>contact email</strong> in your Studio Settings to ensure you receive automated payout confirmations, sales receipts, and critical creator notifications.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-auto sm:ml-0">
                    <button
                      type="button"
                      onClick={() => {
                        setActive("settings");
                        setTimeout(() => {
                          const el = document.getElementById("creator-contact-settings-section");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 100);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs shadow-lg shadow-red-950/80 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>✏️</span>
                      <span>Update Contact Details</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Creator Community Join Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-800/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Join Celite Creator WhatsApp Community
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-400">
                      Official Group
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Connect with fellow video editors &amp; 3D artists, get marketplace guidance, and fast payout support.
                  </p>
                </div>
              </div>
              <a
                href={CREATOR_COMMUNITY_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 shrink-0 cursor-pointer"
              >
                <span>📲</span>
                <span>Join Community</span>
              </a>
            </div>

            {/* Top Studio Showcase Header Banner & Logo */}
            <section className="relative rounded-3xl border border-slate-800 bg-[#090D16] overflow-hidden shadow-2xl">
              {/* Studio Banner Background */}
              <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-gradient-to-r from-slate-900 via-[#0B0F17] to-slate-900">
                {shop?.banner_url ? (
                  <img
                    src={convertR2UrlToCdn(shop.banner_url) || shop.banner_url}
                    alt={`${shop.name} Banner`}
                    className="w-full h-full object-cover object-center brightness-90 transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/30 via-[#090D16] to-[#04060A] flex items-center justify-center">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]" />
                    <span className="text-xs text-slate-500 font-mono font-semibold">Custom Studio Banner</span>
                  </div>
                )}
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/40 to-transparent" />
                
                {/* Quick Edit Overlay Button */}
                <button
                  type="button"
                  onClick={() => setActive("settings")}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg hover:border-sky-500/50 cursor-pointer"
                >
                  <span>📷</span>
                  <span>Edit Branding</span>
                </button>
              </div>

              {/* Studio Info & Logo Bar */}
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16">
                  {/* Logo + Details */}
                  <div className="flex items-end gap-4 sm:gap-5">
                    {/* Studio Logo */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0F172A] border-2 border-slate-700/80 overflow-hidden shadow-2xl shrink-0 flex items-center justify-center relative group">
                      {(shop?.logo_url || shop?.profile_image_url) ? (
                        <img
                          src={convertR2UrlToCdn(shop.logo_url || shop.profile_image_url) || (shop.logo_url || shop.profile_image_url || "")}
                          alt={shop.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                          {shop?.name ? shop.name.charAt(0).toUpperCase() : "C"}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setActive("settings")}
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[11px] text-white font-bold cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    {/* Studio Identity Titles */}
                    <div className="mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          {shop?.name || "Your Creator Hub"}
                        </h1>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-800 text-emerald-400">
                          ✓ Verified Creator
                        </span>
                      </div>
                      {shop?.tagline && (
                        <p className="text-xs text-sky-400 font-medium mt-0.5">
                          {shop.tagline}
                        </p>
                      )}
                      {shop?.location && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>📍</span> {shop.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Public Storefront URL & Quick Links */}
                  {shop && (
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${shop.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-950/70 border border-sky-800/60 text-sky-400 px-4 py-2 text-xs font-bold font-mono hover:bg-sky-900/80 hover:text-sky-300 transition-all shadow-lg shadow-sky-950/30"
                        >
                          <span>celitemarket.in/{shop.slug}</span>
                          <span>&rarr;</span>
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => setActive("settings")}
                          className="font-semibold text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
                        >
                          🎨 Studio Branding
                        </button>
                        <span className="text-slate-700">•</span>
                        <button
                          type="button"
                          onClick={() => setActive("settings")}
                          className="font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          💳 Payout Settings
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Alerts */}
            {(error || message) && (
              <div className="space-y-2">
                {error && (
                  <div className="bg-red-950/80 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-2xl">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-sm px-4 py-3 rounded-2xl">
                    {message}
                  </div>
                )}
              </div>
            )}

            {/* Overview tab */}
            {active === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="lg:col-span-2 space-y-6">
                  <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                        Quick Stats
                      </h2>
                      <button
                        type="button"
                        onClick={() => setActive("analytics")}
                        className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        View Full Analytics &rarr;
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-4 shadow-md">
                        <p className="text-xs text-slate-400 mb-1 font-semibold">
                          Total Assets
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-white">
                          {templates.length}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-sky-800/60 bg-[#0F172A] p-4 shadow-md">
                        <p className="text-xs text-sky-400 mb-1 font-bold">
                          Marketplace Sales (80%)
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-sky-400">
                          ₹{Math.round(marketplaceSalesRevenue).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                          {marketplaceSalesCount} single product purchases
                        </p>
                      </div>

                      <div className="rounded-2xl border border-emerald-800/60 bg-[#0F172A] p-4 shadow-md">
                        <p className="text-xs text-emerald-400 mb-1 font-bold">
                          Withdrawable Balance
                        </p>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                          ₹{Math.round(revenue).toLocaleString('en-IN')}
                        </p>
                        {revenue >= 800 ? (
                          <p className="text-[10px] text-emerald-400 mt-1 font-bold">
                            ✓ Eligible for ₹800 payout
                          </p>
                        ) : (
                          <p className="text-[10px] text-amber-400 mt-1 font-semibold">
                            Minimum threshold: ₹800
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xs font-bold text-white uppercase tracking-widest">
                        Recent Uploads
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setFormOpen(true);
                          setActive("upload");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        + Upload Asset
                      </button>
                    </div>
                    {templates.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        No templates yet. Click &ldquo;+ Upload Asset&rdquo; to add your first template.
                      </p>
                    ) : (
                      <ul className="divide-y divide-slate-800 text-sm">
                        {templates.slice(0, 5).map((tpl) => {
                          const status = getStatusLabel(tpl.status);
                          const statusClass =
                            tpl.status === "pending"
                              ? "bg-amber-950/60 text-amber-300 border-amber-800/80"
                              : tpl.status === "rejected"
                                ? "bg-red-950/60 text-red-300 border-red-800/80"
                                : "bg-emerald-950/60 text-emerald-300 border-emerald-800/80";

                          return (
                            <li
                              key={tpl.slug}
                              className="py-3 flex items-center justify-between gap-3"
                            >
                              <div>
                                <Link
                                  href={`/product/${tpl.slug}`}
                                  className="font-bold text-white hover:text-sky-400 transition-colors"
                                >
                                  {tpl.name}
                                </Link>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {tpl.downloadCount}{" "}
                                  {tpl.downloadCount === 1
                                    ? "download"
                                    : "downloads"}{" "}
                                  · {status}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#0F172A] border border-slate-800 text-slate-400 font-mono">
                                  {tpl.slug}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusClass}`}
                                >
                                  {status}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                        Studio Identity &amp; Branding
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActive("settings")}
                        className="text-xs font-bold text-sky-400 hover:text-sky-300"
                      >
                        Edit ⚙️
                      </button>
                    </div>

                    {shop ? (
                      <div className="space-y-3 text-xs text-slate-300">
                        {/* Mini Banner Preview */}
                        <div className="relative h-20 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                          {shop.banner_url ? (
                            <img
                              src={convertR2UrlToCdn(shop.banner_url) || shop.banner_url}
                              alt="Banner"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-mono">
                              Default Studio Pattern
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#0F172A] border border-slate-700 overflow-hidden shrink-0 shadow-md">
                              {(shop.logo_url || shop.profile_image_url) ? (
                                <img
                                  src={convertR2UrlToCdn(shop.logo_url || shop.profile_image_url) || ""}
                                  alt="Logo"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold">
                                  {shop.name ? shop.name.charAt(0).toUpperCase() : "C"}
                                </div>
                              )}
                            </div>
                            <span className="text-white font-bold text-xs drop-shadow-md">
                              {shop.name}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <p className="flex justify-between border-b border-slate-900 pb-1">
                            <span className="font-semibold text-slate-500">Public Slug:</span>{" "}
                            <span className="text-sky-400 font-mono font-bold">{shop.slug}</span>
                          </p>
                          {shop.tagline && (
                            <p className="flex justify-between border-b border-slate-900 pb-1">
                              <span className="font-semibold text-slate-500">Tagline:</span>{" "}
                              <span className="text-slate-300">{shop.tagline}</span>
                            </p>
                          )}
                          {shop.location && (
                            <p className="flex justify-between pb-1">
                              <span className="font-semibold text-slate-500">Location:</span>{" "}
                              <span className="text-slate-300">{shop.location}</span>
                            </p>
                          )}
                        </div>

                        {shop.description && (
                          <p className="mt-2 text-slate-400 leading-relaxed bg-[#0F172A] p-3 rounded-xl border border-slate-800 text-[11px]">
                            {shop.description}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">
                        No shop created yet.
                      </p>
                    )}
                  </div>

                  <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                      Payout Summary
                    </h3>
                    {shop ? (
                      <div className="space-y-3 text-xs text-slate-300">
                        <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-4 shadow-md">
                          <p className="text-xs text-slate-400 mb-1 font-semibold">
                            Withdrawable Revenue
                          </p>
                          <p className="text-xl font-black text-emerald-400">
                            ₹{Math.round(revenue).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActive("payouts")}
                          className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md"
                        >
                          Manage Payouts &rarr;
                        </button>
                      </div>
                    ) : null}
                  </div>
                </section>
              </div>
            )}

            {/* Analytics & Transactions Tab */}
            {active === "analytics" && (
              <div className="space-y-6">
                {/* 4 Core Financial KPI Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-5 shadow-lg">
                    <p className="text-xs font-semibold text-slate-400 mb-1">Total Sales Revenue</p>
                    <p className="text-3xl font-black text-white">₹{Math.round(totalEarnings).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{transactions.length} verified marketplace sales</p>
                  </div>
                  <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-2xl border border-sky-800/60 p-5 shadow-lg">
                    <p className="text-xs font-semibold text-sky-400 mb-1">Net Seller Share (80%)</p>
                    <p className="text-3xl font-black text-sky-400">₹{Math.round(marketplaceSalesRevenue).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Directly withdrawable earnings</p>
                  </div>
                  <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-2xl border border-emerald-800/60 p-5 shadow-lg">
                    <p className="text-xs font-semibold text-emerald-400 mb-1">Total Downloads</p>
                    <p className="text-3xl font-black text-emerald-400">{totalDownloads}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{downloadLogs.length} recent delivery events</p>
                  </div>
                  <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-2xl border border-purple-800/60 p-5 shadow-lg">
                    <p className="text-xs font-semibold text-purple-400 mb-1">Withdrawable Balance</p>
                    <p className="text-3xl font-black text-emerald-400">₹{Math.round(revenue).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Available for instant payout</p>
                  </div>
                </div>

                {/* Sub-Navigation Tabs & Search Filter Header */}
                <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                    {/* Sub-Tab Navigation Pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setAnalyticsSubTab("transactions")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          analyticsSubTab === "transactions"
                            ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 scale-105"
                            : "bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        💳 Sales Transactions ({transactions.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setAnalyticsSubTab("downloads")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          analyticsSubTab === "downloads"
                            ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 scale-105"
                            : "bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        📥 Download Logs ({downloadLogs.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setAnalyticsSubTab("performance")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          analyticsSubTab === "performance"
                            ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 scale-105"
                            : "bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        📊 Asset Performance ({templates.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setAnalyticsSubTab("payouts")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          analyticsSubTab === "payouts"
                            ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 scale-105"
                            : "bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        💸 Payout History ({payoutLogs.length})
                      </button>
                    </div>

                    {/* Filter / Search Input */}
                    <div className="relative w-full lg:w-72">
                      <input
                        type="text"
                        value={analyticsSearch}
                        onChange={(e) => setAnalyticsSearch(e.target.value)}
                        placeholder="Search orders, assets, IDs..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 font-mono transition-colors"
                      />
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
                    </div>
                  </div>

                  {/* Sub-Tab 1: Sales Transactions Table */}
                  {analyticsSubTab === "transactions" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
                          <span>💳</span> Verified Order Transactions &amp; 80% Payout Split
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Showing {transactions.length} records
                        </span>
                      </div>

                      {transactions.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl bg-[#0F172A]/50 border border-slate-800 space-y-2">
                          <p className="text-2xl">💳</p>
                          <p className="text-sm font-bold text-white">No sales transactions yet</p>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            When customers purchase your assets, transactions and 80% payout splits will appear here in real-time.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                <th className="pb-3 px-3">Order ID / Date</th>
                                <th className="pb-3 px-3">Asset Purchased</th>
                                <th className="pb-3 px-3 text-right">Gross Price</th>
                                <th className="pb-3 px-3 text-right">Your Share (80%)</th>
                                <th className="pb-3 px-3 text-right">Platform (20%)</th>
                                <th className="pb-3 px-3">Buyer Details</th>
                                <th className="pb-3 px-3 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                              {transactions
                                .filter((tx) => {
                                  if (!analyticsSearch.trim()) return true;
                                  const q = analyticsSearch.toLowerCase();
                                  return (
                                    (tx.orderId || "").toLowerCase().includes(q) ||
                                    (tx.templateName || "").toLowerCase().includes(q) ||
                                    (tx.slug || "").toLowerCase().includes(q) ||
                                    (tx.buyerName || "").toLowerCase().includes(q) ||
                                    (tx.buyerEmail || "").toLowerCase().includes(q)
                                  );
                                })
                                .map((tx) => (
                                  <tr key={tx.id || tx.orderId} className="hover:bg-slate-900/50 transition-colors">
                                    <td className="py-3.5 px-3">
                                      <span className="font-mono text-sky-400 text-[11px] font-bold block">
                                        {tx.orderId ? tx.orderId.slice(0, 16) : "ORD-DIRECT"}
                                      </span>
                                      <span className="text-[10px] text-slate-400 block mt-0.5">
                                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        }) : "Recently"}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-3">
                                      <Link
                                        href={`/product/${tx.slug}`}
                                        className="font-bold text-white hover:text-sky-400 transition-colors block max-w-xs truncate"
                                      >
                                        {tx.templateName || tx.slug}
                                      </Link>
                                      <span className="text-[10px] text-slate-500 font-mono block">
                                        {tx.slug}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-bold text-white">
                                      ₹{Math.round(tx.grossAmount || 0)}
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-extrabold text-emerald-400">
                                      ₹{Math.round(tx.creatorEarnings || (tx.grossAmount * 0.8))}
                                    </td>
                                    <td className="py-3.5 px-3 text-right text-slate-400">
                                      ₹{Math.round(tx.platformFee || (tx.grossAmount * 0.2))}
                                    </td>
                                    <td className="py-3.5 px-3">
                                      <span className="font-medium text-slate-200 block text-xs truncate max-w-[140px]">
                                        {tx.buyerName}
                                      </span>
                                      <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                                        {tx.buyerEmail}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-3 text-center">
                                      <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[10px] font-bold shadow-sm inline-flex items-center gap-1">
                                        <span>✓</span> {tx.status ? tx.status.toUpperCase() : "PAID"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-Tab 2: Asset Download Activity Logs */}
                  {analyticsSubTab === "downloads" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
                          <span>📥</span> Real-Time Asset Access &amp; Download Logs
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {downloadLogs.length} events logged
                        </span>
                      </div>

                      {downloadLogs.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl bg-[#0F172A]/50 border border-slate-800 space-y-2">
                          <p className="text-2xl">📥</p>
                          <p className="text-sm font-bold text-white">No download logs recorded yet</p>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Customer asset re-downloads and lifetime access events will be logged here.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                <th className="pb-3 px-3">Download Timestamp</th>
                                <th className="pb-3 px-3">Template / Asset</th>
                                <th className="pb-3 px-3">Access Type</th>
                                <th className="pb-3 px-3">Buyer ID</th>
                                <th className="pb-3 px-3 text-center">Delivery Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                              {downloadLogs
                                .filter((dl) => {
                                  if (!analyticsSearch.trim()) return true;
                                  const q = analyticsSearch.toLowerCase();
                                  return (
                                    (dl.template_slug || "").toLowerCase().includes(q) ||
                                    (dl.user_id || "").toLowerCase().includes(q)
                                  );
                                })
                                .map((dl, idx) => (
                                  <tr key={dl.id || idx} className="hover:bg-slate-900/50 transition-colors">
                                    <td className="py-3.5 px-3 font-mono text-slate-300">
                                      {dl.downloaded_at
                                        ? new Date(dl.downloaded_at).toLocaleString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        : "Just now"}
                                    </td>
                                    <td className="py-3.5 px-3">
                                      <Link
                                        href={`/product/${dl.template_slug}`}
                                        className="font-bold text-white hover:text-sky-400 transition-colors font-mono"
                                      >
                                        {dl.template_slug}
                                      </Link>
                                    </td>
                                    <td className="py-3.5 px-3">
                                      <span className="px-2 py-0.5 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-400 text-[10px] font-bold">
                                        Single Product Lifetime Access
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-3 font-mono text-slate-400 text-[11px]">
                                      {dl.user_id ? `${dl.user_id.slice(0, 10)}...` : "Verified Customer"}
                                    </td>
                                    <td className="py-3.5 px-3 text-center">
                                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[10px] font-bold">
                                        Delivered
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-Tab 3: Asset Performance Breakdown */}
                  {analyticsSubTab === "performance" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
                          <span>📊</span> Asset Catalogue Performance
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {templates.length} assets published
                        </span>
                      </div>

                      {templates.length === 0 ? (
                        <p className="text-xs text-slate-400">No template data available yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                <th className="pb-3 px-3">Asset Name</th>
                                <th className="pb-3 px-3">Slug</th>
                                <th className="pb-3 px-3 text-right">Price</th>
                                <th className="pb-3 px-3 text-right">Estimated Earnings (80%)</th>
                                <th className="pb-3 px-3 text-center">Downloads</th>
                                <th className="pb-3 px-3 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                              {templates
                                .filter((tpl) => {
                                  if (!analyticsSearch.trim()) return true;
                                  const q = analyticsSearch.toLowerCase();
                                  return (
                                    (tpl.name || "").toLowerCase().includes(q) ||
                                    (tpl.slug || "").toLowerCase().includes(q)
                                  );
                                })
                                .map((tpl) => {
                                  const status = getStatusLabel(tpl.status);
                                  const price = Number(tpl.price || 399);
                                  const sellerShare = Math.round(price * 0.8);
                                  return (
                                    <tr key={tpl.slug} className="hover:bg-slate-900/50 transition-colors">
                                      <td className="py-3.5 px-3 font-bold text-white">
                                        <Link href={`/product/${tpl.slug}`} className="hover:text-sky-400 transition-colors">
                                          {tpl.name}
                                        </Link>
                                      </td>
                                      <td className="py-3.5 px-3 text-slate-400 font-mono">{tpl.slug}</td>
                                      <td className="py-3.5 px-3 text-right font-bold text-white">₹{price}</td>
                                      <td className="py-3.5 px-3 text-right font-extrabold text-emerald-400">₹{sellerShare}</td>
                                      <td className="py-3.5 px-3 text-center text-white font-bold">{tpl.downloadCount}</td>
                                      <td className="py-3.5 px-3 text-center">
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[10px] font-bold">
                                          {status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-Tab 4: Payout Ledger */}
                  {analyticsSubTab === "payouts" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
                          <span>💸</span> Payout Withdrawals Ledger
                        </h3>
                        <button
                          type="button"
                          onClick={() => setActive("payouts")}
                          className="text-xs text-sky-400 hover:text-sky-300 font-bold"
                        >
                          Request New Payout &rarr;
                        </button>
                      </div>

                      {payoutLogs.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl bg-[#0F172A]/50 border border-slate-800 space-y-2">
                          <p className="text-2xl">💸</p>
                          <p className="text-sm font-bold text-white">No payout requests recorded</p>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            When you request withdrawals of your seller earnings, payout history and status updates will be tracked here.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                <th className="pb-3 px-3">Request ID</th>
                                <th className="pb-3 px-3 text-right">Amount (₹)</th>
                                <th className="pb-3 px-3">Requested Date</th>
                                <th className="pb-3 px-3">Processed Date</th>
                                <th className="pb-3 px-3">Note / UTR</th>
                                <th className="pb-3 px-3 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                              {payoutLogs.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                                  <td className="py-3.5 px-3 font-mono text-sky-400 text-[11px] font-bold">
                                    {p.id ? p.id.slice(0, 12) : "PAYOUT-REQ"}
                                  </td>
                                  <td className="py-3.5 px-3 text-right font-black text-emerald-400 text-sm">
                                    ₹{Math.round(Number(p.amount || 0)).toLocaleString('en-IN')}
                                  </td>
                                  <td className="py-3.5 px-3 text-slate-300 font-mono">
                                    {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : "Recently"}
                                  </td>
                                  <td className="py-3.5 px-3 text-slate-400 font-mono">
                                    {p.processed_at ? new Date(p.processed_at).toLocaleDateString('en-IN') : "Pending"}
                                  </td>
                                  <td className="py-3.5 px-3 text-slate-400 text-xs">
                                    {p.admin_note || "Direct Bank/UPI Transfer"}
                                  </td>
                                  <td className="py-3.5 px-3 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                      p.status === 'paid'
                                        ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                                        : "bg-amber-950/60 border-amber-800 text-amber-300"
                                    }`}>
                                      {(p.status || "PENDING").toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* My Templates Tab */}
            {active === "templates" && (
              <div className="space-y-6">
                <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-extrabold text-white">
                        My Published Templates ({templates.length})
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Manage, edit, or preview your assets on CeliteMarket.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setFormOpen(true);
                        setActive("upload");
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-lg shadow-sky-950/50"
                    >
                      🚀 + Upload New Asset
                    </button>
                  </div>

                  {templates.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0F172A]/50 px-6 py-12 text-center text-sm text-slate-400">
                      No templates yet. Click &ldquo;+ Upload New Asset&rdquo; to add your first template.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templates.map((tpl) => {
                        const status = getStatusLabel(tpl.status);
                        const statusClass =
                          tpl.status === "pending"
                            ? "bg-amber-950/60 text-amber-300 border-amber-800/80"
                            : tpl.status === "rejected"
                              ? "bg-red-950/60 text-red-300 border-red-800/80"
                              : "bg-emerald-950/60 text-emerald-300 border-emerald-800/80";

                        return (
                          <div
                            key={tpl.slug}
                            className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-md group"
                          >
                            <div>
                              {tpl.thumbnail_path || tpl.img ? (
                                <div className="aspect-video w-full rounded-xl overflow-hidden mb-3 bg-black border border-slate-800">
                                  <img
                                    src={convertR2UrlToCdn(tpl.thumbnail_path || tpl.img || '') || undefined}
                                    alt={tpl.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              ) : null}
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="font-bold text-white text-sm truncate">{tpl.name}</h3>
                                <span className="text-xs font-black text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2.5 py-0.5 rounded-lg shrink-0">
                                  ₹{tpl.price || 399}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono truncate">{tpl.slug}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusClass}`}>
                                  {status}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {tpl.downloadCount} downloads
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                              <button
                                type="button"
                                onClick={() => handleEditClick(tpl)}
                                className="flex-1 py-1.5 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400 hover:text-sky-300 text-xs font-bold transition-all text-center"
                              >
                                Edit
                              </button>
                              <Link
                                href={`/product/${tpl.slug}`}
                                target="_blank"
                                className="flex-1 py-1.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all text-center"
                              >
                                View Live
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteTemplate(tpl.slug)}
                                className="px-2.5 py-1.5 rounded-xl bg-red-950/40 border border-red-900/60 text-red-400 hover:text-red-300 text-xs font-semibold transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dedicated Upload Asset Tab */}
            {active === "upload" && (
              <div className="space-y-6">
                <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                    <div>
                      <h2 className="text-xl font-extrabold text-white">
                        {isEditing ? `Edit Asset: ${form.name}` : "Upload New Asset"}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Publish your digital assets directly to Cloudflare R2 &amp; CeliteMarket.
                      </p>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setActive("templates");
                        }}
                        className="text-xs text-red-400 font-semibold hover:underline"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  {/* AI Autofill Banner */}
                  <div className="mb-6 p-4 rounded-2xl bg-sky-950/40 border border-sky-800/60 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                        <span>✨</span> AI Content Generator (Gemini)
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Auto-generate template title, description, software tags, and plugin requirements in 1-click.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutofillOpen(true)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shrink-0"
                    >
                      Autofill with AI
                    </button>
                  </div>

                  {/* Autofill Modal */}
                  {autofillOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={() => { setAutofillOpen(false); setAutofillTemplateType(""); }}>
                      <div className="bg-[#090D16] rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-800 text-white" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-white">Autofill with AI</h2>
                            <p className="text-xs text-slate-400">Generate title, description, tags &amp; metadata</p>
                          </div>
                        </div>
                        <div className="mb-5">
                          <label className="block text-xs font-bold text-slate-300 mb-2">What kind of template is this?</label>
                          <input
                            type="text"
                            value={autofillTemplateType}
                            onChange={(e) => setAutofillTemplateType(e.target.value)}
                            placeholder="e.g., Cinematic logo reveal, Wedding invitation, YouTube intro"
                            className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAutofill(); } }}
                          />
                          <p className="text-[11px] text-slate-400 mt-2">Example: "Dark minimal logo reveal with glowing neon particles"</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => { setAutofillOpen(false); setAutofillTemplateType(""); }}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-900 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAutofill}
                            disabled={autofillLoading || !autofillTemplateType.trim()}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white text-xs font-bold hover:from-sky-500 hover:to-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-sky-950/50"
                          >
                            {autofillLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Generate Content
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleCreateTemplate} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Template Name *
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setForm((f) => ({
                              ...f,
                              name: newName,
                              slug: slugManuallyEdited
                                ? f.slug
                                : generateSlug(newName),
                            }));
                          }}
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Product URL Slug *
                        </label>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={(e) => {
                            setSlugManuallyEdited(true);
                            setForm((f) => ({
                              ...f,
                              slug: e.target.value.toLowerCase().replace(/[^\w-]/g, ""),
                            }));
                          }}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono text-xs"
                          placeholder="product-url-slug"
                        />
                      </div>
                    </div>

                    {/* Price Setup */}
                    <div className="p-4 bg-[#0F172A] rounded-2xl border border-sky-800/60 space-y-2">
                      <label className="block text-xs font-bold text-sky-400">
                        Custom Marketplace Price (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-xs font-extrabold text-slate-400">₹</span>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={form.price}
                          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                          placeholder="Enter price (e.g. 199, 399, 799)"
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#0B0F17] border border-sky-800/80 text-sm font-black text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">You earn 80% net revenue split on every single product sale.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Category *
                        </label>
                        <select
                          value={form.category_id}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              category_id: e.target.value,
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="" className="bg-[#0B0F17]">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id} className="bg-[#0B0F17]">
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Subcategory
                        </label>
                        <select
                          value={form.subcategory_id}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              subcategory_id: e.target.value,
                              sub_subcategory_id: "",
                            }))
                          }
                          disabled={!form.category_id}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 disabled:opacity-50"
                        >
                          <option value="" className="bg-[#0B0F17]">Select subcategory</option>
                          {filteredSubcategories.map((sub) => (
                            <option key={sub.id} value={sub.id} className="bg-[#0B0F17]">
                              {sub.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Sub-Subcategory
                        </label>
                        <select
                          value={form.sub_subcategory_id}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              sub_subcategory_id: e.target.value,
                            }))
                          }
                          disabled={!form.subcategory_id}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 disabled:opacity-50"
                        >
                          <option value="" className="bg-[#0B0F17]">Select sub-subcategory</option>
                          {filteredSubSubcategories.map((subSub) => (
                            <option key={subSub.id} value={subSub.id} className="bg-[#0B0F17]">
                              {subSub.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Video File (R2 Storage)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={uploadingVideo ? (form.video_path || `Uploading... ${uploadProgress.video}%`) : (form.video_path || '')}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, video_path: e.target.value }))
                            }
                            placeholder="Upload video to R2 or paste link"
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                            readOnly={uploadingVideo && !form.video_path}
                          />
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            disabled={uploadingVideo}
                            className="rounded-xl border border-slate-800 bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {uploadingVideo ? `Uploading ${uploadProgress.video}%` : 'Upload'}
                          </button>
                          <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadFile('video', file); }} />
                        </div>
                        {form.video_path && (
                          <div className="mt-2 aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-black">
                            <video src={form.video_path} controls className="h-full w-full" />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Thumbnail Image (R2 Storage)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={uploadingThumbnail ? (form.thumbnail_path || `Uploading... ${uploadProgress.thumbnail}%`) : (form.thumbnail_path || '')}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, thumbnail_path: e.target.value }))
                            }
                            placeholder="Upload thumbnail to R2 or paste link"
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                            readOnly={uploadingThumbnail && !form.thumbnail_path}
                          />
                          <button
                            type="button"
                            onClick={() => thumbnailInputRef.current?.click()}
                            disabled={uploadingThumbnail}
                            className="rounded-xl border border-slate-800 bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {uploadingThumbnail ? `Uploading ${uploadProgress.thumbnail}%` : 'Upload'}
                          </button>
                          <input ref={thumbnailInputRef} type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadFile('thumbnail', file); }} />
                        </div>
                        {form.thumbnail_path && (
                          <div className="mt-2 w-full overflow-hidden rounded-xl border border-slate-800 bg-black">
                            <img src={form.thumbnail_path} alt="Thumbnail preview" className="w-full h-auto max-h-48 object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Source ZIP File (Private Cloudflare R2 Storage) *
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={uploadingSource ? (form.source_path || `Uploading... ${uploadProgress.source}%`) : (form.source_path || '')}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              source_path: e.target.value,
                            }))
                          }
                          placeholder="Upload .zip / .rar source file to private R2 storage"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                          readOnly={uploadingSource && !form.source_path}
                        />
                        <button
                          type="button"
                          onClick={() => sourceInputRef.current?.click()}
                          disabled={uploadingSource}
                          className="rounded-xl border border-sky-800/80 bg-sky-950/60 px-5 py-2.5 text-xs font-bold text-sky-400 hover:bg-sky-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {uploadingSource ? `Uploading ${uploadProgress.source}%` : 'Upload ZIP'}
                        </button>
                        <input ref={sourceInputRef} type="file" accept="application/zip,application/x-rar-compressed,.zip,.rar" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadFile('source', file); }} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                        placeholder="Describe what this template includes."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Features (comma separated)</label>
                        <input
                          type="text"
                          value={form.features}
                          onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                          placeholder="e.g. 4K, No plugin required"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Software Used (comma separated)</label>
                        <input
                          type="text"
                          value={form.software}
                          onChange={(e) => setForm((f) => ({ ...f, software: e.target.value }))}
                          placeholder="e.g. After Effects 2024"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setActive("templates");
                        }}
                        className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition-all shadow-lg shadow-sky-950/50 disabled:opacity-60"
                      >
                        {saving ? (isEditing ? "Saving Changes..." : "Publishing Asset...") : (isEditing ? "Save Changes" : "🚀 Publish Asset to CeliteMarket")}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Payouts & Earnings Tab */}
            {active === "payouts" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-6">
                    <h2 className="text-lg font-extrabold text-white">
                      Payouts &amp; Earnings Overview
                    </h2>

                    {/* Revenue & Balance Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-4 space-y-1">
                        <p className="text-xs font-semibold text-slate-400">Available Balance</p>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                          ₹{Math.round(revenue).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-slate-500">Withdrawable now</p>
                      </div>

                      <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-4 space-y-1">
                        <p className="text-xs font-semibold text-slate-400">Total Lifetime Sales (80%)</p>
                        <p className="text-2xl sm:text-3xl font-black text-white">
                          ₹{Math.round(totalEarnings).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-slate-500">{marketplaceSalesCount} orders completed</p>
                      </div>

                      <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-4 space-y-1">
                        <p className="text-xs font-semibold text-slate-400">Paid Out / Withdrawn</p>
                        <p className="text-2xl sm:text-3xl font-black text-sky-400">
                          ₹{Math.round(paidOutAmount).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-slate-500">{pendingPayoutAmount > 0 ? `₹${Math.round(pendingPayoutAmount)} pending` : "No pending payout"}</p>
                      </div>
                    </div>

                    <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-400">Payout Status</p>
                          <p className="text-sm font-bold text-white mt-0.5">
                            {revenue >= 800
                              ? "✓ You have met the ₹800 payout threshold!"
                              : `₹${Math.max(0, 800 - Math.round(revenue)).toLocaleString('en-IN')} more needed to withdraw`}
                          </p>
                        </div>
                        {revenue >= 800 ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold animate-pulse">
                            ✓ Ready for Payout
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-bold">
                            Threshold: ₹800
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-400 font-semibold">
                          <span>Payout Threshold Progress</span>
                          <span className="font-mono text-sky-400">₹{Math.round(revenue)} / ₹800 ({Math.min(100, Math.round((revenue / 800) * 100))}%)</span>
                        </div>
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                          <div
                            className="bg-gradient-to-r from-sky-500 via-emerald-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, Math.round((revenue / 800) * 100)))}%` }}
                          />
                        </div>
                      </div>

                      {revenue >= 800 ? (
                        <button
                          type="button"
                          onClick={handleRequestPayout}
                          disabled={payoutLoading}
                          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          {payoutLoading ? "Submitting Request..." : `🚀 Request Instant Payout (₹${Math.round(revenue).toLocaleString('en-IN')})`}
                        </button>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                          <p className="text-xs text-slate-400">
                            Minimum withdrawal threshold is <strong className="text-white">₹800</strong>. Keep creating and publishing assets to reach your payout!
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                        Payout Guidelines
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed bg-[#0F172A]/50 p-4 rounded-2xl border border-slate-800">
                        <li>Creators earn 80% net revenue split on all single product sales.</li>
                        <li>Payout requests are processed to your saved Bank Account or UPI ID within 24 hours.</li>
                        <li>Minimum withdrawal threshold is ₹800.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                      Saved Bank &amp; UPI Account
                    </h3>
                    {shop ? (
                      <div className="space-y-3 text-xs text-slate-300">
                        <div className="space-y-2 bg-[#0F172A] p-4 rounded-2xl border border-slate-800 font-mono">
                          <p><span className="text-slate-400 font-sans">Account Holder:</span> <br /><strong className="text-white">{shop.bank_account_name || "Not set"}</strong></p>
                          <p><span className="text-slate-400 font-sans">Account Number:</span> <br /><strong className="text-white">{shop.bank_account_number || "Not set"}</strong></p>
                          <p><span className="text-slate-400 font-sans">IFSC Code:</span> <br /><strong className="text-white">{shop.bank_ifsc || "Not set"}</strong></p>
                          <p><span className="text-slate-400 font-sans">UPI ID:</span> <br /><strong className="text-white">{shop.bank_upi_id || "Not set"}</strong></p>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenBankModal}
                          className="w-full py-2.5 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400 hover:text-sky-300 text-xs font-bold transition-all text-center cursor-pointer"
                        >
                          ✏️ Edit Bank Account &amp; UPI Details
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No bank details added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Studio & Bank Settings Tab */}
            {active === "settings" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Live Store Preview Card */}
                  <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                    <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900">
                      {studioForm.banner_url ? (
                        <img
                          src={convertR2UrlToCdn(studioForm.banner_url) || studioForm.banner_url}
                          alt="Store Banner"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 flex items-center justify-center text-slate-500 font-mono text-xs">
                          Default Studio Cover Banner (1200x400 recommended)
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                      <label className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 border border-slate-700 text-white text-xs font-bold transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5">
                        <span>📷</span> {uploadingBanner ? "Uploading..." : "Change Banner"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingBanner}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadBranding(file, "banner");
                          }}
                        />
                      </label>
                    </div>

                    <div className="p-6 relative z-10 -mt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-800/80">
                      <div className="flex items-end gap-4">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-900 border-2 border-slate-700 overflow-hidden shadow-2xl shrink-0 group">
                          {studioForm.logo_url ? (
                            <img
                              src={convertR2UrlToCdn(studioForm.logo_url) || studioForm.logo_url}
                              alt={studioForm.name || "Studio Logo"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-600 to-blue-700 text-white text-2xl font-black">
                              {(studioForm.name || "S").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity">
                            {uploadingLogo ? "..." : "Change"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingLogo}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadBranding(file, "logo");
                              }}
                            />
                          </label>
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black text-white">{studioForm.name || "My Creator Studio"}</h3>
                          {studioForm.tagline && <p className="text-xs text-sky-400 font-medium">{studioForm.tagline}</p>}
                          {shop && <p className="text-[11px] font-mono text-slate-400 mt-0.5">celitemarket.in/{shop.slug}</p>}
                        </div>
                      </div>
                      {shop && (
                        <Link
                          href={`/${shop.slug}`}
                          target="_blank"
                          className="px-4 py-2 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400 hover:text-sky-300 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                        >
                          Visit Public Storefront &rarr;
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Studio & Bank Details Edit Form */}
                  <form onSubmit={handleSaveStudioSettings} className="bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
                    <div>
                      <h2 className="text-lg font-extrabold text-white">
                        Edit Studio Profile &amp; Payout Details
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Manage your creator storefront identity and direct bank/UPI payout information.
                      </p>
                    </div>

                    {/* Section 1: Studio Identity */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                        <span>🏢</span> Studio Profile
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Studio / Brand Name *</label>
                          <input
                            type="text"
                            required
                            value={studioForm.name}
                            onChange={(e) => setStudioForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. CinemaCraft Studios"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Tagline / Headline</label>
                          <input
                            type="text"
                            value={studioForm.tagline}
                            onChange={(e) => setStudioForm((f) => ({ ...f, tagline: e.target.value }))}
                            placeholder="e.g. High-End VFX & LUTs for Editors"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Bio / Studio Description</label>
                        <textarea
                          rows={3}
                          value={studioForm.description}
                          onChange={(e) => setStudioForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Tell customers about your experience, editing style, and premium assets..."
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-colors resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Public Storefront URL Slug *</label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-[11px] font-mono text-slate-500 select-none">celitemarket.in/</span>
                            <input
                              type="text"
                              required
                              value={studioForm.slug}
                              onChange={(e) => {
                                const clean = e.target.value.toLowerCase().replace(/[^\w-]/g, "");
                                setStudioForm((f) => ({ ...f, slug: clean }));
                              }}
                              placeholder="studio-slug"
                              className="w-full pl-32 pr-3 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500 transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Location</label>
                          <input
                            type="text"
                            value={studioForm.location}
                            onChange={(e) => setStudioForm((f) => ({ ...f, location: e.target.value }))}
                            placeholder="e.g. Mumbai, India"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Creator Contact Details (Mandatory) */}
                    <div id="creator-contact-settings-section" className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                          <span>📞</span> Contact Information (Mandatory for Payouts &amp; Alerts)
                        </h3>
                        {(!studioForm.phone || !studioForm.email) ? (
                          <span className="text-[10px] font-bold text-red-400 bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded-md">
                            ⚠️ Incomplete Contact Info
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                            ✓ Contact Saved
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Your phone number and email are used for automated payout confirmations, sales receipts, and critical creator notifications.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            Contact Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={studioForm.phone}
                            onChange={(e) => setStudioForm((f) => ({ ...f, phone: e.target.value }))}
                            placeholder="e.g. +91 98765 43210"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-colors font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            Contact Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={studioForm.email}
                            onChange={(e) => setStudioForm((f) => ({ ...f, email: e.target.value }))}
                            placeholder="e.g. creator@example.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-colors font-medium"
                          />
                        </div>
                      </div>

                      {/* WhatsApp Community Quick Join Card inside Settings */}
                      <div className="bg-[#0F172A]/70 border border-emerald-900/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-emerald-400">Celite Creator Community Group</p>
                          <p className="text-[11px] text-slate-400">Join other creators on WhatsApp for tips, feedback, and sales growth.</p>
                        </div>
                        <a
                          href={CREATOR_COMMUNITY_WHATSAPP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40 inline-flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <span>💬</span>
                          <span>Join WhatsApp Group</span>
                        </a>
                      </div>
                    </div>

                    {/* Section 3: Social Links */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                        <span>🌐</span> Social &amp; Portfolio Links
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Website / Portfolio URL</label>
                          <input
                            type="url"
                            value={studioForm.website_url}
                            onChange={(e) => setStudioForm((f) => ({ ...f, website_url: e.target.value }))}
                            placeholder="https://yourportfolio.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Instagram Handle or URL</label>
                          <input
                            type="text"
                            value={studioForm.instagram_url}
                            onChange={(e) => setStudioForm((f) => ({ ...f, instagram_url: e.target.value }))}
                            placeholder="https://instagram.com/yourhandle"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">YouTube Channel URL</label>
                          <input
                            type="url"
                            value={studioForm.youtube_url}
                            onChange={(e) => setStudioForm((f) => ({ ...f, youtube_url: e.target.value }))}
                            placeholder="https://youtube.com/@yourchannel"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Twitter / X URL</label>
                          <input
                            type="text"
                            value={studioForm.twitter_url}
                            onChange={(e) => setStudioForm((f) => ({ ...f, twitter_url: e.target.value }))}
                            placeholder="https://x.com/yourhandle"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Bank & Payout Accounts */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <span>🏦</span> Bank &amp; Payout Details (80% Seller Share)
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                          Direct Bank / UPI
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Enter your verified Indian bank account or UPI ID to receive direct payouts when you withdraw marketplace earnings.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Account Holder Name</label>
                          <input
                            type="text"
                            value={studioForm.bank_account_name}
                            onChange={(e) => setStudioForm((f) => ({ ...f, bank_account_name: e.target.value }))}
                            placeholder="Full name as on bank account"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Bank Account Number</label>
                          <input
                            type="text"
                            value={studioForm.bank_account_number}
                            onChange={(e) => setStudioForm((f) => ({ ...f, bank_account_number: e.target.value }))}
                            placeholder="e.g. 123456789012"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">IFSC Code</label>
                          <input
                            type="text"
                            value={studioForm.bank_ifsc}
                            onChange={(e) => setStudioForm((f) => ({ ...f, bank_ifsc: e.target.value.toUpperCase() }))}
                            placeholder="e.g. HDFC0001234"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs font-mono uppercase focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">UPI ID (Instant Payouts)</label>
                          <input
                            type="text"
                            value={studioForm.bank_upi_id}
                            onChange={(e) => setStudioForm((f) => ({ ...f, bank_upi_id: e.target.value }))}
                            placeholder="e.g. yourname@okhdfcbank"
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0F172A] border border-slate-800 text-white placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <p className="text-[11px] text-slate-500">
                        Changes take effect immediately across CeliteMarket.
                      </p>
                      <button
                        type="submit"
                        disabled={savingSettings}
                        className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-sky-950/50 flex items-center gap-2 cursor-pointer"
                      >
                        {savingSettings ? "Saving Settings..." : "💾 Save Studio & Payout Settings"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                      Creator Policy &amp; Payouts
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      You retain 100% intellectual copyright over all assets uploaded. CeliteMarket processes payments through Razorpay and distributes 80% net revenue directly to your registered bank account or UPI ID.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="border-t border-slate-800 py-4 px-6 text-center text-slate-500 text-xs bg-[#0B0F17]">
            &copy; {new Date().getFullYear()} CeliteMarket Creator Panel. All rights reserved.
          </footer>
        </div>
      </div>
    </main>
  );
}


