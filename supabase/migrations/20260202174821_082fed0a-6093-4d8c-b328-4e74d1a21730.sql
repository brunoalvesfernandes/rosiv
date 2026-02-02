-- Add mana to characters
ALTER TABLE public.characters 
ADD COLUMN current_mana INTEGER NOT NULL DEFAULT 30,
ADD COLUMN max_mana INTEGER NOT NULL DEFAULT 30,
ADD COLUMN last_mana_regen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create items table
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'weapon', 'armor', 'helmet', 'boots', 'accessory', 'potion'
  rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'uncommon', 'rare', 'epic', 'legendary'
  price INTEGER NOT NULL,
  -- Stats bonuses for equipment
  strength_bonus INTEGER NOT NULL DEFAULT 0,
  defense_bonus INTEGER NOT NULL DEFAULT 0,
  vitality_bonus INTEGER NOT NULL DEFAULT 0,
  agility_bonus INTEGER NOT NULL DEFAULT 0,
  luck_bonus INTEGER NOT NULL DEFAULT 0,
  mana_bonus INTEGER NOT NULL DEFAULT 0,
  -- For potions
  hp_restore INTEGER NOT NULL DEFAULT 0,
  energy_restore INTEGER NOT NULL DEFAULT 0,
  mana_restore INTEGER NOT NULL DEFAULT 0,
  -- Requirements
  min_level INTEGER NOT NULL DEFAULT 1,
  is_consumable BOOLEAN NOT NULL DEFAULT false,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player inventory
CREATE TABLE public.player_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;

-- Items policies (read-only for all)
CREATE POLICY "Anyone can view items" ON public.items FOR SELECT USING (true);

-- Inventory policies
CREATE POLICY "Users can view own inventory" ON public.player_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory" ON public.player_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON public.player_inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory" ON public.player_inventory FOR DELETE USING (auth.uid() = user_id);

-- Insert default items
-- WEAPONS
INSERT INTO public.items (name, description, type, rarity, price, strength_bonus, min_level, icon) VALUES
('Espada de Madeira', 'Uma espada simples de treinamento.', 'weapon', 'common', 50, 2, 1, 'sword'),
('Espada de Ferro', 'Uma espada básica de ferro bem forjada.', 'weapon', 'common', 150, 5, 3, 'sword'),
('Espada de Aço', 'Uma lâmina afiada de aço temperado.', 'weapon', 'uncommon', 400, 10, 5, 'sword'),
('Lâmina do Caçador', 'Espada usada por caçadores veteranos.', 'weapon', 'rare', 1000, 18, 10, 'sword'),
('Excalibur', 'A lendária espada dos reis.', 'weapon', 'legendary', 5000, 35, 20, 'sword'),
('Cajado de Aprendiz', 'Um cajado básico para iniciantes em magia.', 'weapon', 'common', 60, 1, 1, 'wand'),
('Cajado Arcano', 'Canaliza energia mágica com eficiência.', 'weapon', 'uncommon', 450, 3, 5, 'wand'),
('Cajado do Mago', 'Um poderoso cajado mágico.', 'weapon', 'rare', 1200, 8, 10, 'wand');

-- ARMORS
INSERT INTO public.items (name, description, type, rarity, price, defense_bonus, min_level, icon) VALUES
('Roupa de Couro', 'Vestimenta leve de couro curtido.', 'armor', 'common', 40, 2, 1, 'shirt'),
('Armadura de Couro', 'Proteção básica feita de couro reforçado.', 'armor', 'common', 120, 5, 3, 'shirt'),
('Cota de Malha', 'Armadura de anéis de metal entrelaçados.', 'armor', 'uncommon', 350, 10, 5, 'shirt'),
('Armadura de Placas', 'Proteção completa de placas de aço.', 'armor', 'rare', 900, 18, 10, 'shirt'),
('Robe do Aprendiz', 'Robe simples com leve proteção mágica.', 'armor', 'common', 45, 1, 1, 'shirt'),
('Manto Arcano', 'Manto encantado que amplifica a magia.', 'armor', 'uncommon', 380, 4, 5, 'shirt');

