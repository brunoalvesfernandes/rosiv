
-- Create enum for guild roles
CREATE TYPE public.guild_role AS ENUM ('leader', 'officer', 'member');

-- Create guilds table
CREATE TABLE public.guilds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  leader_id UUID NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  max_members INTEGER NOT NULL DEFAULT 10,
  gold_bank INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guild members table
CREATE TABLE public.guild_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role guild_role NOT NULL DEFAULT 'member',
  contribution INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create guild join requests table
CREATE TABLE public.guild_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(guild_id, user_id)
);

-- Enable RLS
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_requests ENABLE ROW LEVEL SECURITY;

-- Guilds policies
CREATE POLICY "Anyone can view guilds" ON public.guilds
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create guilds" ON public.guilds
  FOR INSERT WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Leaders can update their guild" ON public.guilds
  FOR UPDATE USING (auth.uid() = leader_id);

CREATE POLICY "Leaders can delete their guild" ON public.guilds
  FOR DELETE USING (auth.uid() = leader_id);

-- Guild members policies
CREATE POLICY "Anyone can view guild members" ON public.guild_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join guilds" ON public.guild_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave guilds" ON public.guild_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Leaders and officers can manage members" ON public.guild_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = guild_members.guild_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('leader', 'officer')
    )
  );

-- Guild requests policies
CREATE POLICY "Guild members can view requests" ON public.guild_requests
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = guild_requests.guild_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('leader', 'officer')
    )
  );

CREATE POLICY "Users can create join requests" ON public.guild_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own requests" ON public.guild_requests
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Leaders can manage requests" ON public.guild_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.guild_members gm
      WHERE gm.guild_id = guild_requests.guild_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('leader', 'officer')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_guilds_updated_at
  BEFORE UPDATE ON public.guilds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
