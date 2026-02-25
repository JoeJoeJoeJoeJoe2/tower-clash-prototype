import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Sparkles, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { allCards } from '@/data/cards';
import { evolutions, EVOLUTION_SHARDS_REQUIRED, getEvolution } from '@/data/evolutions';
import { GameCard } from './GameCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EvolutionShardsModalProps {
  evolutionShards: number;
  ownedCardIds: string[];
  unlockedEvolutions: string[];
  onUnlockEvolution: (cardId: string) => boolean;
  onClose: () => void;
}

export function EvolutionShardsModal({
  evolutionShards,
  ownedCardIds,
  unlockedEvolutions,
  onUnlockEvolution,
  onClose
}: EvolutionShardsModalProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // Get ALL evolution card IDs from the evolutions data
  const evolutionCardIds = evolutions.map(e => e.cardId);
  
  // Create cards for evolutions - use existing card data or create placeholder
  const evolvableCards = evolutionCardIds.map(cardId => {
    const existingCard = allCards.find(c => c.id === cardId);
    const evolution = getEvolution(cardId);
    
    if (existingCard) {
      return existingCard;
    }
    
    // Create placeholder card for evolutions without matching card in allCards
    if (evolution) {
      return {
        id: cardId,
        name: evolution.name.replace('Evolved ', ''),
        type: 'troop' as const,
        elixirCost: 3,
        emoji: evolution.emoji.replace('✨', ''),
        health: 500,
        damage: 100,
        attackSpeed: 1,
        moveSpeed: 50,
        range: 40,
        description: evolution.description,
        rarity: 'common' as const,
        color: '#8B5CF6',
        deployCooldown: 0.5,
        size: 'medium' as const,
        isFlying: false,
        targetType: 'both' as const
      };
    }
    
    return null;
  }).filter(Boolean);

  // Sort: owned first, then by whether they're already evolved, then alphabetically
  const sortedCards = [...evolvableCards].sort((a, b) => {
    if (!a || !b) return 0;
    const aOwned = ownedCardIds.includes(a.id);
    const bOwned = ownedCardIds.includes(b.id);
    const aEvolved = unlockedEvolutions.includes(a.id);
    const bEvolved = unlockedEvolutions.includes(b.id);
    
    // Owned but not evolved first
    if (aOwned && !aEvolved && (!bOwned || bEvolved)) return -1;
    if (bOwned && !bEvolved && (!aOwned || aEvolved)) return 1;
    // Then owned and evolved
    if (aOwned && aEvolved && !bOwned) return -1;
    if (bOwned && bEvolved && !aOwned) return 1;
    // Then by name
    return a.name.localeCompare(b.name);
  });

  const canUnlock = evolutionShards >= EVOLUTION_SHARDS_REQUIRED;
  const selectedEvolution = selectedCardId ? getEvolution(selectedCardId) : null;
  const isSelectedOwned = selectedCardId ? ownedCardIds.includes(selectedCardId) : false;
  const isSelectedEvolved = selectedCardId ? unlockedEvolutions.includes(selectedCardId) : false;

  const handleUnlock = () => {
    if (selectedCardId && canUnlock && isSelectedOwned && !isSelectedEvolved) {
      const success = onUnlockEvolution(selectedCardId);
      if (success) {
        setSelectedCardId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 flex flex-col overflow-x-hidden overflow-y-hidden">
      {/* Header - Compact */}
      <div className="flex-shrink-0 relative bg-gradient-to-b from-purple-900/50 to-transparent px-2 py-1 border-b border-purple-500/30">
        <button 
          onClick={onClose}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h1 className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Evolution Shards
          </h1>
          <div className="flex items-center justify-center gap-1">
            <div className="bg-purple-600/30 rounded-full px-2 py-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-purple-300 font-bold text-xs">{evolutionShards}</span>
              <span className="text-purple-400/70 text-[10px]">/ {EVOLUTION_SHARDS_REQUIRED}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex-shrink-0 ml-2 mr-2 mt-0.5 bg-purple-900/30 rounded p-1 border border-purple-500/30 max-w-md">
        <p className="text-[8px] text-purple-200/80 text-center">
          {evolutions.length} evolutions available! Select a card to view its ability.
        </p>
      </div>

      {/* Cards Grid - Scrollable area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 min-h-0 w-full">
        <div className="grid grid-cols-5 gap-1 w-full px-1">
          {sortedCards.map((card) => {
            if (!card) return null;
            const isOwned = ownedCardIds.includes(card.id);
            const isEvolved = unlockedEvolutions.includes(card.id);
            const evolution = getEvolution(card.id);
            const isSelected = selectedCardId === card.id;

            return (
              <button
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={cn(
                  "relative rounded p-0.5 transition-all flex flex-col items-center",
                  isSelected && "ring-2 ring-purple-400 bg-purple-500/20 scale-105",
                  !isSelected && isOwned && !isEvolved && "hover:bg-purple-500/10",
                  (!isOwned || isEvolved) && !isSelected && "opacity-50"
                )}
              >
                <div className="relative">
                  <GameCard card={card} size="tiny" canAfford={isOwned} />
                  
                  {/* Evolved checkmark */}
                  {isEvolved && (
                    <div className="absolute inset-0 bg-purple-900/60 rounded flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Locked overlay */}
                  {!isOwned && (
                    <div className="absolute inset-0 bg-background/70 rounded flex items-center justify-center">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Card name label */}
                <span className={cn(
                  "text-[5px] font-medium leading-tight text-center mt-0.5 line-clamp-1 w-full",
                  isEvolved ? "text-purple-300" : isOwned ? "text-foreground/80" : "text-muted-foreground"
                )}>
                  {card.name}
                </span>

                {/* Cycle indicator */}
                {evolution && (
                  <span className={cn(
                    "text-[5px] font-medium",
                    isEvolved ? "text-purple-400" : "text-purple-500/50"
                  )}>
                    {evolution.cycles}⚡
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom action area - Fixed height, centered */}
      <div className="flex-shrink-0 py-1 bg-gradient-to-t from-slate-950 via-slate-950 to-slate-950/90 border-t border-purple-500/20 w-full">
        <div className="max-w-md px-2">
          {selectedCardId && selectedEvolution ? (
            <div className="bg-purple-900/50 rounded-lg p-1.5 mb-1.5 border border-purple-500/30">
              <div className="flex items-center gap-1 mb-0.5">
                <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0" />
                <span className="text-[10px] font-bold text-purple-300 truncate">{selectedEvolution.name}</span>
                <span className="text-[8px] text-purple-400/70 ml-auto flex-shrink-0">{selectedEvolution.cycles}⚡</span>
              </div>
              <p className="text-[8px] text-purple-200/70 leading-snug line-clamp-2">{selectedEvolution.specialEffect}</p>
            </div>
          ) : null}

          <div className="flex justify-start gap-2 w-full">
            <Button
              onClick={onClose}
              variant="outline"
              className="h-7 px-4 text-[10px] font-bold rounded-md"
            >
              Close
            </Button>
            
            {selectedCardId && (
              <Button
                onClick={handleUnlock}
                disabled={!canUnlock || !isSelectedOwned || isSelectedEvolved}
                className={cn(
                  "h-7 px-3 text-[10px] font-bold rounded-md border-b-2",
                  canUnlock && isSelectedOwned && !isSelectedEvolved
                    ? "bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 border-purple-900 text-white"
                    : "bg-muted border-muted-foreground/20 text-muted-foreground"
                )}
              >
                {isSelectedEvolved ? (
                  'Evolved ✓'
                ) : !isSelectedOwned ? (
                  'Not Owned'
                ) : canUnlock ? (
                  <span className="flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Unlock
                  </span>
                ) : (
                  `Need ${EVOLUTION_SHARDS_REQUIRED - evolutionShards}`
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
