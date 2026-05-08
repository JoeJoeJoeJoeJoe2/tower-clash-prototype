
-- 1) Battle winner immutability + must be a participant
CREATE OR REPLACE FUNCTION public.enforce_battle_winner_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.winner_id IS NOT NULL THEN
    IF NEW.winner_id <> NEW.player1_id AND NEW.winner_id <> NEW.player2_id THEN
      RAISE EXCEPTION 'winner_id must be one of the battle participants';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE'
     AND OLD.winner_id IS NOT NULL
     AND NEW.winner_id IS DISTINCT FROM OLD.winner_id THEN
    RAISE EXCEPTION 'Cannot change winner once set';
  END IF;

  IF TG_OP = 'UPDATE'
     AND OLD.status = 'finished'
     AND NEW.status <> 'finished' THEN
    RAISE EXCEPTION 'Cannot reopen a finished battle';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_battle_winner_integrity_trg ON public.active_battles;
CREATE TRIGGER enforce_battle_winner_integrity_trg
BEFORE UPDATE ON public.active_battles
FOR EACH ROW EXECUTE FUNCTION public.enforce_battle_winner_integrity();

-- 2) clan_messages DELETE policy (author or clan leader/co-leader)
CREATE POLICY "Authors and clan leaders can delete clan messages"
ON public.clan_messages
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR public.get_user_clan_role(auth.uid(), clan_id) = ANY (ARRAY['leader','co-leader'])
);

-- 3) Player name length constraints
ALTER TABLE public.online_players
  ADD CONSTRAINT online_players_player_name_length
  CHECK (char_length(player_name) BETWEEN 1 AND 20);

ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_player_name_length
  CHECK (char_length(player_name) BETWEEN 1 AND 20);

ALTER TABLE public.clan_members
  ADD CONSTRAINT clan_members_player_name_length
  CHECK (char_length(player_name) BETWEEN 1 AND 20);

ALTER TABLE public.clan_messages
  ADD CONSTRAINT clan_messages_player_name_length
  CHECK (char_length(player_name) BETWEEN 1 AND 20);

ALTER TABLE public.battle_requests
  ADD CONSTRAINT battle_requests_from_name_length
  CHECK (char_length(from_player_name) BETWEEN 1 AND 20);

ALTER TABLE public.battle_requests
  ADD CONSTRAINT battle_requests_to_name_length
  CHECK (char_length(to_player_name) BETWEEN 1 AND 20);

ALTER TABLE public.active_battles
  ADD CONSTRAINT active_battles_player1_name_length
  CHECK (char_length(player1_name) BETWEEN 1 AND 20);

ALTER TABLE public.active_battles
  ADD CONSTRAINT active_battles_player2_name_length
  CHECK (char_length(player2_name) BETWEEN 1 AND 20);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_player_name_length
  CHECK (char_length(player_name) BETWEEN 1 AND 20);
