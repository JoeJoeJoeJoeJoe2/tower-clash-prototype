import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Position } from '@/types/game';

export interface MultiplayerBattleState {
  battleId: string;
  isPlayer1: boolean;
  opponentName: string;
  opponentBannerId: string;
  opponentLevel: number;
  status: 'waiting' | 'active' | 'finished';
  winnerId?: string;
}

export interface CardPlacement {
  cardId: string;
  cardIndex: number;
  position: Position;
  timestamp: number;
  isPlayer1: boolean;
}

export interface SyncedGameState {
  timestamp: number;
  playerTowers: Array<{ id: string; health: number; maxHealth: number }>;
  enemyTowers: Array<{ id: string; health: number; maxHealth: number }>;
  timeRemaining: number;
  playerElixir: number;
  enemyElixir: number;
  gameStatus: 'playing' | 'player-wins' | 'enemy-wins' | 'draw';
  // Include units for full sync
  units?: Array<{
    id: string;
    cardId: string;
    position: Position;
    health: number;
    maxHealth: number;
    isEnemy: boolean;
  }>;
}

interface MultiplayerGameState {
  placements: CardPlacement[];
  lastProcessed: number;
}

export function useMultiplayerBattle(
  user: User | null,
  battleId: string | null,
  playerName: string,
  playerBannerId: string,
  playerLevel: number
) {
  const [battleState, setBattleState] = useState<MultiplayerBattleState | null>(null);
  const [pendingOpponentPlacements, setPendingOpponentPlacements] = useState<CardPlacement[]>([]);
  const [syncedGameState, setSyncedGameState] = useState<SyncedGameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastProcessedTimestampRef = useRef<number>(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const broadcastChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const battleStateRef = useRef<MultiplayerBattleState | null>(null);
  
  useEffect(() => {
    battleStateRef.current = battleState;
  }, [battleState]);

  const createBattle = useCallback(async (
    opponentId: string,
    opponentName: string,
    opponentBannerId: string,
    opponentLevel: number,
    isChallenger: boolean
  ): Promise<string | null> => {
    if (!user) return null;

    if (isChallenger) {
      const { data, error } = await supabase
        .from('active_battles')
        .insert({
          player1_id: user.id,
          player2_id: opponentId,
          player1_name: playerName,
          player2_name: opponentName,
          player1_banner_id: playerBannerId,
          player2_banner_id: opponentBannerId,
          player1_level: playerLevel,
          player2_level: opponentLevel,
          status: 'active',
          game_state: {
            placements: [],
            lastProcessed: 0
          }
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to create battle:', error);
        return null;
      }

      return data.id;
    }

    return null;
  }, [user, playerName, playerBannerId, playerLevel]);

  const joinBattle = useCallback(async (id: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('active_battles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Failed to join battle:', error);
      return;
    }

    const isPlayer1 = data.player1_id === user.id;
    
    setBattleState({
      battleId: data.id,
      isPlayer1,
      opponentName: isPlayer1 ? data.player2_name : data.player1_name,
      opponentBannerId: isPlayer1 ? data.player2_banner_id : data.player1_banner_id,
      opponentLevel: isPlayer1 ? data.player2_level : data.player1_level,
      status: data.status as 'waiting' | 'active' | 'finished',
      winnerId: data.winner_id || undefined
    });
  }, [user]);

  // Send card placement via broadcast (instant) + database (persistence)
  const sendCardPlacement = useCallback(async (
    cardId: string,
    cardIndex: number,
    position: Position
  ) => {
    if (!battleState || !user) return;

    const placement: CardPlacement = {
      cardId,
      cardIndex,
      position: { x: position.x, y: position.y },
      timestamp: Date.now(),
      isPlayer1: battleState.isPlayer1
    };

    // Send via broadcast for instant delivery
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.send({
        type: 'broadcast',
        event: 'card_placement',
        payload: placement
      });
    }

    // Also persist to database for reconnection scenarios
    const { data: battleData } = await supabase
      .from('active_battles')
      .select('game_state')
      .eq('id', battleState.battleId)
      .single();

    if (!battleData) return;

    const gameState = battleData.game_state as unknown as MultiplayerGameState;
    const updatedState: MultiplayerGameState = {
      ...gameState,
      placements: [...(gameState.placements || []), placement]
    };

    await supabase
      .from('active_battles')
      .update({ game_state: updatedState as unknown as Record<string, never> })
      .eq('id', battleState.battleId);
  }, [battleState, user]);

  // Sync game state via broadcast only (no database write for speed)
  const syncGameState = useCallback((state: SyncedGameState) => {
    if (!battleState || !battleState.isPlayer1) return;

    // Use broadcast for instant delivery - no database round-trip
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.send({
        type: 'broadcast',
        event: 'game_state_sync',
        payload: state
      });
    }
  }, [battleState]);

  const reportGameEnd = useCallback(async (winnerId: string | null) => {
    if (!battleState) return;

    // Broadcast game end instantly
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.send({
        type: 'broadcast',
        event: 'game_end',
        payload: { winnerId }
      });
    }

    await supabase
      .from('active_battles')
      .update({
        status: 'finished',
        winner_id: winnerId
      })
      .eq('id', battleState.battleId);
  }, [battleState]);

  // Process placements from database (for reconnection)
  const processGameStateUpdate = useCallback((newData: Record<string, unknown>) => {
    const gameState = newData.game_state as unknown as MultiplayerGameState | null;
    
    const currentBattleState = battleStateRef.current;
    if (!currentBattleState || !gameState) return;

    const allPlacements = gameState.placements || [];
    const opponentPlacements = allPlacements.filter(
      p => p.isPlayer1 !== currentBattleState.isPlayer1 &&
           p.timestamp > lastProcessedTimestampRef.current
    );

    if (opponentPlacements.length > 0) {
      lastProcessedTimestampRef.current = Math.max(
        ...opponentPlacements.map(p => p.timestamp)
      );
      setPendingOpponentPlacements(prev => [...prev, ...opponentPlacements]);
    }

    if (newData.status === 'finished') {
      setBattleState(prev => prev ? {
        ...prev,
        status: 'finished',
        winnerId: (newData.winner_id as string) || undefined
      } : null);
    }
  }, []);

  // Subscribe to battle updates
  useEffect(() => {
    if (!battleId || !user) return;

    joinBattle(battleId);

    let pollTimeoutId: ReturnType<typeof setTimeout> | null = null;

    // Create broadcast channel for instant communication
    const broadcastChannel = supabase
      .channel(`battle-broadcast:${battleId}`)
      .on('broadcast', { event: 'card_placement' }, (payload) => {
        const placement = payload.payload as CardPlacement;
        const currentBattleState = battleStateRef.current;
        
        if (!currentBattleState) return;
        
        // Only process opponent's placements
        if (placement.isPlayer1 !== currentBattleState.isPlayer1) {
          if (placement.timestamp > lastProcessedTimestampRef.current) {
            lastProcessedTimestampRef.current = placement.timestamp;
            setPendingOpponentPlacements(prev => [...prev, placement]);
          }
        }
      })
      .on('broadcast', { event: 'game_state_sync' }, (payload) => {
        const state = payload.payload as SyncedGameState;
        const currentBattleState = battleStateRef.current;
        
        // Only Player 2 receives synced state
        if (currentBattleState && !currentBattleState.isPlayer1) {
          setSyncedGameState(state);
        }
      })
      .on('broadcast', { event: 'game_end' }, (payload) => {
        const { winnerId } = payload.payload as { winnerId: string | null };
        setBattleState(prev => prev ? {
          ...prev,
          status: 'finished',
          winnerId: winnerId || undefined
        } : null);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        }
      });

    broadcastChannelRef.current = broadcastChannel;

    // Database channel for persistence/reconnection
    const dbChannel = supabase
      .channel(`battle-db:${battleId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'active_battles',
          filter: `id=eq.${battleId}`
        },
        (payload) => {
          processGameStateUpdate(payload.new as Record<string, unknown>);
        }
      )
      .subscribe();

    channelRef.current = dbChannel;

    // Polling fallback - less frequent since broadcast is primary
    const pollForUpdates = async () => {
      const currentBattleState = battleStateRef.current;
      if (!currentBattleState) return;

      try {
        const { data } = await supabase
          .from('active_battles')
          .select('*')
          .eq('id', battleId)
          .single();

        if (data) {
          processGameStateUpdate(data as unknown as Record<string, unknown>);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }

      pollTimeoutId = setTimeout(pollForUpdates, 500);
    };

    pollTimeoutId = setTimeout(pollForUpdates, 500);

    return () => {
      if (pollTimeoutId) clearTimeout(pollTimeoutId);
      broadcastChannel.unsubscribe();
      dbChannel.unsubscribe();
    };
  }, [battleId, user, joinBattle, processGameStateUpdate]);

  const consumePlacement = useCallback(() => {
    setPendingOpponentPlacements(prev => prev.slice(1));
  }, []);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.unsubscribe();
      broadcastChannelRef.current = null;
    }
    setBattleState(null);
    setPendingOpponentPlacements([]);
    setSyncedGameState(null);
    setIsConnected(false);
    lastProcessedTimestampRef.current = 0;
  }, []);

  return {
    battleState,
    isConnected,
    pendingOpponentPlacements,
    syncedGameState,
    createBattle,
    joinBattle,
    sendCardPlacement,
    syncGameState,
    reportGameEnd,
    consumePlacement,
    disconnect
  };
}
