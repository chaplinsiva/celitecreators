// agent-notes: { ctx: "Attribution engine for marketplace touchpoint capture, channel normalization, and localStorage persistence", deps: [], state: active, last: "sato@2026-08-14" }

export type AttributionSource =
  | 'Instagram Paid'
  | 'Instagram Organic'
  | 'Facebook Paid'
  | 'Facebook Organic'
  | 'Google Ads'
  | 'Google Organic'
  | 'YouTube'
  | 'ChatGPT / AI'
  | 'Referral'
  | 'Direct'
  | 'Other';

export interface AttributionTouchpoint {
  source: AttributionSource;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  landingPage: string;
  referrer: string | null;
  productViewed?: string | null;
  timestamp: string;
}

export interface StoredAttribution {
  anonymousId: string;
  firstTouch: AttributionTouchpoint;
  lastTouch: AttributionTouchpoint;
  firstProductViewed: string | null;
  lastProductViewed: string | null;
  touchpointCount: number;
}

export const ATTRIBUTION_STORAGE_KEY = 'celite_attribution';
export const ANONYMOUS_ID_KEY = 'celite_anonymous_id';

const SENSITIVE_PARAM_KEYS = [
  'password',
  'token',
  'access_token',
  'refresh_token',
  'key',
  'api_key',
  'secret',
  'auth',
  'code',
  'signature',
  'card',
  'cvv',
  'credit'
];

/**
 * Sanitizes URLs to remove sensitive query parameters and credential leaks
 */
export function sanitizeUrl(rawUrl: string): string {
  try {
    const urlObj = new URL(rawUrl, typeof window !== 'undefined' ? window.location.origin : 'https://celitemarket.in');
    
    // Strip sensitive search params
    for (const key of Array.from(urlObj.searchParams.keys())) {
      if (SENSITIVE_PARAM_KEYS.some(sens => key.toLowerCase().includes(sens))) {
        urlObj.searchParams.delete(key);
      }
    }
    
    return urlObj.pathname + (urlObj.search ? urlObj.search : '');
  } catch {
    return rawUrl.split('?')[0] || '/';
  }
}

/**
 * Normalizes query params and referring domains into 11 human-readable attribution channels
 */
export function classifyAttributionSource(params: {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  referrer?: string | null;
}): AttributionSource {
  const source = (params.utm_source || '').toLowerCase().trim();
  const medium = (params.utm_medium || '').toLowerCase().trim();
  const referrer = (params.referrer || '').toLowerCase().trim();
  const gclid = params.gclid ? params.gclid.trim() : '';
  const fbclid = params.fbclid ? params.fbclid.trim() : '';

  const paidMediums = ['cpc', 'ppc', 'paid', 'paid_social', 'ads', 'display', 'sponsor', 'meta', 'ad'];

  // 1. Google Ads
  if (gclid || ((source === 'google' || source === 'adwords') && paidMediums.some(m => medium.includes(m)))) {
    return 'Google Ads';
  }

  // 2. Google Organic
  if (source === 'google' || referrer.includes('google.') || referrer.includes('google.com')) {
    return 'Google Organic';
  }

  // 3. Instagram Paid
  if ((source === 'instagram' || source === 'ig') && (paidMediums.some(m => medium.includes(m)) || fbclid)) {
    return 'Instagram Paid';
  }

  // 4. Instagram Organic
  if (source === 'instagram' || source === 'ig' || referrer.includes('instagram.com') || referrer.includes('l.instagram.com')) {
    return 'Instagram Organic';
  }

  // 5. Facebook Paid
  if ((source === 'facebook' || source === 'fb') && (paidMediums.some(m => medium.includes(m)) || fbclid)) {
    return 'Facebook Paid';
  }

  // 6. Facebook Organic
  if (source === 'facebook' || source === 'fb' || referrer.includes('facebook.com') || referrer.includes('fb.me') || referrer.includes('l.facebook.com')) {
    return 'Facebook Organic';
  }

  // 7. YouTube
  if (source === 'youtube' || source === 'yt' || referrer.includes('youtube.com') || referrer.includes('youtu.be')) {
    return 'YouTube';
  }

  // 8. ChatGPT / AI Search
  if (
    source.includes('chatgpt') ||
    source.includes('openai') ||
    source.includes('claude') ||
    source.includes('anthropic') ||
    source.includes('perplexity') ||
    referrer.includes('chatgpt.com') ||
    referrer.includes('openai.com') ||
    referrer.includes('claude.ai') ||
    referrer.includes('perplexity.ai')
  ) {
    return 'ChatGPT / AI';
  }

  // 9. Direct Traffic (No source, no referrer, or self-referral)
  const isDirectOrSelf =
    !source &&
    (!referrer ||
      referrer.includes('celitemarket.in') ||
      referrer.includes('celite.in') ||
      referrer.includes('localhost') ||
      referrer.includes('127.0.0.1'));

  if (isDirectOrSelf && !gclid && !fbclid) {
    return 'Direct';
  }

  // 10. External Referral
  if (!source && referrer && !referrer.includes('celitemarket.in') && !referrer.includes('celite.in') && !referrer.includes('localhost')) {
    return 'Referral';
  }

  // 11. Other custom sources
  if (source) {
    return 'Other';
  }

  return 'Direct';
}

