import { useGameState } from '@/hooks/useGameState';
import { Arena } from './Arena';
import { Hand } from './Hand';
import { ElixirBar } from './ElixirBar';
import { Button } from '@/components/ui/button';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function GameUI() {
  const { gameState, playCard, selectCard, resetGame, ARENA_WIDTH, ARENA_HEIGHT } = useGameState();

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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-4">
      {/* Header */}
      <div className="flex items-center gap-8 text-center">
        <div className="flex flex-col items-center">
          <span className="text-sm text-muted-foreground">You</span>
          <span className="text-2xl font-bold text-primary">⭐ {playerTowersDestroyed}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="game-timer text-primary">
            {formatTime(gameState.timeRemaining)}
          </span>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-sm text-muted-foreground">Enemy</span>
          <span className="text-2xl font-bold text-secondary">⭐ {enemyTowersDestroyed}</span>
        </div>
      </div>

      {/* Arena */}
      <Arena
        gameState={gameState}
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

      {/* Game Over Overlay */}
      {gameState.gameStatus !== 'playing' && (
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
            
            <Button
              onClick={resetGame}
              size="lg"
              className="text-xl px-8 py-6"
            >
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
