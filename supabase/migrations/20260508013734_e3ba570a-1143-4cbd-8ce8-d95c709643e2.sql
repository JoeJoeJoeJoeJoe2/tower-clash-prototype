
DROP POLICY IF EXISTS "Authenticated users can view online players" ON public.online_players_public;
CREATE POLICY "Authenticated users can view online players"
ON public.online_players_public
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);
