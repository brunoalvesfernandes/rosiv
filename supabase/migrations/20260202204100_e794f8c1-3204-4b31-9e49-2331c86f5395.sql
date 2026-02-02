-- Create pickaxes table for different pickaxe types
CREATE TABLE public.pickaxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '⛏️',
  rarity TEXT NOT NULL DEFAULT 'common',
  max_durability INTEGER NOT NULL DEFAULT 100,
  mining_power INTEGER NOT NULL DEFAULT 1,
  price INTEGER DEFAULT NULL,
  is_craftable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_pickaxes to track player owned pickaxes
CREATE TABLE public.player_pickaxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pickaxe_id UUID NOT NULL REFERENCES public.pickaxes(id),
  current_durability INTEGER NOT NULL,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mining_nodes table for different types of blocks to mine
CREATE TABLE public.mining_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '🪨',
  hp INTEGER NOT NULL DEFAULT 10,
  required_mining_power INTEGER NOT NULL DEFAULT 1,
  tier INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mining_drops to define what materials drop from which nodes
CREATE TABLE public.mining_drops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID NOT NULL REFERENCES public.mining_nodes(id),
  material_id UUID NOT NULL REFERENCES public.materials(id),
  drop_chance DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  min_quantity INTEGER NOT NULL DEFAULT 1,
  max_quantity INTEGER NOT NULL DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.pickaxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_pickaxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mining_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mining_drops ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pickaxes (anyone can view)
CREATE POLICY "Anyone can view pickaxes" ON public.pickaxes FOR SELECT USING (true);

-- RLS Policies for player_pickaxes
CREATE POLICY "Users can view own pickaxes" ON public.player_pickaxes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pickaxes" ON public.player_pickaxes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pickaxes" ON public.player_pickaxes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pickaxes" ON public.player_pickaxes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for mining_nodes (anyone can view)
CREATE POLICY "Anyone can view mining nodes" ON public.mining_nodes FOR SELECT USING (true);

-- RLS Policies for mining_drops (anyone can view)
CREATE POLICY "Anyone can view mining drops" ON public.mining_drops FOR SELECT USING (true);

-- Insert starter pickaxes
INSERT INTO public.pickaxes (name, description, icon, rarity, max_durability, mining_power, price, is_craftable) VALUES
('Picareta de Madeira', 'Uma picareta básica feita de madeira. Frágil mas funcional.', '🪓', 'common', 50, 1, 100, false),
('Picareta de Pedra', 'Picareta resistente feita de pedra afiada.', '⛏️', 'common', 100, 2, 300, false),
('Picareta de Ferro', 'Picareta durável de ferro forjado.', '⚒️', 'uncommon', 200, 3, 800, true),
('Picareta de Ouro', 'Picareta rápida mas frágil de ouro puro.', '🔱', 'rare', 150, 5, 2000, true),
('Picareta de Diamante', 'A picareta definitiva. Quase indestrutível.', '💎', 'epic', 500, 8, 5000, true),
('Picareta Lendária', 'Forjada nas profundezas do submundo.', '🌟', 'legendary', 1000, 15, NULL, true);

-- Insert mining nodes
INSERT INTO public.mining_nodes (name, description, icon, hp, required_mining_power, tier) VALUES
('Pedra Comum', 'Um bloco de pedra simples.', '🪨', 5, 1, 1),
('Minério de Cobre', 'Contém fragmentos de cobre.', '🟤', 10, 1, 1),
('Minério de Ferro', 'Rico em ferro.', '⬛', 15, 2, 2),
('Minério de Prata', 'Brilha com um tom prateado.', '⬜', 20, 3, 2),
('Minério de Ouro', 'Valioso minério dourado.', '🟡', 30, 4, 3),
('Cristal Mágico', 'Pulsa com energia mística.', '💠', 40, 5, 3),
('Minério de Diamante', 'O mais precioso dos minérios.', '💎', 50, 6, 4),
('Pedra Sombria', 'Emanações de energia obscura.', '🖤', 75, 8, 5),
('Núcleo Elemental', 'Essência pura de um elemento.', '🔮', 100, 10, 5);

-- Insert repair item to items table
INSERT INTO public.items (name, description, type, icon, rarity, price, is_consumable) VALUES
('Kit de Reparo', 'Restaura 50 de durabilidade da picareta equipada.', 'consumable', '🔧', 'common', 50, true),
('Kit de Reparo Avançado', 'Restaura 150 de durabilidade da picareta equipada.', 'consumable', '🛠️', 'uncommon', 150, true);