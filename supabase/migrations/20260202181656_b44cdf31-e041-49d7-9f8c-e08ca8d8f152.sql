-- Create dungeons table
CREATE TABLE public.dungeons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  min_players INTEGER NOT NULL DEFAULT 2,
  max_players INTEGER NOT NULL DEFAULT 4,
  boss_name TEXT NOT NULL,
  boss_hp INTEGER NOT NULL,
  boss_strength INTEGER NOT NULL,
  boss_defense INTEGER NOT NULL,
  gold_reward INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  min_level INTEGER NOT NULL DEFAULT 1,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dungeon_runs table (active dungeon sessions)
CREATE TABLE public.dungeon_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dungeon_id UUID NOT NULL REFERENCES public.dungeons(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'waiting',
  current_boss_hp INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dungeon_participants table
CREATE TABLE public.dungeon_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.dungeon_runs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  damage_dealt INTEGER NOT NULL DEFAULT 0,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(run_id, user_id)
);

-- Enable RLS
ALTER TABLE public.dungeons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dungeon_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dungeon_participants ENABLE ROW LEVEL SECURITY;

-- Dungeons policies (read-only for all)
CREATE POLICY "Anyone can view dungeons" ON public.dungeons FOR SELECT USING (true);

-- Dungeon runs policies
CREATE POLICY "Anyone can view dungeon runs" ON public.dungeon_runs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create runs" ON public.dungeon_runs FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Participants can update runs" ON public.dungeon_runs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM dungeon_participants dp WHERE dp.run_id = id AND dp.user_id = auth.uid())
);

-- Dungeon participants policies
CREATE POLICY "Anyone can view participants" ON public.dungeon_participants FOR SELECT USING (true);
CREATE POLICY "Users can join runs" ON public.dungeon_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON public.dungeon_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave runs" ON public.dungeon_participants FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for dungeon runs and participants
ALTER PUBLICATION supabase_realtime ADD TABLE public.dungeon_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dungeon_participants;

-- Insert some default dungeons
INSERT INTO public.dungeons (name, description, min_players, max_players, boss_name, boss_hp, boss_strength, boss_defense, gold_reward, xp_reward, min_level, duration_minutes, icon) VALUES
('Caverna das Sombras', 'Uma caverna escura habitada por um antigo demônio', 2, 4, 'Demônio das Trevas', 500, 25, 15, 500, 300, 5, 20, '🦇'),
('Templo Abandonado', 'Um templo em ruínas guardado por um golem ancestral', 2, 4, 'Golem de Pedra', 800, 35, 25, 800, 500, 10, 25, '🏛️'),
('Floresta Maldita', 'Uma floresta corrompida pelo espírito de uma bruxa', 3, 5, 'Bruxa Anciã', 1200, 45, 20, 1200, 800, 15, 30, '🌲'),
('Fortaleza do Dragão', 'O covil de um dragão vermelho temido por todos', 3, 5, 'Dragão Vermelho', 2000, 60, 40, 2000, 1500, 20, 40, '🐉'),
('Abismo Infernal', 'As profundezas onde habita o Senhor do Caos', 4, 6, 'Senhor do Caos', 3500, 80, 50, 3500, 2500, 25, 50, '🔥');