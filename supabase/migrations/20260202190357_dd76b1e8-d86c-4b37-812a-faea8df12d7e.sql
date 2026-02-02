-- Add clothing customization columns
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS shirt_color text NOT NULL DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS pants_color text NOT NULL DEFAULT '#1e3a5f',
ADD COLUMN IF NOT EXISTS shoes_color text NOT NULL DEFAULT '#4a3728';