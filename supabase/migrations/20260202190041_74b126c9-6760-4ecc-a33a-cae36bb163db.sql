-- Add avatar_id column (replaces the old customization system)
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS avatar_id text NOT NULL DEFAULT 'warrior-1';