
-- Create enum for character classes
CREATE TYPE public.character_class AS ENUM ('warrior', 'mage', 'archer');

-- Add class to characters table
ALTER TABLE public.characters 
ADD COLUMN class character_class DEFAULT 'warrior';

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_global BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guild wars table
CREATE TABLE public.guild_wars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attacker_guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  defender_guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  attacker_score INTEGER NOT NULL DEFAULT 0,
  defender_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  winner_guild_id UUID REFERENCES public.guilds(id),
  gold_reward INTEGER NOT NULL DEFAULT 1000,
  xp_reward INTEGER NOT NULL DEFAULT 500
);

-- Create war battles log
CREATE TABLE public.war_battles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  war_id UUID NOT NULL REFERENCES public.guild_wars(id) ON DELETE CASCADE,
  attacker_id UUID NOT NULL,
  defender_id UUID NOT NULL,
  winner_id UUID,
  attacker_damage INTEGER NOT NULL DEFAULT 0,
  defender_damage INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_wars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.war_battles ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
CREATE POLICY "Anyone can view global messages" ON public.chat_messages
  FOR SELECT USING (is_global = true);

CREATE POLICY "Guild members can view guild messages" ON public.chat_messages
  FOR SELECT USING (
    is_global = false AND
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = chat_messages.guild_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Guild wars policies
CREATE POLICY "Anyone can view guild wars" ON public.guild_wars
  FOR SELECT USING (true);

CREATE POLICY "Guild leaders can declare war" ON public.guild_wars
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = attacker_guild_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'leader'
    )
  );

CREATE POLICY "System can update wars" ON public.guild_wars
  FOR UPDATE USING (true);

-- War battles policies
CREATE POLICY "Anyone can view war battles" ON public.war_battles
  FOR SELECT USING (true);

CREATE POLICY "War participants can create battles" ON public.war_battles
  FOR INSERT WITH CHECK (auth.uid() = attacker_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
