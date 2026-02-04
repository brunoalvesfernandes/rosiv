-- Tighten RLS policies for characters and guild wars

-- Characters: restrict public visibility to authenticated users only
DROP POLICY IF EXISTS "Anyone can view characters" ON public.characters;
CREATE POLICY "Authenticated users can view characters"
  ON public.characters FOR SELECT
  USING (auth.role() = 'authenticated');

-- Characters: ensure updates are constrained to the owning user
DROP POLICY IF EXISTS "Users can update own character" ON public.characters;
CREATE POLICY "Users can update own character"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Guild wars: only service role can update war records
DROP POLICY IF EXISTS "System can update wars" ON public.guild_wars;
CREATE POLICY "System can update wars"
  ON public.guild_wars FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
