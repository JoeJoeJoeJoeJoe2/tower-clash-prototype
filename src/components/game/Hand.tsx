import { CardDefinition } from '@/types/game';
import { GameCard } from './GameCard';
import { cn } from '@/lib/utils';

interface HandProps {
  cards: CardDefinition[];
  elixir: number;
  selectedIndex: number | null;
  onCardSelect: (index: number) => void;
  nextCard?: CardDefinition;
  cooldowns: number[]; // Cooldown remaining for each slot
}

export function Hand({ cards, elixir, selectedIndex, onCardSelect, nextCard, cooldowns }: HandProps) {
  return (
    <div className="flex gap-2 justify-center items-end">
      {/* Next card preview */}
      {nextCard && (
        <div className="flex flex-col items-center mr-1">
          <span className="text-[8px] text-muted-foreground mb-0.5">NEXT</span>
          <div className={cn(
            "w-10 h-12 rounded border border-border/50 bg-card/50 flex items-center justify-center",
            "opacity-70 scale-90"
          )}>
            <span className="text-lg">{nextCard.emoji}</span>
          </div>
        </div>
      )}
      
      {/* Hand cards */}
      {cards.map((card, index) => {
        if (!card) return null;
        const cooldown = cooldowns[index] || 0;
        const isOnCooldown = cooldown > 0;
        
        return (
          <div key={`${card.id}-${index}`} className="relative">
            <GameCard
              card={card}
              isSelected={selectedIndex === index}
              canAfford={elixir >= card.elixirCost && !isOnCooldown}
              onClick={() => !isOnCooldown && onCardSelect(selectedIndex === index ? -1 : index)}
              size="medium"
            />
            {/* Cooldown overlay */}
            {isOnCooldown && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center pointer-events-none">
                <div 
                  className="absolute inset-x-0 bottom-0 bg-primary/40 transition-all duration-100"
                  style={{ height: `${(cooldown / card.deployCooldown) * 100}%` }}
                />
                <span className="text-white font-bold text-sm z-10 drop-shadow-lg">
                  {cooldown.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
