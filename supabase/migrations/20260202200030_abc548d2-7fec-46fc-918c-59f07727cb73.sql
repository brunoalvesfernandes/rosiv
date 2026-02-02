-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.is_admin(auth.uid()));

-- Create pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  rarity TEXT NOT NULL DEFAULT 'common',
  ability_type TEXT NOT NULL, -- 'invisibility', 'heal', 'strength_boost', 'collector', 'shield', 'speed'
  ability_value INTEGER NOT NULL DEFAULT 0, -- effect value (%, seconds, etc)
  ability_cooldown INTEGER NOT NULL DEFAULT 60, -- seconds
  strength_bonus INTEGER NOT NULL DEFAULT 0,
  defense_bonus INTEGER NOT NULL DEFAULT 0,
  agility_bonus INTEGER NOT NULL DEFAULT 0,
  luck_bonus INTEGER NOT NULL DEFAULT 0,
  vitality_bonus INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pets
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Anyone can view pets
CREATE POLICY "Anyone can view pets"
ON public.pets
FOR SELECT
USING (true);

-- Only admins can manage pets
CREATE POLICY "Admins can manage pets"
ON public.pets
FOR ALL
USING (public.is_admin(auth.uid()));

-- Create player_pets table
CREATE TABLE public.player_pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  nickname TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_ability_use TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, pet_id)
);

-- Enable RLS on player_pets
ALTER TABLE public.player_pets ENABLE ROW LEVEL SECURITY;

-- Users can view own pets
CREATE POLICY "Users can view own pets"
ON public.player_pets
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update own pets
CREATE POLICY "Users can update own pets"
ON public.player_pets
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all player pets
CREATE POLICY "Admins can view all player pets"
ON public.player_pets
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admins can manage all player pets
CREATE POLICY "Admins can manage player pets"
ON public.player_pets
FOR ALL
USING (public.is_admin(auth.uid()));

-- Add is_banned column to characters
ALTER TABLE public.characters 
ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN ban_reason TEXT,
ADD COLUMN banned_at TIMESTAMP WITH TIME ZONE;

-- Create admin_logs table for tracking admin actions
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view logs"
ON public.admin_logs
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admins can insert logs
CREATE POLICY "Admins can insert logs"
ON public.admin_logs
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Insert initial pets
INSERT INTO public.pets (name, description, icon, rarity, ability_type, ability_value, ability_cooldown, strength_bonus, defense_bonus, agility_bonus, luck_bonus, vitality_bonus) VALUES
('Lobo das Sombras', 'Um lobo místico que concede invisibilidade temporária ao seu mestre.', '🐺', 'legendary', 'invisibility', 10, 120, 5, 0, 10, 0, 0),
('Fênix Curadora', 'Uma fênix sagrada que cura seu mestre periodicamente.', '🔥', 'legendary', 'heal', 15, 30, 0, 0, 0, 0, 10),
('Urso Guardião', 'Um urso protetor que aumenta a força do mestre.', '🐻', 'epic', 'strength_boost', 20, 60, 15, 5, 0, 0, 5),
('Coruja Sábia', 'Uma coruja mágica que coleta recursos automaticamente.', '🦉', 'epic', 'collector', 5, 300, 0, 0, 5, 15, 0),
('Tartaruga Anciã', 'Uma tartaruga milenar que gera um escudo protetor.', '🐢', 'epic', 'shield', 25, 90, 0, 15, 0, 5, 10),
('Raposa Veloz', 'Uma raposa ágil que aumenta a velocidade de ataque.', '🦊', 'rare', 'speed', 15, 45, 5, 0, 15, 5, 0),
('Dragão Bebê', 'Um pequeno dragão com poder imenso.', '🐉', 'legendary', 'strength_boost', 30, 90, 20, 10, 5, 5, 5),
('Espírito da Floresta', 'Um espírito que cura e protege.', '🌿', 'epic', 'heal', 10, 20, 0, 5, 5, 10, 15),
('Gato Sortudo', 'Um gato que atrai boa sorte e tesouros.', '🐱', 'rare', 'collector', 10, 180, 0, 0, 5, 20, 0),
('Falcão de Guerra', 'Um falcão treinado para a batalha.', '🦅', 'rare', 'speed', 10, 30, 10, 0, 10, 0, 0);

-- Update characters RLS to allow admin updates
CREATE POLICY "Admins can update any character"
ON public.characters
FOR UPDATE
USING (public.is_admin(auth.uid()));