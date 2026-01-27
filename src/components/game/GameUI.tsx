import { useGameState } from '@/hooks/useGameState';
import { Arena } from './Arena';
import { Hand } from './Hand';
import { ElixirBar } from './ElixirBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
  const { gameState, projectiles, spawnEffects, playCard, selectCard, ARENA_WIDTH, ARENA_HEIGHT } = useGameState(playerDeck);

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-4">
      {/* Header */}
      <div className="flex items-center gap-4 w-full max-w-md">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 flex items-center justify-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">You</span>
            <span className="text-xl font-bold text-primary">⭐ {playerTowersDestroyed}</span>
          </div>
          
          <div className="game-timer text-primary">
            {formatTime(gameState.timeRemaining)}
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Enemy</span>
            <span className="text-xl font-bold text-secondary">⭐ {enemyTowersDestroyed}</span>
          </div>
        </div>
        
        <div className="w-10" />
      </div>

      {/* Arena */}
      <Arena
        gameState={gameState}
        projectiles={projectiles}
        spawnEffects={spawnEffects}
        arenaWidth={ARENA_WIDTH}
        arenaHeight={ARENA_HEIGHT}
        onArenaClick={handleArenaClick}
      />

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 w-full max-w-md">
        <ElixirBar elixir={gameState.playerElixir} />
        
        <Hand
          cards={gameState.playerHand}
          elixir={gameState.playerElixir}
          selectedIndex={gameState.selectedCardIndex}
          onCardSelect={handleCardSelect}
        />

        {gameState.selectedCardIndex !== null && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Tap on your side of the arena to deploy!
          </p>
        )}
      </div>
    </div>
  );
}
