import { CardDefinition } from '@/types/game';
import { GameCard } from './GameCard';
import { cn } from '@/lib/utils';

interface HandProps {
  cards: CardDefinition[];
  elixir: number;
  selectedIndex: number | null;
  onCardSelect: (index: number) => void;
  nextCard?: CardDefinition;
}

export function Hand({ cards, elixir, selectedIndex, onCardSelect, nextCard }: HandProps) {
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
      {cards.map((card, index) => (
        <GameCard
          key={`${card.id}-${index}`}
          card={card}
          isSelected={selectedIndex === index}
          canAfford={elixir >= card.elixirCost}
          onClick={() => onCardSelect(selectedIndex === index ? -1 : index)}
          size="medium"
        />
      ))}
    </div>
  );
}
