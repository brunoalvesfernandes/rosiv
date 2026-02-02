-- ============================================
-- REALM OF SHADOWS - GAME DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (user data)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CHARACTERS TABLE (game characters)
-- ============================================
CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  current_xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  current_hp INTEGER NOT NULL DEFAULT 100,
  max_hp INTEGER NOT NULL DEFAULT 100,
  current_energy INTEGER NOT NULL DEFAULT 50,
  max_energy INTEGER NOT NULL DEFAULT 50,
  gold INTEGER NOT NULL DEFAULT 100,
  
  -- Base stats
  strength INTEGER NOT NULL DEFAULT 10,
  defense INTEGER NOT NULL DEFAULT 10,
  vitality INTEGER NOT NULL DEFAULT 10,
  agility INTEGER NOT NULL DEFAULT 10,
  luck INTEGER NOT NULL DEFAULT 5,
  
  available_points INTEGER NOT NULL DEFAULT 0,
  
  -- Combat stats
  total_battles INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  missions_completed INTEGER NOT NULL DEFAULT 0,
  arena_points INTEGER NOT NULL DEFAULT 0,
  
  -- Protection
  is_protected BOOLEAN NOT NULL DEFAULT true,
  protection_until TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours'),
  
  last_energy_regen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_hp_regen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Anyone can view characters (for ranking/arena)
CREATE POLICY "Anyone can view characters"
  ON public.characters FOR SELECT
  USING (true);

CREATE POLICY "Users can update own character"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own character"
  ON public.characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- MISSIONS TABLE (available missions)
-- ============================================
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('story', 'daily', 'grind', 'boss')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'boss')),
  min_level INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL,
  gold_reward INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  energy_cost INTEGER NOT NULL DEFAULT 5,
  is_repeatable BOOLEAN NOT NULL DEFAULT true,
  cooldown_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view missions"
  ON public.missions FOR SELECT
  USING (true);

-- ============================================
-- PLAYER MISSIONS TABLE (missions in progress/completed)
-- ============================================
CREATE TABLE public.player_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'failed')) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completes_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.player_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own missions"
  ON public.player_missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions"
  ON public.player_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions"
  ON public.player_missions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TRAINING SESSIONS TABLE
-- ============================================
CREATE TABLE public.training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stat_type TEXT NOT NULL CHECK (stat_type IN ('strength', 'defense', 'vitality', 'agility', 'luck')),
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  energy_cost INTEGER NOT NULL DEFAULT 10,
  stat_gain INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completes_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own training"
  ON public.training_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training"
  ON public.training_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training"
  ON public.training_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- BATTLE LOG TABLE
-- ============================================
CREATE TABLE public.battle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  defender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  defender_npc_name TEXT,
  is_pvp BOOLEAN NOT NULL DEFAULT false,
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attacker_damage INTEGER NOT NULL DEFAULT 0,
  defender_damage INTEGER NOT NULL DEFAULT 0,
  xp_gained INTEGER NOT NULL DEFAULT 0,
  gold_gained INTEGER NOT NULL DEFAULT 0,
  arena_points_change INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.battle_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view battles they participated in"
  ON public.battle_logs FOR SELECT
  USING (auth.uid() = attacker_id OR auth.uid() = defender_id);

CREATE POLICY "Users can insert battles as attacker"
  ON public.battle_logs FOR INSERT
  WITH CHECK (auth.uid() = attacker_id);

-- ============================================
-- NPCs TABLE (monsters for PvE)
-- ============================================
CREATE TABLE public.npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  strength INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  hp INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  gold_reward INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.npcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view NPCs"
  ON public.npcs FOR SELECT
  USING (true);

