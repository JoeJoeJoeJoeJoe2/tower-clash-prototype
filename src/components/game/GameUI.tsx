import { useGameState } from '@/hooks/useGameState';
import { CardDefinition } from '@/types/game';
import { Arena } from './Arena';
import { Hand } from './Hand';
import { ElixirBar } from './ElixirBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameUIProps {
  playerDeck: string[];
  onGameEnd: (result: 'win' | 'loss' | 'draw') => void;
  onBack: () => void;
  onTrackDamage?: (cardId: string, damage: number) => void;
  getBalancedCardStats?: (cardId: string) => CardDefinition | null;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function GameUI({ playerDeck, onGameEnd, onBack, onTrackDamage, getBalancedCardStats }: GameUIProps) {
  const { gameState, projectiles, spawnEffects, damageNumbers, crownAnimations, playCard, selectCard, ARENA_WIDTH, ARENA_HEIGHT } = useGameState(playerDeck, onTrackDamage, getBalancedCardStats);

  const handleArenaClick = (position: { x: number; y: number }) => {
    if (gameState.selectedCardIndex !== null) {
      playCard(gameState.selectedCardIndex, position);
    }
  };

  const handleCardSelect = (index: number) => {
    selectCard(index === -1 ? null : index);
  };

  const playerCrowns = 3 - gameState.enemyTowers.filter(t => t.health > 0).length;
  const enemyCrowns = 3 - gameState.playerTowers.filter(t => t.health > 0).length;

  // Handle game end
  if (gameState.gameStatus !== 'playing') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="winner-overlay">
          <div className="flex flex-col items-center gap-6">
            <div
              className={`winner-banner ${
                gameState.gameStatus === 'player-wins'
                  ? 'bg-primary text-primary-foreground'
                  : gameState.gameStatus === 'enemy-wins'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {gameState.gameStatus === 'player-wins' && '🏆 Victory!'}
              {gameState.gameStatus === 'enemy-wins' && '💀 Defeat'}
              {gameState.gameStatus === 'draw' && '🤝 Draw'}
            </div>
            
            <div className="flex gap-8 text-center">
              <div>
                <span className="text-muted-foreground text-sm">Crowns Won</span>
                <div className="flex justify-center gap-1 mt-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className={cn("text-2xl", i < playerCrowns ? "opacity-100" : "opacity-30")}>
                      👑
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Crowns Lost</span>
                <div className="flex justify-center gap-1 mt-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className={cn("text-2xl", i < enemyCrowns ? "opacity-100" : "opacity-30")}>
                      👑
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => onGameEnd(
                gameState.gameStatus === 'player-wins' ? 'win' 
                : gameState.gameStatus === 'enemy-wins' ? 'loss' 
                : 'draw'
              )}
              size="lg"
              className="text-xl px-8 py-6"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check for new placement zones (bonus zones from destroyed towers)
  const hasBonusZones = gameState.playerPlacementZones.some(z => z.reason === 'tower-destroyed');

  return (
    <div className="h-[100dvh] bg-background flex flex-col items-center overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header - compact */}
      <div className="flex items-center gap-2 w-full max-w-md px-2 py-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => onGameEnd('loss')} title="Forfeit match" className="h-8 w-8 p-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 flex items-center justify-center gap-4">
          {/* Player crowns */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground">You</span>
            <div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <span 
                  key={i} 
                  className={cn(
                    "text-lg transition-all duration-300",
                    i < playerCrowns ? "opacity-100 scale-100" : "opacity-30 scale-75"
                  )}
                >
                  👑
                </span>
              ))}
            </div>
          </div>
          
          {/* Timer */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "text-xl font-bold transition-all duration-300",
              gameState.isSuddenDeath 
                ? "text-orange-400 animate-pulse" 
                : "text-primary"
            )}>
              {formatTime(gameState.timeRemaining)}
            </div>
            {gameState.isSuddenDeath && (
              <div className="flex items-center gap-1 text-orange-400 text-[10px] font-bold">
                <Zap className="w-2.5 h-2.5" />
                <span>2X</span>
              </div>
            )}
          </div>
          
          {/* Enemy crowns */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground">Enemy</span>
            <div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <span 
                  key={i} 
                  className={cn(
                    "text-lg transition-all duration-300",
                    i < enemyCrowns ? "opacity-100 scale-100" : "opacity-30 scale-75"
                  )}
                >
                  👑
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={() => onGameEnd('loss')} className="text-destructive h-8 w-8 p-0" title="Surrender">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Sudden death banner */}
      {gameState.isSuddenDeath && gameState.timeRemaining > 55 && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white px-4 py-1 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
            <Zap className="w-4 h-4" />
            SUDDEN DEATH!
            <Zap className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Arena - fills available space with extra bottom margin for card bar */}
      <div className="flex-1 flex items-start justify-center min-h-0 pt-1 relative mb-2">
        <Arena
          gameState={gameState}
          projectiles={projectiles}
          spawnEffects={spawnEffects}
          damageNumbers={damageNumbers}
          crownAnimations={crownAnimations}
          arenaWidth={ARENA_WIDTH}
          arenaHeight={ARENA_HEIGHT}
          onArenaClick={handleArenaClick}
        />
      </div>

      {/* Controls - ultra compact bar at very bottom */}
      <div className="w-full max-w-md shrink-0">
        <div 
          className="bg-card/80 backdrop-blur-sm border-t border-border/30 px-1 py-1 flex flex-col items-center gap-0.5"
          style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom))' }}
        >
          {/* Cards */}
          <Hand
            cards={gameState.playerHand}
            elixir={gameState.playerElixir}
            selectedIndex={gameState.selectedCardIndex}
            onCardSelect={handleCardSelect}
            nextCard={gameState.playerDeck[0]}
          />
          
          {/* Elixir bar - ultra compact */}
          <ElixirBar 
            elixir={gameState.playerElixir} 
            isSuddenDeath={gameState.isSuddenDeath}
          />

          {gameState.selectedCardIndex !== null && (
            <p className={cn(
              "text-[9px]",
              gameState.playerElixir < (gameState.playerHand[gameState.selectedCardIndex]?.elixirCost || 0) 
                ? "text-destructive" 
                : hasBonusZones 
                  ? "text-emerald-400" 
                  : "text-muted-foreground"
            )}>
              {gameState.playerElixir < (gameState.playerHand[gameState.selectedCardIndex]?.elixirCost || 0)
                ? "⚡ Not enough elixir!"
                : hasBonusZones 
                  ? "🎯 New zones unlocked!" 
                  : "Tap arena to deploy!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
