import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Sparkles, Check, Lock, X, Swords, Heart, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { allCards } from '@/data/cards';
import { evolutions, EVOLUTION_SHARDS_REQUIRED, getEvolution } from '@/data/evolutions';
import { GameCard } from './GameCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardDefinition } from '@/types/game';
import { getCardLevel } from '@/lib/cardLevels';

const rarityConfig: Record<string, { bgColor: string }> = {
  common: { bgColor: 'bg-slate-500' },
  rare: { bgColor: 'bg-blue-500' },
  epic: { bgColor: 'bg-purple-500' },
  legendary: { bgColor: 'bg-amber-500' },
  champion: { bgColor: 'bg-pink-500' },
};

interface EvolutionShardsModalProps {
  evolutionShards: number;
  ownedCardIds: string[];
  unlockedEvolutions: string[];
  cardCopies?: Record<string, number>;
  onUnlockEvolution: (cardId: string) => boolean;
  onClose: () => void;
}

export function EvolutionShardsModal({
  evolutionShards,
  ownedCardIds,
  unlockedEvolutions,
  cardCopies = {},
  onUnlockEvolution,
  onClose
}: EvolutionShardsModalProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [detailCard, setDetailCard] = useState<CardDefinition | null>(null);
  
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
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 flex flex-col overflow-y-auto pr-[30%]">
        {/* Back button */}
        <div className="flex-shrink-0 px-2 py-1">
          <button 
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Cards Grid - Scrollable area */}
        <div className="flex-1 overflow-y-auto min-h-0 w-full">
          <div className="px-0">
          {/* Title directly above cards */}
          <div className="flex items-center gap-1 mb-0.5 px-0.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h1 className="text-sm font-bold text-foreground">Evolution Shards</h1>
            <div className="bg-purple-600/30 rounded-full px-2 py-0.5 flex items-center gap-1 ml-auto">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-purple-300 font-bold text-xs">{evolutionShards}</span>
              <span className="text-purple-400/70 text-[10px]">/ {EVOLUTION_SHARDS_REQUIRED}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-0 w-full">
          {sortedCards.map((card) => {
            if (!card) return null;
            const isOwned = ownedCardIds.includes(card.id);
            const isEvolved = unlockedEvolutions.includes(card.id);
            const evolution = getEvolution(card.id);
            const isSelected = selectedCardId === card.id;

            return (
              <button
                key={card.id}
                onClick={() => {
                  if (selectedCardId === card.id) {
                    setDetailCard(card as CardDefinition);
                  } else {
                    setSelectedCardId(card.id);
                  }
                }}
                className={cn(
                  "relative rounded p-0 transition-all flex flex-col items-center justify-self-center",
                  isSelected && "ring-2 ring-purple-400 bg-purple-500/20 scale-105 z-10",
                  !isSelected && isOwned && !isEvolved && "hover:bg-purple-500/10",
                  (!isOwned || isEvolved) && !isSelected && "opacity-50"
                )}
              >
                <div className="relative">
                  <GameCard card={card} size="small" canAfford={isOwned} />
                  
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
      </div>

        {/* Bottom action area */}
        <div className="flex-shrink-0 py-1 border-t border-purple-500/20 w-full px-2">
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

      {/* Card Detail Modal */}
      {detailCard && (() => {
        const isLocked = !ownedCardIds.includes(detailCard.id);
        const copies = cardCopies[detailCard.id] || 0;
        const cardLevel = getCardLevel(copies);
        const evolution = getEvolution(detailCard.id);
        const rarityBorder: Record<string, string> = {
          common: 'border-slate-400',
          rare: 'border-blue-400',
          epic: 'border-purple-400',
          legendary: 'border-amber-400',
          champion: 'border-pink-400'
        };
        return (
          <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4 pr-[30%]" onClick={() => setDetailCard(null)}>
            <div
              className={cn('bg-card border-2 rounded-2xl p-5 max-w-[280px] w-full shadow-2xl relative', rarityBorder[detailCard.rarity] || 'border-border')}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setDetailCard(null)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center gap-2 mb-4">
                <span className="text-5xl">{detailCard.emoji}</span>
                <h3 className="text-lg font-bold text-foreground">{detailCard.name}</h3>
                <span className={cn('text-xs font-semibold capitalize px-2 py-0.5 rounded-full text-white', rarityConfig[detailCard.rarity]?.bgColor || 'bg-muted')}>
                  {detailCard.rarity}
                </span>
                {isLocked && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    <Lock className="w-3 h-3" /> Not yet unlocked
                  </div>
                )}
                {!isLocked && (
                  <div className="text-xs text-amber-400 font-bold">Level {cardLevel}</div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center mb-4">{detailCard.description}</p>
              {evolution && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 mb-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-xs font-bold text-purple-300">Evolution</span>
                    <span className="text-[10px] text-purple-400/70 ml-auto">{evolution.cycles}⚡</span>
                  </div>
                  <p className="text-[10px] text-purple-200/70">{evolution.specialEffect}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center bg-muted/50 rounded-lg p-2">
                  <Droplets className="w-4 h-4 text-blue-400 mb-1" />
                  <span className="text-xs font-bold text-foreground">{detailCard.elixirCost}</span>
                  <span className="text-[9px] text-muted-foreground">Elixir</span>
                </div>
                <div className="flex flex-col items-center bg-muted/50 rounded-lg p-2">
                  <Heart className="w-4 h-4 text-red-400 mb-1" />
                  <span className="text-xs font-bold text-foreground">{detailCard.health}</span>
                  <span className="text-[9px] text-muted-foreground">HP</span>
                </div>
                <div className="flex flex-col items-center bg-muted/50 rounded-lg p-2">
                  <Swords className="w-4 h-4 text-orange-400 mb-1" />
                  <span className="text-xs font-bold text-foreground">{detailCard.damage}</span>
                  <span className="text-[9px] text-muted-foreground">DMG</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
