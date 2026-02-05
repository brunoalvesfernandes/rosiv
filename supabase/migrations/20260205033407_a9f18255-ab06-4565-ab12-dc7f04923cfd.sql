-- Add column to store the layered avatar customization JSON
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS avatar_customization TEXT DEFAULT NULL;

-- Comment explaining the column
COMMENT ON COLUMN public.characters.avatar_customization IS 'JSON string containing the layered avatar customization (body, eyes, hair, top, bottom, accessory with their colors)';