import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Public view interface (excludes user_id for security)
export interface OnlinePlayer {
  id: string;
  player_name: string;
  banner_id: string;
  trophies: number;
  level: number;
  is_online: boolean;
  last_seen: string;
}

export function useOnlinePresence(
  user: User | null,
  playerName: string,
  bannerId: string,
  trophies: number,
  level: number
) {
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  // Register/update online status (uses base table - user owns their row)
  const updatePresence = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('online_players')
      .upsert({
        user_id: user.id,
        player_name: playerName,
        banner_id: bannerId,
        trophies,
        level,
        is_online: true,
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (data && !error) {
      setMyPlayerId(data.id);
    }
  }, [user, playerName, bannerId, trophies, level]);

  // Go offline (uses base table - user owns their row)
  const goOffline = useCallback(async () => {
    if (!user) return;

    await supabase
      .from('online_players')
      .update({ is_online: false })
      .eq('user_id', user.id);
  }, [user]);

  // Fetch online players using the public view (excludes user_id)
  const fetchOnlinePlayers = useCallback(async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    // Use the public view that doesn't expose user_id
    const { data, error } = await supabase
      .from('online_players_public')
      .select('*')
      .eq('is_online', true)
      .gte('last_seen', fiveMinutesAgo)
      .order('trophies', { ascending: false });

    if (data && !error) {
      // Filter out self by matching on myPlayerId
      setOnlinePlayers(data as OnlinePlayer[]);
    }
  }, []);

  // Set up presence and subscriptions
  useEffect(() => {
    if (!user) return;

    // Initial presence update
    updatePresence();
    fetchOnlinePlayers();

    // Heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      updatePresence();
    }, 30000);

    // Subscribe to online_players changes
    const channel = supabase
      .channel('online_players_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'online_players'
        },
        () => {
          fetchOnlinePlayers();
        }
      )
      .subscribe();

    // Go offline when leaving
    const handleBeforeUnload = () => {
      goOffline();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      channel.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      goOffline();
    };
  }, [user, updatePresence, goOffline, fetchOnlinePlayers]);

  return {
    onlinePlayers: onlinePlayers.filter(p => p.id !== myPlayerId), // Exclude self by id
    myPlayerId,
    refreshPlayers: fetchOnlinePlayers
  };
}
