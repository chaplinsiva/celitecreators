-- ===================================================
-- CeliteCreators Marketplace Complete 12-Table Schema
-- Migration: 20260724_expanded_schema.sql
-- ===================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'creator', 'admin')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Subcategories Table
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Creator Shops Table
CREATE TABLE IF NOT EXISTS public.creator_shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    profile_image_url TEXT,
    banner_image_url TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_upi_id TEXT,
    bank_account_name TEXT,
    is_verified BOOLEAN DEFAULT false,
    direct_upload_enabled BOOLEAN DEFAULT false,
    followers_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Marketplace Products Table (templates)
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_shop_id UUID REFERENCES public.creator_shops(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subtitle TEXT,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_free BOOLEAN DEFAULT false,
    category_id UUID REFERENCES public.categories(id),
    subcategory_id UUID REFERENCES public.subcategories(id),
    thumbnail_path TEXT,
    preview_path TEXT,
    video_path TEXT,
    audio_preview_path TEXT,
    gallery_paths JSONB DEFAULT '[]'::jsonb,
    file_size_bytes BIGINT DEFAULT 0,
    file_format TEXT,
    source_path TEXT NOT NULL, -- Private R2 Key
    software JSONB DEFAULT '[]'::jsonb,
    plugins JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    sales_count INTEGER DEFAULT 0,
    rating_avg NUMERIC(3, 2) DEFAULT 5.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    billing_name TEXT,
    billing_email TEXT,
    billing_mobile TEXT,
    download_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    template_slug TEXT REFERENCES public.templates(slug) ON DELETE SET NULL,
    creator_shop_id UUID REFERENCES public.creator_shops(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) DEFAULT 0.00,
    creator_earnings NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Creator Payout Requests Table
CREATE TABLE IF NOT EXISTS public.creator_payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_shop_id UUID REFERENCES public.creator_shops(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected')),
    bank_reference_number TEXT,
    admin_notes TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Creator Followers Table
CREATE TABLE IF NOT EXISTS public.creator_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    creator_shop_id UUID REFERENCES public.creator_shops(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_creator_follower UNIQUE (user_id, creator_shop_id)
);

-- 11. Customer Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified_buyer BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_template_review UNIQUE (user_id, template_id)
);

-- 12. Wishlists Table
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_template_wishlist UNIQUE (user_id, template_id)
);

-- 13. Presigned Download Logs Table
CREATE TABLE IF NOT EXISTS public.download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    download_token TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    downloaded_at TIMESTAMPTZ DEFAULT now()
);

-- ===================================================
-- PERFORMANCE INDEXES (LCP < 1.5s BUDGET)
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_templates_status_cat_created ON public.templates (status, category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_slug ON public.templates (slug);
CREATE INDEX IF NOT EXISTS idx_creator_shops_slug ON public.creator_shops (slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_creator_followers_shop ON public.creator_followers (creator_shop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_template ON public.reviews (template_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists (user_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_order ON public.download_logs (order_id);

-- ===================================================
-- AUTOMATED FUNCTIONS & TRIGGERS
-- ===================================================

-- 1. Auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        'buyer'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Auto-update follower count on creator_shops
CREATE OR REPLACE FUNCTION public.update_creator_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.creator_shops
        SET followers_count = followers_count + 1
        WHERE id = NEW.creator_shop_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.creator_shops
        SET followers_count = GREATEST(0, followers_count - 1)
        WHERE id = OLD.creator_shop_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_creator_follower_change ON public.creator_followers;
CREATE TRIGGER on_creator_follower_change
    AFTER INSERT OR DELETE ON public.creator_followers
    FOR EACH ROW EXECUTE FUNCTION public.update_creator_followers_count();

-- 3. Auto-update rating average and count on templates
CREATE OR REPLACE FUNCTION public.update_template_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_template_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_template_id := OLD.template_id;
    ELSE
        target_template_id := NEW.template_id;
    END IF;

    UPDATE public.templates
    SET 
        rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE template_id = target_template_id), 5.00),
        rating_count = (SELECT COUNT(*) FROM public.reviews WHERE template_id = target_template_id)
    WHERE id = target_template_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_template_rating();

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Categories & Subcategories
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public subcategories read" ON public.subcategories FOR SELECT USING (true);

-- 2. User Profiles Policies
CREATE POLICY "Users read own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Creator Shops Policies
CREATE POLICY "Public shop profile read" ON public.creator_shops FOR SELECT USING (true);
CREATE POLICY "Creator manage own shop" ON public.creator_shops FOR ALL USING (auth.uid() = user_id);

-- 4. Templates Policies
CREATE POLICY "Public read approved products" ON public.templates FOR SELECT USING (status = 'approved');
CREATE POLICY "Creator manage own templates" ON public.templates FOR ALL USING (
    creator_shop_id IN (SELECT id FROM public.creator_shops WHERE user_id = auth.uid())
);

-- 5. Orders & Order Items Policies
CREATE POLICY "Buyer read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Buyer read own order items" ON public.order_items FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid() OR user_id IS NULL)
);

-- 6. Creator Payout Requests Policies
CREATE POLICY "Creator manage payout requests" ON public.creator_payout_requests FOR ALL USING (
    creator_shop_id IN (SELECT id FROM public.creator_shops WHERE user_id = auth.uid())
);

-- 7. Followers Policies
CREATE POLICY "Public read followers" ON public.creator_followers FOR SELECT USING (true);
CREATE POLICY "User manage own followings" ON public.creator_followers FOR ALL USING (auth.uid() = user_id);

-- 8. Reviews Policies
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Buyer create own review" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Buyer update own review" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- 9. Wishlists Policies
CREATE POLICY "User manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- 10. Download Logs Policies
CREATE POLICY "Buyer read own download logs" ON public.download_logs FOR SELECT USING (auth.uid() = user_id);
