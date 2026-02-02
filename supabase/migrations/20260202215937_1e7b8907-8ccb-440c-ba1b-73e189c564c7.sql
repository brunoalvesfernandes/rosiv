-- Create daily_logins table to track player login streaks and rewards
CREATE TABLE public.daily_logins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  day_streak INTEGER NOT NULL DEFAULT 1,
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  gold_reward INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent multiple logins on same day
CREATE UNIQUE INDEX daily_logins_user_date_idx ON public.daily_logins(user_id, login_date);

-- Enable RLS
ALTER TABLE public.daily_logins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own daily logins"
ON public.daily_logins
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily logins"
ON public.daily_logins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily logins"
ON public.daily_logins
FOR UPDATE
USING (auth.uid() = user_id);