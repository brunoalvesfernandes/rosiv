-- Fix RLS policy for guild_members to allow leaders/officers to add members when accepting requests
CREATE POLICY "Leaders can add members when accepting requests" 
ON public.guild_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM guild_members gm
    WHERE gm.guild_id = guild_members.guild_id 
    AND gm.user_id = auth.uid() 
    AND gm.role IN ('leader', 'officer')
  )
);

-- Also allow leaders/officers to delete members (kick)
CREATE POLICY "Leaders can remove members" 
ON public.guild_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM guild_members gm
    WHERE gm.guild_id = guild_members.guild_id 
    AND gm.user_id = auth.uid() 
    AND gm.role IN ('leader', 'officer')
  )
  AND user_id != auth.uid() -- Can't kick yourself
);

-- Create VIP clothing system tables
CREATE TABLE public.vip_clothing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('shirt', 'pants', 'hair', 'accessory')),
  image_url TEXT, -- URL for clothing image/pattern
  rarity TEXT NOT NULL DEFAULT 'vip' CHECK (rarity IN ('vip', 'legendary', 'mythic')),
  price_gold INTEGER DEFAULT 0,
  price_premium INTEGER DEFAULT 0, -- For premium currency if needed
  min_level INTEGER DEFAULT 1,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Player's owned VIP clothing
CREATE TABLE public.player_vip_clothing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clothing_id UUID NOT NULL REFERENCES public.vip_clothing(id) ON DELETE CASCADE,
  is_equipped BOOLEAN DEFAULT false,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, clothing_id)
);

-- Enable RLS
ALTER TABLE public.vip_clothing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_vip_clothing ENABLE ROW LEVEL SECURITY;

-- Anyone can view available VIP clothing
CREATE POLICY "Anyone can view vip clothing" 
ON public.vip_clothing 
FOR SELECT 
USING (true);

-- Users can view their own clothing
CREATE POLICY "Users can view own vip clothing" 
ON public.player_vip_clothing 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can acquire VIP clothing
CREATE POLICY "Users can acquire vip clothing" 
ON public.player_vip_clothing 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their equipped status
CREATE POLICY "Users can update own vip clothing" 
ON public.player_vip_clothing 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add vip_shirt_id and vip_pants_id to characters
ALTER TABLE public.characters 
ADD COLUMN vip_shirt_id UUID REFERENCES public.vip_clothing(id),
ADD COLUMN vip_pants_id UUID REFERENCES public.vip_clothing(id),
ADD COLUMN vip_hair_id UUID REFERENCES public.vip_clothing(id);

-- Insert some VIP clothing examples
INSERT INTO public.vip_clothing (name, description, type, image_url, rarity, price_gold) VALUES
('Camisa Naruto', 'Camisa exclusiva com estampa do Naruto', 'shirt', 'https://i.imgur.com/naruto-shirt.png', 'legendary', 5000),
('Camisa Dragon Ball', 'Camisa exclusiva com estampa de Dragon Ball', 'shirt', 'https://i.imgur.com/dbz-shirt.png', 'legendary', 5000),
('Camisa One Piece', 'Camisa do Luffy', 'shirt', 'https://i.imgur.com/onepiece-shirt.png', 'legendary', 5000),
('Calça Real', 'Calça dourada de realeza', 'pants', 'https://i.imgur.com/royal-pants.png', 'mythic', 10000),
('Calça Ninja', 'Calça estilo shinobi', 'pants', 'https://i.imgur.com/ninja-pants.png', 'vip', 3000),
('Cabelo Super Saiyajin', 'Cabelo dourado em chamas', 'hair', 'https://i.imgur.com/ssj-hair.png', 'mythic', 15000),
('Cabelo Akatsuki', 'Cabelo estilo Itachi', 'hair', 'https://i.imgur.com/akatsuki-hair.png', 'legendary', 8000),
('Capa da Akatsuki', 'Capa icônica da organização', 'accessory', 'https://i.imgur.com/akatsuki-cape.png', 'mythic', 20000);