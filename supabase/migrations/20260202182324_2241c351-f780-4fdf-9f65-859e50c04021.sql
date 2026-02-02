-- Create materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  icon TEXT,
  drop_source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  result_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  crafting_time_minutes INTEGER NOT NULL DEFAULT 5,
  required_level INTEGER NOT NULL DEFAULT 1,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipe_materials junction table
CREATE TABLE public.recipe_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity_required INTEGER NOT NULL DEFAULT 1,
  UNIQUE(recipe_id, material_id)
);

-- Create player_materials table
CREATE TABLE public.player_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, material_id)
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  gold_reward INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_achievements table
CREATE TABLE public.player_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claimed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;

-- Materials policies (read-only for all)
CREATE POLICY "Anyone can view materials" ON public.materials FOR SELECT USING (true);

-- Recipes policies (read-only for all)
CREATE POLICY "Anyone can view recipes" ON public.recipes FOR SELECT USING (true);

-- Recipe materials policies (read-only for all)
CREATE POLICY "Anyone can view recipe materials" ON public.recipe_materials FOR SELECT USING (true);

-- Player materials policies
CREATE POLICY "Users can view own materials" ON public.player_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own materials" ON public.player_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own materials" ON public.player_materials FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies (read-only for all)
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- Player achievements policies
CREATE POLICY "Users can view own achievements" ON public.player_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.player_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON public.player_achievements FOR UPDATE USING (auth.uid() = user_id);

-- Insert default materials
INSERT INTO public.materials (name, description, rarity, icon, drop_source) VALUES
('Minério de Ferro', 'Minério comum usado para forjar armas básicas', 'common', '�ite', 'Missões de exploração'),
('Couro Curtido', 'Couro processado de criaturas', 'common', '🧶', 'Derrotar criaturas na arena'),
('Cristal Mágico', 'Fragmento de energia arcana concentrada', 'uncommon', '💎', 'Masmorras'),
('Escamas de Dragão', 'Escamas resistentes de dragões menores', 'rare', '🐉', 'Boss de masmorra'),
('Essência Sombria', 'Energia concentrada das trevas', 'epic', '🌑', 'Boss final'),
('Pó de Estrela', 'Poeira cósmica rara e poderosa', 'legendary', '✨', 'Evento especial'),
('Tecido Élfico', 'Tecido mágico dos elfos antigos', 'uncommon', '🧵', 'Missões difíceis'),
('Osso de Titã', 'Fragmento ósseo de criaturas colossais', 'rare', '🦴', 'Arena PvP'),
('Rubi Flamejante', 'Gema imbuída com fogo eterno', 'epic', '❤️‍🔥', 'Masmorras de fogo'),
('Lágrima de Fênix', 'Lágrima cristalizada de uma fênix', 'legendary', '🔥', 'Evento raro');

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, gold_reward, xp_reward) VALUES
-- Level achievements
('Primeiro Passo', 'Alcance o nível 5', '🌟', 'level', 'level', 5, 100, 50),
('Aventureiro', 'Alcance o nível 10', '⭐', 'level', 'level', 10, 250, 150),
('Veterano', 'Alcance o nível 20', '🌠', 'level', 'level', 20, 500, 300),
('Lenda Viva', 'Alcance o nível 30', '👑', 'level', 'level', 30, 1000, 600),
('Mestre Supremo', 'Alcance o nível 50', '🏆', 'level', 'level', 50, 2500, 1500),

-- Combat achievements
('Primeiro Sangue', 'Vença sua primeira batalha', '⚔️', 'combat', 'wins', 1, 50, 25),
('Guerreiro Nato', 'Vença 10 batalhas', '🗡️', 'combat', 'wins', 10, 150, 100),
('Campeão da Arena', 'Vença 50 batalhas', '🏅', 'combat', 'wins', 50, 400, 250),
('Invencível', 'Vença 100 batalhas', '💪', 'combat', 'wins', 100, 800, 500),
('Deus da Guerra', 'Vença 500 batalhas', '⚡', 'combat', 'wins', 500, 2000, 1200),

-- Mission achievements
('Explorador Iniciante', 'Complete 5 missões', '🗺️', 'missions', 'missions_completed', 5, 75, 40),
('Caçador de Recompensas', 'Complete 25 missões', '🎯', 'missions', 'missions_completed', 25, 200, 125),
('Mercenário Experiente', 'Complete 50 missões', '📜', 'missions', 'missions_completed', 50, 450, 275),
('Herói do Reino', 'Complete 100 missões', '🦸', 'missions', 'missions_completed', 100, 900, 550),

-- Gold achievements
('Poupador', 'Acumule 1.000 de ouro', '💰', 'wealth', 'gold', 1000, 100, 50),
('Rico', 'Acumule 10.000 de ouro', '💎', 'wealth', 'gold', 10000, 500, 250),
('Magnata', 'Acumule 50.000 de ouro', '🏦', 'wealth', 'gold', 50000, 1500, 750),
('Lendário Mercador', 'Acumule 100.000 de ouro', '👑', 'wealth', 'gold', 100000, 3000, 1500),

-- Arena points achievements
('Gladiador Novato', 'Alcance 100 pontos de arena', '🥉', 'arena', 'arena_points', 100, 150, 75),
('Gladiador Experiente', 'Alcance 500 pontos de arena', '🥈', 'arena', 'arena_points', 500, 400, 200),
('Gladiador Elite', 'Alcance 1000 pontos de arena', '🥇', 'arena', 'arena_points', 1000, 800, 400),
('Campeão Supremo', 'Alcance 5000 pontos de arena', '🏆', 'arena', 'arena_points', 5000, 2000, 1000);