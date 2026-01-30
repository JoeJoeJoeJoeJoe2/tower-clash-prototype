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
  
  // Get all cards that have evolutions
  const evolvableCards = allCards.filter(card => 
    evolutions.some(e => e.cardId === card.id) && card.elixirCost > 0
  );

  // Sort: owned first, then by whether they're already evolved
  const sortedCards = [...evolvableCards].sort((a, b) => {
    const aOwned = ownedCardIds.includes(a.id);
    const bOwned = ownedCardIds.includes(b.id);
    const aEvolved = unlockedEvolutions.includes(a.id);
    const bEvolved = unlockedEvolutions.includes(b.id);
    
    // Owned but not evolved first
    if (aOwned && !aEvolved && (!bOwned || bEvolved)) return -1;
    if (bOwned && !bEvolved && (!aOwned || aEvolved)) return 1;
    // Then owned and evolved
    if (aOwned && bOwned) return 0;
    // Then not owned
    if (aOwned) return -1;
    if (bOwned) return 1;
    return 0;
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
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#1a1a3a] via-[#0d1a2d] to-[#0a1525] flex flex-col">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-purple-900/50 to-transparent px-4 py-3 border-b border-purple-500/30">
        <button 
          onClick={onClose}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Evolution Shards
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="bg-purple-600/30 rounded-full px-3 py-1 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 font-bold">{evolutionShards}</span>
              <span className="text-purple-400/70 text-sm">/ {EVOLUTION_SHARDS_REQUIRED} needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-4 mt-3 bg-purple-900/30 rounded-xl p-3 border border-purple-500/30">
        <p className="text-xs text-purple-200/80 text-center">
          Select a card to unlock its evolution. Evolved cards gain powerful special abilities in battle!
        </p>
      </div>

      {/* Cards Grid */}
      <ScrollArea className="flex-1 px-4 mt-3">
        <div className="grid grid-cols-4 gap-3 pb-32">
          {sortedCards.map((card) => {
            const isOwned = ownedCardIds.includes(card.id);
            const isEvolved = unlockedEvolutions.includes(card.id);
            const evolution = getEvolution(card.id);
            const isSelected = selectedCardId === card.id;

            return (
              <button
                key={card.id}
                onClick={() => isOwned && !isEvolved && setSelectedCardId(card.id)}
                disabled={!isOwned || isEvolved}
                className={cn(
                  "relative rounded-xl p-1 transition-all",
                  isSelected && "ring-2 ring-purple-400 bg-purple-500/20",
                  isOwned && !isEvolved && "hover:bg-purple-500/10",
                  (!isOwned || isEvolved) && "opacity-60"
                )}
              >
                <div className="relative">
                  <GameCard card={card} size="small" canAfford={isOwned} />
                  
                  {/* Evolved checkmark */}
                  {isEvolved && (
                    <div className="absolute inset-0 bg-purple-900/60 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Locked overlay */}
                  {!isOwned && (
                    <div className="absolute inset-0 bg-gray-900/70 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Evolution shard indicators */}
                <div className="flex justify-center gap-0.5 mt-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-3 rounded-sm",
                        isEvolved 
                          ? "bg-gradient-to-b from-purple-400 to-pink-500" 
                          : "bg-purple-900/50 border border-purple-500/30"
                      )}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Bottom action area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a1525] via-[#0a1525] to-transparent">
        {selectedCardId && selectedEvolution ? (
          <div className="bg-purple-900/50 rounded-xl p-3 mb-3 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-purple-300">{selectedEvolution.name}</span>
            </div>
            <p className="text-xs text-purple-200/70">{selectedEvolution.specialEffect}</p>
          </div>
        ) : null}

        <Button
          onClick={selectedCardId ? handleUnlock : onClose}
          disabled={selectedCardId ? (!canUnlock || !isSelectedOwned || isSelectedEvolved) : false}
          className={cn(
            "w-full h-12 text-lg font-bold rounded-xl border-b-4",
            selectedCardId && canUnlock && isSelectedOwned && !isSelectedEvolved
              ? "bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 border-purple-900 text-white"
              : "bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 border-blue-900 text-white"
          )}
        >
          {selectedCardId ? (
            canUnlock && isSelectedOwned && !isSelectedEvolved ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Unlock Evolution ({EVOLUTION_SHARDS_REQUIRED} Shards)
              </>
            ) : isSelectedEvolved ? (
              'Already Evolved'
            ) : !isSelectedOwned ? (
              'Card Not Owned'
            ) : (
              `Need ${EVOLUTION_SHARDS_REQUIRED - evolutionShards} More Shards`
            )
          ) : (
            'OK'
          )}
        </Button>
      </div>
    </div>
  );
}
