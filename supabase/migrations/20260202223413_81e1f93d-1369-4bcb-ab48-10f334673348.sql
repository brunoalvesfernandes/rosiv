-- Add hunger/happiness system to player_pets
ALTER TABLE public.player_pets
ADD COLUMN hunger integer NOT NULL DEFAULT 100,
ADD COLUMN happiness integer NOT NULL DEFAULT 100,
ADD COLUMN last_fed timestamp with time zone DEFAULT now();

-- Create pet_foods table
CREATE TABLE public.pet_foods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT '🍖',
  hunger_restore integer NOT NULL DEFAULT 20,
  happiness_restore integer NOT NULL DEFAULT 10,
  price integer NOT NULL DEFAULT 50,
  rarity text NOT NULL DEFAULT 'common',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on pet_foods
ALTER TABLE public.pet_foods ENABLE ROW LEVEL SECURITY;

-- Anyone can view pet foods
CREATE POLICY "Anyone can view pet foods"
ON public.pet_foods
FOR SELECT
USING (true);

-- Insert some default pet foods
INSERT INTO public.pet_foods (name, description, icon, hunger_restore, happiness_restore, price, rarity) VALUES
('Ração Comum', 'Ração básica para pets. Restaura um pouco de fome.', '🍖', 20, 5, 30, 'common'),
('Ração Premium', 'Ração de qualidade superior. Restaura mais fome e deixa o pet feliz.', '🥩', 40, 15, 80, 'uncommon'),
('Petisco Especial', 'Um petisco delicioso que os pets adoram!', '🍗', 30, 30, 100, 'uncommon'),
('Banquete Real', 'A melhor comida para pets. Restaura completamente fome e felicidade.', '🦴', 100, 100, 300, 'epic'),
('Frutas Mágicas', 'Frutas encantadas que dão energia extra ao pet.', '🍎', 25, 20, 60, 'uncommon');

-- Create player_pet_foods inventory table
CREATE TABLE public.player_pet_foods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  food_id uuid NOT NULL REFERENCES public.pet_foods(id),
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, food_id)
);

-- Enable RLS on player_pet_foods
ALTER TABLE public.player_pet_foods ENABLE ROW LEVEL SECURITY;

-- Users can view their own pet foods
CREATE POLICY "Users can view own pet foods"
ON public.player_pet_foods
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own pet foods
CREATE POLICY "Users can insert own pet foods"
ON public.player_pet_foods
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pet foods
CREATE POLICY "Users can update own pet foods"
ON public.player_pet_foods
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own pet foods
CREATE POLICY "Users can delete own pet foods"
ON public.player_pet_foods
FOR DELETE
USING (auth.uid() = user_id);