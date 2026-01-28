import { useGameState } from '@/hooks/useGameState';
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
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function GameUI({ playerDeck, onGameEnd, onBack }: GameUIProps) {
  const { gameState, projectiles, spawnEffects, damageNumbers, playCard, selectCard, ARENA_WIDTH, ARENA_HEIGHT } = useGameState(playerDeck);

  const handleArenaClick = (position: { x: number; y: number }) => {
    if (gameState.selectedCardIndex !== null) {
      playCard(gameState.selectedCardIndex, position);
    }
  };

  const handleCardSelect = (index: number) => {
    selectCard(index === -1 ? null : index);
  };

  const playerTowersDestroyed = 3 - gameState.enemyTowers.filter(t => t.health > 0).length;
  const enemyTowersDestroyed = 3 - gameState.playerTowers.filter(t => t.health > 0).length;

  // Check for new placement zones (bonus zones from destroyed towers)
  const hasBonusZones = gameState.playerPlacementZones.some(z => z.reason === 'tower-destroyed');

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
                <span className="text-muted-foreground text-sm">Towers Destroyed</span>
                <p className="text-4xl font-bold text-primary">{playerTowersDestroyed}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Towers Lost</span>
                <p className="text-4xl font-bold text-destructive">{enemyTowersDestroyed}</p>
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

  return (
    <div className="h-[100dvh] bg-background flex flex-col items-center overflow-hidden"  style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header - compact */}
      <div className="flex items-center gap-2 w-full max-w-md px-2 py-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => onGameEnd('loss')} title="Forfeit match" className="h-8 w-8 p-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 flex items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground">You</span>
            <span className="text-lg font-bold text-primary">⭐ {playerTowersDestroyed}</span>
          </div>
          
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
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground">Enemy</span>
            <span className="text-lg font-bold text-secondary">⭐ {enemyTowersDestroyed}</span>
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

      {/* Arena - fills available space */}
      <div className="flex-1 flex items-center justify-center min-h-0 py-1">
        <Arena
          gameState={gameState}
          projectiles={projectiles}
          spawnEffects={spawnEffects}
          damageNumbers={damageNumbers}
          arenaWidth={ARENA_WIDTH}
          arenaHeight={ARENA_HEIGHT}
          onArenaClick={handleArenaClick}
        />
      </div>

      {/* Controls - fixed at bottom */}
      <div className="w-full max-w-md px-2 shrink-0">
        <div 
          className="bg-card/95 backdrop-blur-md border border-border rounded-t-xl p-2 flex flex-col items-center gap-2 shadow-lg"
        >
          {/* Cards */}
          <Hand
            cards={gameState.playerHand}
            elixir={gameState.playerElixir}
            selectedIndex={gameState.selectedCardIndex}
            onCardSelect={handleCardSelect}
            nextCard={gameState.playerDeck[0]}
          />
          
          {/* Elixir bar */}
          <ElixirBar 
            elixir={gameState.playerElixir} 
            isSuddenDeath={gameState.isSuddenDeath}
          />

          {gameState.selectedCardIndex !== null && (
            <p className={cn(
              "text-xs",
              hasBonusZones ? "text-emerald-400" : "text-muted-foreground"
            )}>
              {hasBonusZones 
                ? "🎯 New zones unlocked!" 
                : "Tap arena to deploy!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