/**
 * Generate or retrieve UUID for anonymous visitor
 */
export function getOrCreateAnonymousId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let anonId = localStorage.getItem(ANONYMOUS_ID_KEY);
    if (!anonId) {
      anonId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(ANONYMOUS_ID_KEY, anonId);
    }
    return anonId;
  } catch {
    return '';
  }
}

/**
 * Safe localStorage reader
 */
export function getStoredAttribution(): StoredAttribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Safe localStorage writer
 */
export function setStoredAttribution(data: StoredAttribution): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save attribution to localStorage:', e);
  }
}

/**
 * Captures touchpoint on navigation, preserving first-touch immutability
 */
export function captureAttribution(): StoredAttribution | null {
  if (typeof window === 'undefined') return null;

  try {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    const utm_source = searchParams.get('utm_source');
    const utm_medium = searchParams.get('utm_medium');
    const utm_campaign = searchParams.get('utm_campaign');
    const utm_content = searchParams.get('utm_content');
    const utm_term = searchParams.get('utm_term');
    const gclid = searchParams.get('gclid');
    const fbclid = searchParams.get('fbclid');
    const rawReferrer = document.referrer || null;

    // Check if referrer is internal
    let referrerDomain: string | null = null;
    if (rawReferrer) {
      try {
        const refUrl = new URL(rawReferrer);
        if (!refUrl.hostname.includes('celitemarket.in') && !refUrl.hostname.includes('celite.in') && !refUrl.hostname.includes('localhost')) {
          referrerDomain = refUrl.hostname;
        }
      } catch {
        referrerDomain = rawReferrer;
      }
    }

    const currentChannel = classifyAttributionSource({
      utm_source,
      utm_medium,
      utm_campaign,
      gclid,
      fbclid,
      referrer: rawReferrer,
    });

    const now = new Date().toISOString();
    const landingPage = sanitizeUrl(window.location.pathname + window.location.search);
    const anonymousId = getOrCreateAnonymousId();

    const currentTouch: AttributionTouchpoint = {
      source: currentChannel,
      medium: utm_medium || null,
      campaign: utm_campaign || null,
      content: utm_content || null,
      term: utm_term || null,
      landingPage,
      referrer: referrerDomain,
      timestamp: now,
    };

    const existing = getStoredAttribution();

    if (!existing) {
      // First Touch Discovery
      const newAttribution: StoredAttribution = {
        anonymousId,
        firstTouch: currentTouch,
        lastTouch: currentTouch,
        firstProductViewed: null,
        lastProductViewed: null,
        touchpointCount: 1,
      };
      setStoredAttribution(newAttribution);
      return newAttribution;
    }

    // Has existing attribution.
    // Determine if this is a new external touchpoint or campaign visit
    const isNewCampaignOrSource =
      Boolean(utm_source || utm_campaign || gclid || fbclid || referrerDomain) &&
      (currentChannel !== existing.lastTouch.source ||
        utm_campaign !== existing.lastTouch.campaign ||
        referrerDomain !== existing.lastTouch.referrer);

    const updated: StoredAttribution = {
      ...existing,
      anonymousId: existing.anonymousId || anonymousId,
      // First-touch is strictly immutable
      firstTouch: existing.firstTouch,
      // Update last-touch if new source/campaign detected or if previously Direct
      lastTouch: isNewCampaignOrSource || existing.lastTouch.source === 'Direct' ? currentTouch : existing.lastTouch,
      touchpointCount: (existing.touchpointCount || 1) + 1,
    };

    setStoredAttribution(updated);
    return updated;
  } catch (e) {
    console.error('Error capturing attribution:', e);
    return null;
  }
}

/**
 * Records viewed product slug (e.g. on /product/[slug])
 */
export function recordProductView(productSlug: string): StoredAttribution | null {
  if (typeof window === 'undefined' || !productSlug) return null;

  try {
    let current = getStoredAttribution();
    if (!current) {
      current = captureAttribution();
    }
    if (!current) return null;

    const updated: StoredAttribution = {
      ...current,
      firstProductViewed: current.firstProductViewed || productSlug,
      lastProductViewed: productSlug,
      firstTouch: {
        ...current.firstTouch,
        productViewed: current.firstTouch.productViewed || productSlug,
      },
      lastTouch: {
        ...current.lastTouch,
        productViewed: productSlug,
      },
    };

    setStoredAttribution(updated);
    return updated;
  } catch (e) {
    console.error('Error recording product view attribution:', e);
    return null;
  }
}
