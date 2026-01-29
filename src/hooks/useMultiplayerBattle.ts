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
}

interface MultiplayerGameState {
  player1Placements: CardPlacement[];
  player2Placements: CardPlacement[];
  lastProcessedPlayer1: number;
  lastProcessedPlayer2: number;
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
            player1Placements: [],
            player2Placements: [],
            lastProcessedPlayer1: 0,
            lastProcessedPlayer2: 0
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
      timestamp: Date.now()
    };

    // Get current game state
    const { data: battleData } = await supabase
      .from('active_battles')
      .select('game_state')
      .eq('id', battleState.battleId)
      .single();

    if (!battleData) return;

    const gameState = battleData.game_state as unknown as MultiplayerGameState;
    const updatedState: Record<string, unknown> = { ...gameState };

    if (battleState.isPlayer1) {
      updatedState.player1Placements = [...(gameState.player1Placements || []), placement];
    } else {
      updatedState.player2Placements = [...(gameState.player2Placements || []), placement];
    }

    // Update the game state (cast to Json-compatible type)
    await supabase
      .from('active_battles')
      .update({ game_state: updatedState as unknown as Record<string, never> })
      .eq('id', battleState.battleId);
  }, [battleState, user]);

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

  // Subscribe to battle updates
  useEffect(() => {
    if (!battleId || !user) return;

    // First, join the battle
    joinBattle(battleId);

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
          
          // Use ref to get current state (avoids stale closure)
          const currentBattleState = battleStateRef.current;
          if (!currentBattleState || !gameState) return;

          // Get opponent's new placements
          const opponentPlacements = currentBattleState.isPlayer1 
            ? gameState.player2Placements || []
            : gameState.player1Placements || [];

          // Filter to only new placements
          const newPlacements = opponentPlacements.filter(
            p => p.timestamp > lastProcessedTimestampRef.current
          );

          if (newPlacements.length > 0) {
            // Update last processed timestamp
            lastProcessedTimestampRef.current = Math.max(
              ...newPlacements.map(p => p.timestamp)
            );
            
            // Queue these placements for processing
            setPendingOpponentPlacements(prev => [...prev, ...newPlacements]);
          }

          // Check if game ended
          if (newData.status === 'finished') {
            setBattleState(prev => prev ? {
              ...prev,
              status: 'finished',
              winnerId: (newData.winner_id as string) || undefined
            } : null);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [battleId, user, joinBattle]);

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
    setIsConnected(false);
    lastProcessedTimestampRef.current = 0;
  }, []);

  return {
    battleState,
    isConnected,
    pendingOpponentPlacements,
    createBattle,
    joinBattle,
    sendCardPlacement,
    reportGameEnd,
    consumePlacement,
    disconnect
  };
}
