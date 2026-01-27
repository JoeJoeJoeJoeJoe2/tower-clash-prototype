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
    // Animate chest opening
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
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [stage, revealedCards, reward.cards.length]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="flex flex-col items-center gap-6 max-w-md w-full">
        {/* Chest */}
        <div className={cn(
          'relative transition-all duration-500',
          stage === 'closed' && 'scale-100',
          stage === 'opening' && 'scale-110 animate-pulse',
          stage === 'open' && 'scale-75 opacity-50'
        )}>
          <div className={cn(
            'text-8xl transition-transform duration-500',
            stage === 'opening' && 'animate-bounce'
          )}>
            {stage === 'open' ? '📭' : '📦'}
          </div>
          
          {stage === 'opening' && (
            <>
              <Sparkles className="absolute -top-4 -left-4 w-8 h-8 text-yellow-400 animate-spin" />
              <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-400 animate-spin" />
              <Sparkles className="absolute top-1/2 -left-8 w-6 h-6 text-yellow-300 animate-pulse" />
              <Sparkles className="absolute top-1/2 -right-8 w-6 h-6 text-yellow-300 animate-pulse" />
            </>
          )}
        </div>

        {/* Title */}
        <div className={cn(
          'text-center transition-opacity duration-300',
          stage !== 'open' && 'opacity-0'
        )}>
          <h2 className="game-title text-3xl text-primary mb-2">Victory Chest!</h2>
          <p className="text-muted-foreground text-sm">You earned these cards</p>
        </div>

        {/* Cards */}
        {stage === 'open' && (
          <div className="flex flex-wrap justify-center gap-4">
            {reward.cards.map((cardReward, idx) => {
              const card = getCardById(cardReward.cardId);
              if (!card) return null;
              
              const isRevealed = idx < revealedCards;
              
              return (
                <div
                  key={idx}
                  className={cn(
                    'transition-all duration-500 relative',
                    isRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'
                  )}
                >
                  <GameCard card={card} size="large" />
                  
                  {cardReward.isNew && isRevealed && (
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold animate-bounce flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      NEW!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Close button */}
        {stage === 'open' && revealedCards >= reward.cards.length && (
          <Button 
            onClick={onClose}
            size="lg"
            className="mt-4 animate-fade-in"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
