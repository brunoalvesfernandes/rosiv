-- Table for private messages between players
CREATE TABLE public.private_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track online players
CREATE TABLE public.player_presence (
  user_id UUID NOT NULL PRIMARY KEY,
  character_name TEXT NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_presence ENABLE ROW LEVEL SECURITY;

-- RLS policies for private messages
CREATE POLICY "Users can view their own messages"
ON public.private_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON public.private_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read"
ON public.private_messages
FOR UPDATE
USING (auth.uid() = receiver_id);

-- RLS policies for player presence
CREATE POLICY "Anyone can view online players"
ON public.player_presence
FOR SELECT
USING (true);

CREATE POLICY "Users can update own presence"
ON public.player_presence
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_presence;

-- Add constraint for message length to prevent huge texts
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_message_length CHECK (char_length(message) <= 500);
ALTER TABLE public.private_messages ADD CONSTRAINT private_message_length CHECK (char_length(message) <= 500);