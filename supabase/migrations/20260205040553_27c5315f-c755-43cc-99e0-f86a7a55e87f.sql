-- Add vip_accessory_id column to characters table
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS vip_accessory_id UUID REFERENCES public.vip_clothing(id);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';