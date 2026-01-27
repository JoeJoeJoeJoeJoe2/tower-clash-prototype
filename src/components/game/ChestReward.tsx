import { useState, useEffect } from 'react';
import { ChestReward as ChestRewardType } from '@/types/game';
import { getCardById } from '@/data/cards';
import { GameCard } from './GameCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, Gift } from 'lucide-react';

interface ChestRewardProps {
  reward: ChestRewardType;
  onClose: () => void;
}

export function ChestReward({ reward, onClose }: ChestRewardProps) {
  const [stage, setStage] = useState<'closed' | 'opening' | 'open'>('closed');
  const [revealedCards, setRevealedCards] = useState<number>(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('opening'), 500);
    const timer2 = setTimeout(() => setStage('open'), 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    if (stage === 'open' && revealedCards < reward.cards.length) {
      const timer = setTimeout(() => {
        setRevealedCards(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stage, revealedCards, reward.cards.length]);

  const newCardsCount = reward.cards.filter(c => c.isNew).length;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="flex flex-col items-center gap-6 max-w-md w-full">
        {/* Chest */}
        <div className={cn(
          'relative transition-all duration-500',
          stage === 'closed' && 'scale-100',
          stage === 'opening' && 'scale-125',
          stage === 'open' && 'scale-50 opacity-30 -translate-y-8'
        )}>
          <div className={cn(
            'text-8xl transition-transform duration-500',
            stage === 'opening' && 'animate-bounce'
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

        {/* Title */}
        <div className={cn(
          'text-center transition-all duration-500',
          stage !== 'open' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        )}>
          <h2 className="game-title text-4xl text-amber-400 mb-2">Victory Chest!</h2>
          <p className="text-amber-200/70 text-sm">You earned {reward.cards.length} cards</p>
        </div>

        {/* Cards */}
        {stage === 'open' && (
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
        {stage === 'open' && revealedCards >= reward.cards.length && newCardsCount > 0 && (
          <p className="text-emerald-400 font-semibold text-center animate-fade-in">
            🌟 {newCardsCount} new card{newCardsCount > 1 ? 's' : ''} added to your collection!
          </p>
        )}

        {/* Close button */}
        {stage === 'open' && revealedCards >= reward.cards.length && (
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
