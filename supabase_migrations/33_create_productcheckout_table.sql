-- agent-notes: { ctx: "Create productcheckout table with RLS and indexes", deps: [], state: active, last: "antigravity@2026-08-13" }
-- ============================================================================
-- 33. CREATE PRODUCTCHECKOUT TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.productcheckout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  billing_name TEXT NOT NULL,
  billing_email TEXT NOT NULL,
  billing_mobile TEXT NOT NULL,
  billing_company TEXT,
  cart_items JSONB DEFAULT '[]'::JSONB,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'initiated', -- 'initiated', 'completed', 'failed'
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.productcheckout ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own product checkouts" ON public.productcheckout;
DROP POLICY IF EXISTS "Users can insert their own product checkouts" ON public.productcheckout;
DROP POLICY IF EXISTS "Users can update their own product checkouts" ON public.productcheckout;
DROP POLICY IF EXISTS "Service role can access productcheckout" ON public.productcheckout;

-- Policies
CREATE POLICY "Users can view their own product checkouts"
  ON public.productcheckout
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product checkouts"
  ON public.productcheckout
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product checkouts"
  ON public.productcheckout
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can access productcheckout"
  ON public.productcheckout
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_productcheckout_user_id ON public.productcheckout(user_id);
CREATE INDEX IF NOT EXISTS idx_productcheckout_status ON public.productcheckout(status);
CREATE INDEX IF NOT EXISTS idx_productcheckout_created_at ON public.productcheckout(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_productcheckout_razorpay_order_id ON public.productcheckout(razorpay_order_id);

-- Comments
COMMENT ON TABLE public.productcheckout IS 'Tracks all product checkout attempts including initiated, completed, and failed checkouts';
COMMENT ON COLUMN public.productcheckout.status IS 'Status: initiated, completed, failed';
COMMENT ON COLUMN public.productcheckout.cart_items IS 'JSON array of cart items for product checkouts';
