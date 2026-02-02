-- Add character customization columns
ALTER TABLE public.characters
ADD COLUMN hair_style text NOT NULL DEFAULT 'short',
ADD COLUMN hair_color text NOT NULL DEFAULT '#4a3728',
ADD COLUMN eye_color text NOT NULL DEFAULT '#3b82f6',
ADD COLUMN skin_tone text NOT NULL DEFAULT '#e0ac69',
ADD COLUMN face_style text NOT NULL DEFAULT 'round',
ADD COLUMN accessory text DEFAULT NULL;