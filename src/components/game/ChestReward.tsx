import { useState, useEffect, useCallback } from 'react';
import { ChestReward as ChestRewardType } from '@/types/game';
import { getCardById } from '@/data/cards';
import { GameCard } from './GameCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, Gift, Coins, Star } from 'lucide-react';

interface ChestRewardProps {
  onGenerateReward: (stars: number) => ChestRewardType | null;
  onClose: () => void;
}

export function ChestReward({ onGenerateReward, onClose }: ChestRewardProps) {
  const [stage, setStage] = useState<'clicking' | 'opening' | 'open'>('clicking');
  const [clicks, setClicks] = useState(0);
  const [stars, setStars] = useState(0);
  const [reward, setReward] = useState<ChestRewardType | null>(null);
  const [revealedCards, setRevealedCards] = useState<number>(0);

  const maxClicks = 5;

  const handleChestClick = useCallback(() => {
    if (stage !== 'clicking') return;
    
    const newClicks = clicks + 1;
    setClicks(newClicks);
    
    // First click always gives a star
    if (newClicks === 1) {
      setStars(1);
    } else if (stars < 5) {
      // 50% chance for additional stars
      if (Math.random() < 0.5) {
        setStars(prev => Math.min(prev + 1, 5));
      }
    }
    
    // After 5 clicks, start opening
    if (newClicks >= maxClicks) {
      setTimeout(() => setStage('opening'), 300);
    }
  }, [stage, clicks, stars]);

  // Generate reward when opening stage starts
  useEffect(() => {
    if (stage === 'opening' && !reward) {
      const generatedReward = onGenerateReward(stars);
      setReward(generatedReward);
      const timer = setTimeout(() => setStage('open'), 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, reward, stars, onGenerateReward]);

  useEffect(() => {
    if (stage === 'open' && reward && revealedCards < reward.cards.length) {
      const timer = setTimeout(() => {
        setRevealedCards(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stage, revealedCards, reward]);

  const newCardsCount = reward?.cards.filter(c => c.isNew).length || 0;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="flex flex-col items-center gap-6 max-w-md w-full">
        {/* Chest */}
        <div 
          className={cn(
            'relative transition-all duration-500 cursor-pointer select-none',
            stage === 'clicking' && 'hover:scale-110 active:scale-95',
            stage === 'opening' && 'scale-125',
            stage === 'open' && 'scale-50 opacity-30 -translate-y-8'
          )}
          onClick={handleChestClick}
        >
          {/* Stars above chest */}
          {stars > 0 && stage !== 'open' && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1">
              {Array.from({ length: stars }).map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    'w-6 h-6 text-amber-400 fill-amber-400 animate-pulse',
                    i === stars - 1 && 'animate-bounce'
                  )} 
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          )}
          
          <div className={cn(
            'text-8xl transition-transform duration-500',
            stage === 'opening' && 'animate-bounce',
            stage === 'clicking' && clicks > 0 && 'animate-pulse'
          )}>
            {stage === 'open' ? '✨' : stage === 'opening' ? '📦' : '🎁'}
          </div>
          
          {stage === 'opening' && (
            <>
              <Sparkles className="absolute -top-6 -left-6 w-10 h-10 text-amber-400 animate-spin" />
              <Sparkles className="absolute -top-6 -right-6 w-10 h-10 text-amber-400 animate-spin" style={{ animationDirection: 'reverse' }} />
              <Sparkles className="absolute top-1/2 -left-10 w-8 h-8 text-yellow-300 animate-pulse" />
              <Sparkles className="absolute top-1/2 -right-10 w-8 h-8 text-yellow-300 animate-pulse" />
              <div className="absolute inset-0 animate-ping">
                <div className="w-full h-full rounded-full bg-amber-500/30" />
              </div>
            </>
          )}
        </div>

        {/* Click progress circles */}
        {stage === 'clicking' && (
          <div className="flex gap-2">
            {Array.from({ length: maxClicks }).map((_, i) => (
              <div 
                key={i}
                className={cn(
                  'w-4 h-4 rounded-full border-2 transition-all duration-300',
                  i < clicks 
                    ? 'bg-amber-400 border-amber-400 scale-110' 
                    : 'bg-transparent border-amber-400/50'
                )}
              />
            ))}
          </div>
        )}

        {/* Clicking instruction */}
        {stage === 'clicking' && (
          <p className="text-amber-200/80 text-sm animate-pulse">
            Tap the chest to open! ({maxClicks - clicks} taps left)
          </p>
        )}

        {/* Title */}
        {reward && (
          <div className={cn(
            'text-center transition-all duration-500',
            stage !== 'open' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          )}>
            <h2 className="game-title text-4xl text-amber-400 mb-2">
              {stars >= 4 ? '🌟 Legendary Chest!' : stars >= 3 ? '✨ Epic Chest!' : stars >= 2 ? '💫 Rare Chest!' : 'Victory Chest!'}
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {Array.from({ length: stars }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-amber-200/70 text-sm">You earned {reward.cards.length} cards</p>
            {reward.goldEarned && reward.goldEarned > 0 && (
              <div className="flex items-center justify-center gap-2 mt-2 bg-amber-500/20 rounded-full px-4 py-1">
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300 font-bold">+{reward.goldEarned} Gold</span>
              </div>
            )}
          </div>
        )}

        {/* Cards */}
        {stage === 'open' && reward && (
          <div className="flex flex-wrap justify-center gap-4 min-h-[140px]">
            {reward.cards.map((cardReward, idx) => {
              const card = getCardById(cardReward.cardId);
              if (!card) return null;
              
              const isRevealed = idx < revealedCards;
              
              return (
                <div
                  key={idx}
                  className={cn(
                    'transition-all duration-500 relative',
                    isRevealed 
                      ? 'opacity-100 translate-y-0 scale-100 rotate-0' 
                      : 'opacity-0 translate-y-12 scale-50 rotate-12'
                  )}
                  style={{
                    transitionDelay: isRevealed ? '0ms' : `${idx * 100}ms`
                  }}
                >
                  <GameCard card={card} size="large" />
                  
                  {cardReward.isNew && isRevealed && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-green-400 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce flex items-center gap-1 shadow-lg">
                      <Gift className="w-3 h-3" />
                      NEW!
                    </div>
                  )}
                  
                  {isRevealed && (
                    <div 
                      className="absolute inset-0 rounded-lg pointer-events-none animate-ping opacity-0"
                      style={{ 
                        animationIterationCount: 1,
                        animationDuration: '0.5s',
                        opacity: 0.3,
                        background: cardReward.isNew 
                          ? 'radial-gradient(circle, #22c55e 0%, transparent 70%)'
                          : 'radial-gradient(circle, #f59e0b 0%, transparent 70%)'
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {stage === 'open' && reward && revealedCards >= reward.cards.length && newCardsCount > 0 && (
          <p className="text-emerald-400 font-semibold text-center animate-fade-in">
            🌟 {newCardsCount} new card{newCardsCount > 1 ? 's' : ''} added to your collection!
          </p>
        )}

        {/* Close button */}
        {stage === 'open' && reward && revealedCards >= reward.cards.length && (
          <Button 
            onClick={onClose}
            size="lg"
            className="mt-2 animate-fade-in bg-amber-600 hover:bg-amber-500 text-white font-bold px-8"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