-- ============================================
-- FUNCTION: Update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNCTION: Create profile and character on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  character_name TEXT;
BEGIN
  -- Extract name from metadata or use email prefix
  character_name := COALESCE(
    NEW.raw_user_meta_data->>'character_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Create profile
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Create character
  INSERT INTO public.characters (user_id, name)
  VALUES (NEW.id, character_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Calculate power level
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_power(
  p_strength INTEGER,
  p_defense INTEGER,
  p_vitality INTEGER,
  p_agility INTEGER,
  p_luck INTEGER,
  p_level INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (p_strength * 3 + p_defense * 2 + p_vitality * 2 + p_agility * 2 + p_luck) * p_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- INSERT DEFAULT MISSIONS
-- ============================================
INSERT INTO public.missions (title, description, category, difficulty, min_level, xp_reward, gold_reward, duration_minutes, energy_cost, is_repeatable, cooldown_minutes) VALUES
-- Grind missions
('Caça aos Lobos', 'Derrote 5 lobos na floresta sombria e traga suas presas como prova.', 'grind', 'easy', 1, 80, 30, 5, 5, true, 5),
('Coleta de Ervas', 'Colete 10 ervas medicinais para o curandeiro da vila.', 'grind', 'easy', 1, 60, 20, 3, 3, true, 3),
('Caça aos Bandidos', 'Elimine 10 bandidos que aterrorizam os viajantes.', 'grind', 'easy', 3, 120, 50, 8, 8, true, 10),
('Patrulha Noturna', 'Patrulhe os arredores da vila durante a noite.', 'grind', 'medium', 5, 200, 80, 15, 12, true, 20),

-- Story missions
('O Início da Jornada', 'Fale com o mestre da guilda e receba sua primeira tarefa oficial.', 'story', 'easy', 1, 150, 50, 5, 5, false, 0),
('O Guardião da Caverna', 'Entre na caverna e derrote o Golem de Pedra.', 'story', 'medium', 5, 350, 120, 15, 15, false, 0),
('Proteção da Vila', 'Defenda a vila de uma horda de goblins.', 'story', 'medium', 8, 500, 200, 20, 20, false, 0),
('Segredos Antigos', 'Explore as ruínas antigas em busca de conhecimento perdido.', 'story', 'hard', 12, 800, 350, 30, 25, false, 0),

-- Daily missions
('Treino Diário', 'Complete uma sessão de treino intensivo.', 'daily', 'easy', 1, 100, 40, 10, 10, true, 1440),
('Arena Diária', 'Participe de uma batalha na arena.', 'daily', 'medium', 5, 200, 80, 5, 8, true, 1440),
('Coleta de Recursos', 'Colete 20 unidades de recursos espalhados pelo mundo.', 'daily', 'easy', 1, 80, 35, 10, 8, true, 1440),

-- Boss missions
('O Necromante', 'Encontre e derrote o Necromante na cripta abandonada.', 'boss', 'hard', 10, 1000, 400, 30, 30, true, 10080),
('O Dragão Ancião', 'Desafie o Dragão Ancião em seu covil.', 'boss', 'boss', 20, 3000, 1000, 60, 50, true, 10080),
('O Rei Lich', 'Enfrente o temível Rei Lich em sua fortaleza sombria.', 'boss', 'boss', 30, 5000, 2000, 90, 50, true, 10080);

-- ============================================
-- INSERT DEFAULT NPCs
-- ============================================
INSERT INTO public.npcs (name, level, strength, defense, hp, xp_reward, gold_reward) VALUES
('Goblin Fraco', 3, 8, 5, 30, 25, 10),
('Lobo Selvagem', 5, 12, 8, 50, 40, 15),
('Goblin Guerreiro', 8, 18, 12, 80, 70, 30),
('Orc Berserker', 12, 25, 18, 120, 120, 50),
('Esqueleto Cavaleiro', 15, 30, 25, 150, 180, 80),
('Ogro', 18, 40, 30, 200, 250, 120),
('Demônio Menor', 22, 50, 35, 280, 350, 180),
('Cavaleiro Negro', 28, 65, 50, 400, 500, 280),
('Dragão Jovem', 35, 85, 65, 600, 800, 450),
('Senhor das Sombras', 45, 120, 90, 1000, 1500, 800);