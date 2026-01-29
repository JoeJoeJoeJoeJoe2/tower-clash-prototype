import { allCards } from '@/data/cards';
import { evolutions, getEvolution, EVOLUTION_SHARDS_REQUIRED } from '@/data/evolutions';
import { GameCard } from './GameCard';
import { Lock, Sparkles } from 'lucide-react';
import { getCardLevel, getLevelProgress, MAX_LEVEL } from '@/lib/cardLevels';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CardCollectionProps {
  ownedCardIds: string[];
  cardCopies: Record<string, number>;
  evolutionShards: number;
  unlockedEvolutions: string[];
}

const rarityConfig = {
  common: { label: 'Common', gradient: 'from-slate-500 to-slate-600', textColor: 'text-slate-300' },
  rare: { label: 'Rare', gradient: 'from-blue-500 to-blue-600', textColor: 'text-blue-300' },
  epic: { label: 'Epic', gradient: 'from-purple-500 to-purple-600', textColor: 'text-purple-300' },
  legendary: { label: 'Legendary', gradient: 'from-amber-500 to-amber-600', textColor: 'text-amber-300' },
  champion: { label: 'Champion', gradient: 'from-pink-500 to-rose-600', textColor: 'text-pink-300' }
} as const;

type Rarity = keyof typeof rarityConfig;

const rarityOrder: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'champion'];

export function CardCollection({ 
  ownedCardIds, 
  cardCopies, 
  evolutionShards,
  unlockedEvolutions 
}: CardCollectionProps) {
  // Filter out tower troops (0 elixir cost)
  const collectibleCards = allCards.filter(c => c.elixirCost > 0);
  const ownedCount = collectibleCards.filter(c => ownedCardIds.includes(c.id)).length;
  const totalCount = collectibleCards.length;

  const cardsByRarity = rarityOrder.map((rarity) => ({
    rarity,
    config: rarityConfig[rarity],
    cards: collectibleCards.filter((c) => c.rarity === rarity)
  })).filter(group => group.cards.length > 0);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 pb-8 space-y-4">
        {/* Header Stats */}
        <div className="flex items-center justify-between bg-card/50 rounded-xl p-3 border border-border">
          <div>
            <h1 className="game-title text-2xl text-primary">Collection</h1>
            <p className="text-xs text-muted-foreground">
              {ownedCount}/{totalCount} cards unlocked
            </p>
          </div>
          
          {/* Evolution Shards Display */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg px-3 py-2 border border-purple-500/30">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div className="text-right">
              <div className="text-sm font-bold text-purple-300">{evolutionShards}</div>
              <div className="text-[9px] text-purple-400/70">Evolution Shards</div>
            </div>
          </div>
        </div>

        {/* Cards by Rarity */}
        {cardsByRarity.map(({ rarity, config, cards }) => {
          const ownedInRarity = cards.filter(c => ownedCardIds.includes(c.id)).length;
          
          return (
            <section key={rarity} className="bg-card/30 border border-border rounded-xl overflow-hidden">
              {/* Rarity Header */}
              <div className={cn(
                'flex items-center justify-between px-4 py-2 bg-gradient-to-r',
                config.gradient
              )}>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  {config.label}
                </h2>
                <span className="text-xs text-white/80 font-medium">
                  {ownedInRarity}/{cards.length}
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-4 gap-2 p-3">
                {cards.map((card) => {
                  const isLocked = !ownedCardIds.includes(card.id);
                  const copies = cardCopies[card.id] || 0;
                  const level = getCardLevel(copies);
                  const { current, required, progress: levelProgress } = getLevelProgress(copies);
                  const isMaxLevel = level >= MAX_LEVEL;
                  const evolution = getEvolution(card.id);
                  const isEvolved = unlockedEvolutions.includes(card.id);

                  return (
                    <div key={card.id} className="relative flex flex-col items-center">
                      {/* Card */}
                      <div className="relative">
                        <GameCard 
                          card={card} 
                          size="small" 
                          canAfford={!isLocked}
                          level={level}
                          showLevel={!isLocked}
                        />
                        
                        {/* Locked Overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 rounded-lg bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-foreground bg-card/90 border border-border rounded-full px-2 py-0.5">
                              <Lock className="h-2.5 w-2.5" />
                            </div>
                          </div>
                        )}

                        {/* Evolution Badge */}
                        {evolution && !isLocked && (
                          <div className={cn(
                            'absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center',
                            isEvolved 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                              : 'bg-muted border border-purple-500/50'
                          )}>
                            <Sparkles className={cn(
                              'w-2.5 h-2.5',
                              isEvolved ? 'text-white' : 'text-purple-400'
                            )} />
                          </div>
                        )}
                      </div>

                      {/* Card Count / Progress */}
                      {!isLocked && (
                        <div className="w-full mt-1">
                          {isMaxLevel ? (
                            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded px-1.5 py-0.5">
                              <div className="text-[8px] text-center text-amber-400 font-bold">MAX</div>
                            </div>
                          ) : (
                            <div className="bg-card/50 rounded px-1 py-0.5">
                              <Progress 
                                value={levelProgress * 100} 
                                className="h-1 bg-muted"
                              />
                              <div className="text-[7px] text-center text-muted-foreground mt-0.5 font-medium">
                                {current}/{required}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Locked card count placeholder */}
                      {isLocked && (
                        <div className="w-full mt-1 bg-muted/30 rounded px-1 py-0.5">
                          <div className="text-[7px] text-center text-muted-foreground/50 font-medium">
                            0/2
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Evolution Info Footer */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-purple-300">Evolution Shards</h3>
          </div>
          <p className="text-xs text-purple-200/70">
            Collect {EVOLUTION_SHARDS_REQUIRED} shards from 5-star chests to unlock a card evolution. 
            Evolved cards gain bonus stats and special abilities!
          </p>
          <div className="mt-2 text-[10px] text-purple-400/60">
            {unlockedEvolutions.length}/{evolutions.length} evolutions unlocked
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
