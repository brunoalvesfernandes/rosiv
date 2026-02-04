-- Update dungeon run update policy to allow creators or participants
DROP POLICY IF EXISTS "Participants can update runs" ON public.dungeon_runs;
DROP POLICY IF EXISTS "Creators can update runs" ON public.dungeon_runs;

CREATE POLICY "Creators or participants can update runs"
ON public.dungeon_runs
FOR UPDATE
USING (
  auth.uid() = created_by
  OR EXISTS (
    SELECT 1 FROM public.dungeon_participants dp
    WHERE dp.run_id = id
    AND dp.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = created_by
  OR EXISTS (
    SELECT 1 FROM public.dungeon_participants dp
    WHERE dp.run_id = id
    AND dp.user_id = auth.uid()
  )
);
