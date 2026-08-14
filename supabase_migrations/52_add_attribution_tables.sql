-- agent-notes: { ctx: "Create visitor_attributions, order_attributions, and subscription_attributions tables", deps: [], state: active, last: "sato@2026-08-14" }
-- ============================================================================
-- 52. CREATE ATTRIBUTION TABLES FOR MARKETPLACE & ORDERS
-- ============================================================================

-- 1. Visitor Attributions (Live tracking & customer touchpoint journey)
CREATE TABLE IF NOT EXISTS public.visitor_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  
  -- First Touch (Immutable Discovery)
  first_source TEXT,
  first_medium TEXT,
  first_campaign TEXT,
  first_content TEXT,
  first_term TEXT,
  first_landing_page TEXT,
  first_referrer TEXT,
  first_product_viewed TEXT,
  first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Last Touch (Most Recent Conversion Driver)
  last_source TEXT,
  last_medium TEXT,
  last_campaign TEXT,
  last_content TEXT,
  last_term TEXT,
  last_landing_page TEXT,
  last_referrer TEXT,
  last_product_viewed TEXT,
  last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  touchpoint_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Order Attributions (Immutable snapshot created when a product order is paid)
CREATE TABLE IF NOT EXISTS public.order_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  checkout_id UUID REFERENCES public.productcheckout(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  total_amount NUMERIC(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  
  -- First Touch Snapshot
  first_source TEXT,
  first_medium TEXT,
  first_campaign TEXT,
  first_content TEXT,
  first_term TEXT,
  first_landing_page TEXT,
  first_referrer TEXT,
  first_product_viewed TEXT,
  first_visit_at TIMESTAMP WITH TIME ZONE,
  
  -- Last Touch Snapshot
  last_source TEXT,
  last_medium TEXT,
  last_campaign TEXT,
  last_content TEXT,
  last_term TEXT,
  last_landing_page TEXT,
  last_referrer TEXT,
  last_product_viewed TEXT,
  last_visit_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Subscription Attributions (For backwards compatibility or subscription checkouts)
CREATE TABLE IF NOT EXISTS public.subscription_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_detail_id UUID REFERENCES public.checkout_details(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_subscription_id TEXT,
  subscription_plan TEXT,
  amount NUMERIC(10, 2),
  currency TEXT DEFAULT 'INR',
  
  -- First Touch Snapshot
  first_source TEXT,
  first_medium TEXT,
  first_campaign TEXT,
  first_content TEXT,
  first_term TEXT,
  first_landing_page TEXT,
  first_referrer TEXT,
  first_product_viewed TEXT,
  first_visit_at TIMESTAMP WITH TIME ZONE,
  
  -- Last Touch Snapshot
  last_source TEXT,
  last_medium TEXT,
  last_campaign TEXT,
  last_content TEXT,
  last_term TEXT,
  last_landing_page TEXT,
  last_referrer TEXT,
  last_product_viewed TEXT,
  last_visit_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.visitor_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_attributions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own visitor attribution" ON public.visitor_attributions;
DROP POLICY IF EXISTS "Users can insert own visitor attribution" ON public.visitor_attributions;
DROP POLICY IF EXISTS "Users can update own visitor attribution" ON public.visitor_attributions;
DROP POLICY IF EXISTS "Service role access visitor_attributions" ON public.visitor_attributions;

DROP POLICY IF EXISTS "Users can view own order attributions" ON public.order_attributions;
DROP POLICY IF EXISTS "Service role access order_attributions" ON public.order_attributions;

DROP POLICY IF EXISTS "Users can view own subscription attributions" ON public.subscription_attributions;
DROP POLICY IF EXISTS "Service role access subscription_attributions" ON public.subscription_attributions;

-- Policies: visitor_attributions
CREATE POLICY "Users can view own visitor attribution"
  ON public.visitor_attributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visitor attribution"
  ON public.visitor_attributions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own visitor attribution"
  ON public.visitor_attributions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role access visitor_attributions"
  ON public.visitor_attributions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Policies: order_attributions
CREATE POLICY "Users can view own order attributions"
  ON public.order_attributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role access order_attributions"
  ON public.order_attributions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Policies: subscription_attributions
CREATE POLICY "Users can view own subscription attributions"
  ON public.subscription_attributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role access subscription_attributions"
  ON public.subscription_attributions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_visitor_attributions_user_id ON public.visitor_attributions(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_attributions_anonymous_id ON public.visitor_attributions(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_visitor_attributions_first_source ON public.visitor_attributions(first_source);
CREATE INDEX IF NOT EXISTS idx_visitor_attributions_last_source ON public.visitor_attributions(last_source);

CREATE INDEX IF NOT EXISTS idx_order_attributions_order_id ON public.order_attributions(order_id);
CREATE INDEX IF NOT EXISTS idx_order_attributions_checkout_id ON public.order_attributions(checkout_id);
CREATE INDEX IF NOT EXISTS idx_order_attributions_user_id ON public.order_attributions(user_id);
CREATE INDEX IF NOT EXISTS idx_order_attributions_created_at ON public.order_attributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_attributions_first_source ON public.order_attributions(first_source);
CREATE INDEX IF NOT EXISTS idx_order_attributions_last_source ON public.order_attributions(last_source);
CREATE INDEX IF NOT EXISTS idx_order_attributions_first_campaign ON public.order_attributions(first_campaign);
CREATE INDEX IF NOT EXISTS idx_order_attributions_last_campaign ON public.order_attributions(last_campaign);

CREATE INDEX IF NOT EXISTS idx_subscription_attributions_user_id ON public.subscription_attributions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_attributions_created_at ON public.subscription_attributions(created_at DESC);
