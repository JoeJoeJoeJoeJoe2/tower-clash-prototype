import { useState, useCallback, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { CardDefinition, Position } from '@/types/game';
import { Arena } from './Arena';
import { Hand } from './Hand';
import { ElixirBar } from './ElixirBar';
import { BattleResults } from './BattleResults';
import { EmotePanel } from './EmotePanel';
import { EmoteDisplay, EmoteMessage } from './EmoteDisplay';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, X, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCurrentArena } from '@/data/arenas';
import { MultiplayerBattleState, CardPlacement } from '@/hooks/useMultiplayerBattle';
import { getCardById } from '@/data/cards';

interface GameUIProps {
  playerDeck: string[];
  cardLevels: Record<string, number>; // Card ID -> level
  towerLevels: { princess: number; king: number }; // Tower levels
  playerName: string;
  playerBannerEmoji: string;
  playerLevel: number;
  trophies?: number; // Player's current trophies for arena theme
  unlockedEvolutions?: string[]; // Card IDs with unlocked evolutions
  onGameEnd: (result: 'win' | 'loss' | 'draw') => void;
  onBack: () => void;
  onTrackDamage?: (cardId: string, damage: number) => void;
  getBalancedCardStats?: (cardId: string) => CardDefinition | null;
  isFriendlyBattle?: boolean;
  // Multiplayer props
  isMultiplayer?: boolean;
  battleState?: MultiplayerBattleState | null;
  pendingOpponentPlacements?: CardPlacement[];
  onSendCardPlacement?: (cardId: string, cardIndex: number, position: Position) => void;
  onConsumePlacement?: () => void;
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
  trophies = 0,
  unlockedEvolutions = [],
  onGameEnd, 
  onBack, 
  onTrackDamage, 
  getBalancedCardStats,
  isFriendlyBattle = false,
  isMultiplayer = false,
  battleState,
  pendingOpponentPlacements = [],
  onSendCardPlacement,
  onConsumePlacement
}: GameUIProps) {
  const { gameState, projectiles, spawnEffects, damageNumbers, crownAnimations, playCard, playEnemyCard, selectCard, ARENA_WIDTH, ARENA_HEIGHT } = useGameState(playerDeck, cardLevels, towerLevels, onTrackDamage, getBalancedCardStats, isMultiplayer, unlockedEvolutions);
  
  // Get current arena theme based on trophies
  const currentArena = getCurrentArena(trophies);
  
  // Emote state
  const [showEmotePanel, setShowEmotePanel] = useState(false);
  const [emoteMessages, setEmoteMessages] = useState<EmoteMessage[]>([]);

  // Handle emote selection
  const handleEmoteSelect = useCallback((content: string, isText: boolean) => {
    const newMessage: EmoteMessage = {
      id: `${Date.now()}-player`,
      content,
      isText,
      isPlayer: true,
      timestamp: Date.now(),
    };
    setEmoteMessages(prev => [...prev, newMessage]);
    setShowEmotePanel(false);

    // Simulate AI responding with an emote after a delay (in friendly battles or AI games)
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const aiEmotes = ['😂', '😢', '👍', '🙄', 'Well played!', 'Wow!', 'Thanks!'];
        const randomEmote = aiEmotes[Math.floor(Math.random() * aiEmotes.length)];
        const aiMessage: EmoteMessage = {
          id: `${Date.now()}-enemy`,
          content: randomEmote,
          isText: randomEmote.length > 2,
          isPlayer: false,
          timestamp: Date.now(),
        };
        setEmoteMessages(prev => [...prev, aiMessage]);
      }, 1000 + Math.random() * 2000);
    }
  }, []);

  // Handle opponent card placements in multiplayer mode
  useEffect(() => {
    if (!isMultiplayer || pendingOpponentPlacements.length === 0) return;

    // Process the first pending placement
    const placement = pendingOpponentPlacements[0];
    playEnemyCard(placement.cardId, placement.position);
    onConsumePlacement?.();
  }, [isMultiplayer, pendingOpponentPlacements, playEnemyCard, onConsumePlacement]);

  const handleArenaClick = (position: { x: number; y: number }) => {
    if (gameState.selectedCardIndex !== null) {
      const selectedCard = gameState.playerHand[gameState.selectedCardIndex];
      
      // Send card placement to opponent in multiplayer
      if (isMultiplayer && selectedCard && onSendCardPlacement) {
        onSendCardPlacement(selectedCard.id, gameState.selectedCardIndex, position);
      }
      
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
    // Use real opponent data in multiplayer, otherwise generate random
    const enemyName = isMultiplayer && battleState ? battleState.opponentName : generateEnemyName();
    const enemyEmoji = enemyEmojis[Math.floor(Math.random() * enemyEmojis.length)];
    const enemyLevel = isMultiplayer && battleState ? battleState.opponentLevel : Math.floor(Math.random() * 5) + 1;

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
            {/* Multiplayer indicator */}
            {isMultiplayer && (
              <div className="flex items-center gap-1 text-green-400 text-[9px] font-bold">
                <Wifi className="w-2.5 h-2.5" />
                <span>LIVE</span>
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
            arenaTheme={currentArena}
          />
        </div>

        {/* Controls - always visible at bottom */}
        <div className="w-full max-w-md shrink-0">
          <div 
            className="bg-card/80 backdrop-blur-sm border-t border-border/30 px-1 py-0.5 flex flex-col items-center gap-0.5"
            style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom))' }}
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
            
            {/* Emote button + Elixir bar row */}
            <div className="flex items-center gap-2 w-full justify-center">
              {/* Emote button */}
              <button
                onClick={() => setShowEmotePanel(true)}
                className="w-8 h-8 bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 rounded-lg flex items-center justify-center border-2 border-amber-400 shadow-md transition-all hover:scale-105 active:scale-95"
                title="Emotes"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </button>
              
              {/* Elixir bar */}
              <div className="flex-1 max-w-[200px]">
                <ElixirBar 
                  elixir={gameState.playerElixir} 
                  isSuddenDeath={gameState.isSuddenDeath}
                />
              </div>
            </div>

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

      {/* Emote display overlay */}
      <EmoteDisplay messages={emoteMessages} />

      {/* Emote panel */}
      <EmotePanel 
        isOpen={showEmotePanel} 
        onClose={() => setShowEmotePanel(false)} 
        onEmoteSelect={handleEmoteSelect}
      />

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
