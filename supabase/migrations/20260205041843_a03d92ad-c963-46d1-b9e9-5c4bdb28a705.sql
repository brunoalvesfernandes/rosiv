-- Tabela para rastrear compras VIP com PIX
CREATE TABLE public.vip_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clothing_id UUID NOT NULL REFERENCES public.vip_clothing(id),
  amount_cents INTEGER NOT NULL,
  payment_id TEXT,
  qr_code TEXT,
  qr_code_base64 TEXT,
  pix_copy_paste TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.vip_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own purchases"
ON public.vip_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own purchases
CREATE POLICY "Users can create their own purchases"
ON public.vip_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_vip_purchases_user_id ON public.vip_purchases(user_id);
CREATE INDEX idx_vip_purchases_payment_id ON public.vip_purchases(payment_id);
CREATE INDEX idx_vip_purchases_status ON public.vip_purchases(status);

-- Add price column to vip_clothing for real money (in cents BRL)
ALTER TABLE public.vip_clothing ADD COLUMN IF NOT EXISTS price_brl_cents INTEGER DEFAULT 500;