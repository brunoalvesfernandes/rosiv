-- Allow dungeon run creators to update their runs
CREATE POLICY "Creators can update runs"
ON public.dungeon_runs
FOR UPDATE
USING (auth.uid() = created_by);