-- HELMETS
INSERT INTO public.items (name, description, type, rarity, price, defense_bonus, vitality_bonus, min_level, icon) VALUES
('Capuz de Couro', 'Um capuz simples de proteção.', 'helmet', 'common', 30, 1, 0, 1, 'crown'),
('Elmo de Ferro', 'Elmo básico de ferro.', 'helmet', 'common', 100, 3, 5, 3, 'crown'),
('Elmo de Cavaleiro', 'Elmo completo de cavaleiro.', 'helmet', 'uncommon', 300, 6, 10, 5, 'crown'),
('Coroa do Campeão', 'Uma coroa que inspira respeito.', 'helmet', 'rare', 800, 10, 20, 10, 'crown');

-- BOOTS
INSERT INTO public.items (name, description, type, rarity, price, agility_bonus, min_level, icon) VALUES
('Botas de Couro', 'Botas leves e confortáveis.', 'boots', 'common', 35, 2, 1, 'footprints'),
('Botas de Viajante', 'Botas resistentes para longas jornadas.', 'boots', 'common', 110, 4, 3, 'footprints'),
('Botas do Vento', 'Botas encantadas com magia do vento.', 'boots', 'uncommon', 320, 8, 5, 'footprints'),
('Botas da Sombra', 'Permitem movimentos silenciosos.', 'boots', 'rare', 850, 15, 10, 'footprints');

-- ACCESSORIES
INSERT INTO public.items (name, description, type, rarity, price, luck_bonus, mana_bonus, min_level, icon) VALUES
('Amuleto da Sorte', 'Aumenta levemente sua sorte.', 'accessory', 'common', 80, 3, 0, 1, 'gem'),
('Anel de Mana', 'Aumenta sua capacidade de mana.', 'accessory', 'common', 90, 0, 10, 1, 'gem'),
('Colar de Proteção', 'Oferece proteção mística.', 'accessory', 'uncommon', 400, 5, 15, 5, 'gem'),
('Anel do Arquimago', 'Anel que aumenta drasticamente a mana.', 'accessory', 'rare', 1100, 2, 40, 10, 'gem'),
('Amuleto do Destino', 'Um amuleto lendário de sorte.', 'accessory', 'legendary', 3000, 20, 25, 15, 'gem');

-- POTIONS
INSERT INTO public.items (name, description, type, rarity, price, hp_restore, energy_restore, mana_restore, is_consumable, min_level, icon) VALUES
('Poção de Vida Menor', 'Restaura 30 pontos de vida.', 'potion', 'common', 20, 30, 0, 0, true, 1, 'flask-round'),
('Poção de Vida', 'Restaura 60 pontos de vida.', 'potion', 'uncommon', 50, 60, 0, 0, true, 5, 'flask-round'),
('Poção de Vida Maior', 'Restaura 120 pontos de vida.', 'potion', 'rare', 120, 120, 0, 0, true, 10, 'flask-round'),
('Poção de Energia', 'Restaura 20 pontos de energia.', 'potion', 'common', 25, 0, 20, 0, true, 1, 'flask-round'),
('Poção de Energia Maior', 'Restaura 40 pontos de energia.', 'potion', 'uncommon', 60, 0, 40, 0, true, 5, 'flask-round'),
('Poção de Mana Menor', 'Restaura 15 pontos de mana.', 'potion', 'common', 20, 0, 0, 15, true, 1, 'flask-round'),
('Poção de Mana', 'Restaura 30 pontos de mana.', 'potion', 'uncommon', 50, 0, 0, 30, true, 5, 'flask-round'),
('Elixir Completo', 'Restaura vida, energia e mana.', 'potion', 'epic', 200, 80, 30, 25, true, 10, 'flask-round');