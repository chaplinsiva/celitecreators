-- ==========================================
-- CeliteCreators Marketplace Database Schema
-- Migration: 20260723_init_schema.sql
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Subcategories Table
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Creator Shops Table
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
    direct_upload_enabled BOOLEAN DEFAULT false,
    followers_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Marketplace Products Table
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
    source_path TEXT NOT NULL, -- Private R2 Key
    software JSONB DEFAULT '[]'::jsonb,
    plugins JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    sales_count INTEGER DEFAULT 0,
    rating_avg NUMERIC(3, 2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Pay-Per-Product Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT,
    billing_name TEXT,
    billing_email TEXT,
    billing_mobile TEXT,
    download_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    template_slug TEXT REFERENCES public.templates(slug),
    creator_shop_id UUID REFERENCES public.creator_shops(id),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Creator Payout Requests Table
CREATE TABLE IF NOT EXISTS public.creator_payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_shop_id UUID REFERENCES public.creator_shops(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'rejected'
    bank_reference_number TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE BUDGET (LCP < 1.5s)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_templates_status_cat_created ON public.templates (status, category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_slug ON public.templates (slug);
CREATE INDEX IF NOT EXISTS idx_creator_shops_slug ON public.creator_shops (slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders (razorpay_order_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_payout_requests ENABLE ROW LEVEL SECURITY;

-- 1. Categories / Subcategories: Public READ
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public subcategories read" ON public.subcategories FOR SELECT USING (true);

-- 2. Creator Shops: Public READ profile, Owner ALL
CREATE POLICY "Public shop profile read" ON public.creator_shops 
    FOR SELECT USING (true);

CREATE POLICY "Creator manage own shop" ON public.creator_shops 
    FOR ALL USING (auth.uid() = user_id);

-- 3. Templates: Public READ approved, Creator ALL own
CREATE POLICY "Public read approved products" ON public.templates 
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Creator manage own templates" ON public.templates 
    FOR ALL USING (
        creator_shop_id IN (
            SELECT id FROM public.creator_shops WHERE user_id = auth.uid()
        )
    );

-- 4. Orders & Order Items: Buyer read own orders
CREATE POLICY "Buyer read own orders" ON public.orders 
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Buyer read own order items" ON public.order_items 
    FOR SELECT USING (
        order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid() OR user_id IS NULL)
    );

-- 5. Creator Payout Requests: Creator own requests
CREATE POLICY "Creator manage payout requests" ON public.creator_payout_requests 
    FOR ALL USING (
        creator_shop_id IN (
            SELECT id FROM public.creator_shops WHERE user_id = auth.uid()
        )
    );
