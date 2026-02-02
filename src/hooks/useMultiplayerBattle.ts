import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Position, Tower, Unit, Building } from '@/types/game';

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
  isPlayer1: boolean; // Which player placed the card
}

// Synced game state for Player 2 to receive
export interface SyncedGameState {
  timestamp: number;
  playerTowers: Array<{ id: string; health: number; maxHealth: number }>;
  enemyTowers: Array<{ id: string; health: number; maxHealth: number }>;
  timeRemaining: number;
  playerElixir: number;
  enemyElixir: number;
  gameStatus: 'playing' | 'player-wins' | 'enemy-wins' | 'draw';
}

interface MultiplayerGameState {
  placements: CardPlacement[];
  lastProcessed: number;
  syncedState?: SyncedGameState;
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
  const battleStateRef = useRef<MultiplayerBattleState | null>(null);
  
  // Keep ref in sync with state to avoid stale closures
  useEffect(() => {
    battleStateRef.current = battleState;
  }, [battleState]);

  // Create a new battle when both players accept
  const createBattle = useCallback(async (
    opponentId: string,
    opponentName: string,
    opponentBannerId: string,
    opponentLevel: number,
    isChallenger: boolean
  ): Promise<string | null> => {
    if (!user) return null;

    // Only the challenger creates the battle
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

  // Join an existing battle
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

  // Send a card placement to the opponent
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

    // Get current game state
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

    // Update the game state
    await supabase
      .from('active_battles')
      .update({ game_state: updatedState as unknown as Record<string, never> })
      .eq('id', battleState.battleId);
  }, [battleState, user]);

  // Sync game state from host (Player 1) to client (Player 2)
  const syncGameState = useCallback(async (state: SyncedGameState) => {
    if (!battleState || !battleState.isPlayer1) return; // Only host syncs

    const { data: battleData } = await supabase
      .from('active_battles')
      .select('game_state')
      .eq('id', battleState.battleId)
      .single();

    if (!battleData) return;

    const gameState = battleData.game_state as unknown as MultiplayerGameState;
    const updatedState: MultiplayerGameState = {
      ...gameState,
      syncedState: state
    };

    await supabase
      .from('active_battles')
      .update({ game_state: updatedState as unknown as Record<string, never> })
      .eq('id', battleState.battleId);
  }, [battleState]);

  // Report game end
  const reportGameEnd = useCallback(async (winnerId: string | null) => {
    if (!battleState) return;

    await supabase
      .from('active_battles')
      .update({
        status: 'finished',
        winner_id: winnerId
      })
      .eq('id', battleState.battleId);
  }, [battleState]);

  // Process game state updates (shared between realtime and polling)
  const processGameStateUpdate = useCallback((newData: Record<string, unknown>) => {
    const gameState = newData.game_state as unknown as MultiplayerGameState | null;
    
    const currentBattleState = battleStateRef.current;
    if (!currentBattleState || !gameState) return;

    // Get opponent's new placements
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

    // For Player 2, receive synced game state from Player 1
    if (!currentBattleState.isPlayer1 && gameState.syncedState) {
      setSyncedGameState(gameState.syncedState);
    }

    // Check if game ended
    if (newData.status === 'finished') {
      setBattleState(prev => prev ? {
        ...prev,
        status: 'finished',
        winnerId: (newData.winner_id as string) || undefined
      } : null);
    }
  }, []);

  // Subscribe to battle updates with polling fallback
  useEffect(() => {
    if (!battleId || !user) return;

    // First, join the battle
    joinBattle(battleId);

    let pollTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastSyncTimestamp = 0;

    // Polling fallback for when realtime fails
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
          const gameState = data.game_state as unknown as MultiplayerGameState | null;
          const syncTimestamp = gameState?.syncedState?.timestamp || 0;
          
          // Only process if we have new data
          if (syncTimestamp > lastSyncTimestamp) {
            lastSyncTimestamp = syncTimestamp;
            processGameStateUpdate(data as unknown as Record<string, unknown>);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }

      // Continue polling every 200ms for responsive gameplay
      pollTimeoutId = setTimeout(pollForUpdates, 200);
    };

    // Subscribe to game state changes using Realtime
    const channel = supabase
      .channel(`battle:${battleId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'active_battles',
          filter: `id=eq.${battleId}`
        },
        (payload) => {
          const newData = payload.new as Record<string, unknown>;
          const gameState = newData.game_state as unknown as MultiplayerGameState | null;
          
          // Update lastSyncTimestamp to prevent duplicate processing from polling
          if (gameState?.syncedState?.timestamp) {
            lastSyncTimestamp = gameState.syncedState.timestamp;
          }
          
          processGameStateUpdate(newData);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        
        // Start polling as fallback regardless of realtime status
        // This ensures we always get updates even if realtime is slow or fails
        if (!pollTimeoutId) {
          pollTimeoutId = setTimeout(pollForUpdates, 200);
        }
      });

    channelRef.current = channel;

    return () => {
      if (pollTimeoutId) {
        clearTimeout(pollTimeoutId);
      }
      channel.unsubscribe();
    };
  }, [battleId, user, joinBattle, processGameStateUpdate]);

  // Clear a processed placement
  const consumePlacement = useCallback(() => {
    setPendingOpponentPlacements(prev => prev.slice(1));
  }, []);

  // Disconnect and cleanup
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
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
