import { useGameState } from '@/hooks/useGameState';
import { CardDefinition } from '@/types/game';
import { Arena } from './Arena';
import { Hand } from './Hand';
import { ElixirBar } from './ElixirBar';
import { BattleResults } from './BattleResults';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameUIProps {
  playerDeck: string[];
  cardLevels: Record<string, number>; // Card ID -> level
  towerLevels: { princess: number; king: number }; // Tower levels
  playerName: string;
  playerBannerEmoji: string;
  playerLevel: number;
  onGameEnd: (result: 'win' | 'loss' | 'draw') => void;
  onBack: () => void;
  onTrackDamage?: (cardId: string, damage: number) => void;
  getBalancedCardStats?: (cardId: string) => CardDefinition | null;
  isFriendlyBattle?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Generate random enemy name
function generateEnemyName(): string {
  const prefixes = ['Dark', 'Shadow', 'Storm', 'Fire', 'Ice', 'Thunder', 'Swift', 'Iron', 'Golden', 'Silver'];
  const suffixes = ['Knight', 'Warrior', 'Mage', 'Hunter', 'Slayer', 'Master', 'King', 'Lord', 'Crusher', 'Striker'];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
}

const enemyEmojis = ['⚔️', '🛡️', '🗡️', '🏹', '🔥', '❄️', '⚡', '💀', '👹', '🐲'];

export function GameUI({ 
  playerDeck, 
  cardLevels, 
  towerLevels, 
  playerName,
  playerBannerEmoji,
  playerLevel,
  onGameEnd, 
  onBack, 
  onTrackDamage, 
  getBalancedCardStats,
  isFriendlyBattle = false
}: GameUIProps) {
  const { gameState, projectiles, spawnEffects, damageNumbers, crownAnimations, playCard, selectCard, ARENA_WIDTH, ARENA_HEIGHT } = useGameState(playerDeck, cardLevels, towerLevels, onTrackDamage, getBalancedCardStats);

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

  // Handle game end with new BattleResults screen
  if (gameState.gameStatus !== 'playing') {
    const enemyName = generateEnemyName();
    const enemyEmoji = enemyEmojis[Math.floor(Math.random() * enemyEmojis.length)];
    const enemyLevel = Math.floor(Math.random() * 5) + 1;

    return (
      <BattleResults
        gameStatus={gameState.gameStatus}
        playerCrowns={playerCrowns}
        enemyCrowns={enemyCrowns}
        playerName={playerName}
        playerBannerEmoji={playerBannerEmoji}
        playerLevel={playerLevel}
        enemyName={enemyName}
        enemyBannerEmoji={enemyEmoji}
        enemyLevel={enemyLevel}
        onContinue={() => onGameEnd(
          gameState.gameStatus === 'player-wins' ? 'win' 
          : gameState.gameStatus === 'enemy-wins' ? 'loss' 
          : 'draw'
        )}
      />
    );
  }

  // Check for new placement zones (bonus zones from destroyed towers)
  const hasBonusZones = gameState.playerPlacementZones.some(z => z.reason === 'tower-destroyed');

  return (
    <div className="h-[100dvh] bg-background flex overflow-hidden">
      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center min-h-0">
        {/* Minimal header - just timer and controls */}
        <div className="flex items-center justify-between w-full max-w-md px-2 py-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onGameEnd('loss')} title="Forfeit match" className="h-7 w-7 p-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          {/* Timer */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "text-lg font-bold transition-all duration-300",
              gameState.isSuddenDeath 
                ? "text-orange-400 animate-pulse" 
                : "text-primary"
            )}>
              {formatTime(gameState.timeRemaining)}
            </div>
            {gameState.isSuddenDeath && (
              <div className="flex items-center gap-1 text-orange-400 text-[9px] font-bold">
                <Zap className="w-2.5 h-2.5" />
                <span>2X</span>
              </div>
            )}
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => onGameEnd('loss')} className="text-destructive h-7 w-7 p-0" title="Surrender">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Sudden death banner */}
        {gameState.isSuddenDeath && gameState.timeRemaining > 55 && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white px-3 py-0.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-1">
              <Zap className="w-3 h-3" />
              SUDDEN DEATH!
              <Zap className="w-3 h-3" />
            </div>
          </div>
        )}

        {/* Arena - fills remaining space but respects card bar */}
        <div className="flex-1 flex items-start justify-center min-h-0 overflow-hidden">
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

        {/* Controls - always visible at bottom */}
        <div className="w-full max-w-md shrink-0">
          <div 
            className="bg-card/80 backdrop-blur-sm border-t border-border/30 px-1 py-1.5 flex flex-col items-center gap-1"
            style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
          >
            {/* Cards */}
            <Hand
              cards={gameState.playerHand}
              elixir={gameState.playerElixir}
              selectedIndex={gameState.selectedCardIndex}
              onCardSelect={handleCardSelect}
              nextCard={gameState.playerDeck[0]}
              cardLevels={cardLevels}
            />
            
            {/* Elixir bar */}
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

      {/* Right sidebar - Crown scores */}
      <div className="w-12 flex flex-col items-center justify-center gap-6 bg-card/50 border-l border-border/30 py-4">
        {/* Enemy crowns */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[8px] text-muted-foreground font-medium">FOE</span>
          <div className="flex flex-col gap-0.5">
            {[0, 1, 2].map(i => (
              <span 
                key={i} 
                className={cn(
                  "text-base transition-all duration-300",
                  i < enemyCrowns ? "opacity-100 scale-100" : "opacity-20 scale-75"
                )}
              >
                👑
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-6 h-px bg-border/50" />
        
        {/* Player crowns */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[8px] text-muted-foreground font-medium">YOU</span>
          <div className="flex flex-col gap-0.5">
            {[0, 1, 2].map(i => (
              <span 
                key={i} 
                className={cn(
                  "text-base transition-all duration-300",
                  i < playerCrowns ? "opacity-100 scale-100" : "opacity-20 scale-75"
                )}
              >
                👑
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
