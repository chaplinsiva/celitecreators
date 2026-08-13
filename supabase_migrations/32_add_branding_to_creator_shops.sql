-- ============================================================================
-- ADD BRANDING AND SOCIAL FIELDS TO CREATOR SHOPS
-- ============================================================================
-- This migration adds store customization and branding fields to creator_shops
-- to enable portfolio-style storefronts for creators on CeliteMarket.
-- ============================================================================

BEGIN;

ALTER TABLE public.creator_shops
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT;

COMMENT ON COLUMN public.creator_shops.banner_url IS 'Custom store banner image URL or R2 CDN link';
COMMENT ON COLUMN public.creator_shops.logo_url IS 'Custom studio logo/avatar URL or R2 CDN link';
COMMENT ON COLUMN public.creator_shops.tagline IS 'Short headline/tagline for the creator studio (e.g. VFX Specialist & 3D Artist)';
COMMENT ON COLUMN public.creator_shops.location IS 'City/Country or region of the creator studio (e.g. Mumbai, India)';
COMMENT ON COLUMN public.creator_shops.website_url IS 'Personal portfolio or studio website link';
COMMENT ON COLUMN public.creator_shops.instagram_url IS 'Instagram profile handle or URL';
COMMENT ON COLUMN public.creator_shops.youtube_url IS 'YouTube channel link';
COMMENT ON COLUMN public.creator_shops.twitter_url IS 'X / Twitter profile handle or URL';

COMMIT;
