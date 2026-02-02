-- Create storage bucket for music files
INSERT INTO storage.buckets (id, name, public) VALUES ('game-music', 'game-music', true);

-- Storage policies for game-music bucket
CREATE POLICY "Anyone can view music" ON storage.objects FOR SELECT USING (bucket_id = 'game-music');

CREATE POLICY "Admins can upload music" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'game-music' AND is_admin(auth.uid())
);

CREATE POLICY "Admins can delete music" ON storage.objects FOR DELETE USING (
  bucket_id = 'game-music' AND is_admin(auth.uid())
);

CREATE POLICY "Admins can update music" ON storage.objects FOR UPDATE USING (
  bucket_id = 'game-music' AND is_admin(auth.uid())
);

-- Create table for area music configuration
CREATE TABLE public.area_music (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name text NOT NULL UNIQUE,
  area_label text NOT NULL,
  music_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.area_music ENABLE ROW LEVEL SECURITY;

-- Anyone can view area music config
CREATE POLICY "Anyone can view area music" ON public.area_music FOR SELECT USING (true);

-- Only admins can manage area music
CREATE POLICY "Admins can manage area music" ON public.area_music FOR ALL USING (is_admin(auth.uid()));

-- Insert default areas without music
INSERT INTO public.area_music (area_name, area_label) VALUES 
  ('arena', 'Arena'),
  ('dungeon', 'Masmorras'),
  ('mission', 'Missões'),
  ('guild_war', 'Guerra de Guildas'),
  ('training', 'Treinamento'),
  ('pets', 'Pets'),
  ('shop', 'Loja'),
  ('crafting', 'Forja'),
  ('dashboard', 'Dashboard');

-- Trigger for updated_at
CREATE TRIGGER update_area_music_updated_at
BEFORE UPDATE ON public.area_music
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();