import { CardDefinition } from '@/types/game';
import { GameCard } from './GameCard';
import { cn } from '@/lib/utils';

interface HandProps {
  cards: CardDefinition[];
  elixir: number;
  selectedIndex: number | null;
  onCardSelect: (index: number) => void;
  nextCard?: CardDefinition;
  cardLevels: Record<string, number>; // Card ID -> level
}

export function Hand({ cards, elixir, selectedIndex, onCardSelect, nextCard, cardLevels }: HandProps) {
  return (
    <div className="flex gap-0.5 justify-center items-end">
      {/* Next card preview */}
      {nextCard && (
        <div className="flex flex-col items-center mr-0.5">
          <span className="text-[5px] text-muted-foreground mb-0.5">NEXT</span>
          <div className={cn(
            "w-6 h-7 rounded border border-border/50 bg-card/50 flex items-center justify-center",
            "opacity-70 scale-90"
          )}>
            <span className="text-xs">{nextCard.emoji}</span>
          </div>
        </div>
      )}
      
      {/* Hand cards */}
      {cards.map((card, index) => {
        if (!card) return null;
        
        return (
          <div key={`${card.id}-${index}`} className="relative">
            <GameCard
              card={card}
              isSelected={selectedIndex === index}
              canAfford={elixir >= card.elixirCost}
              onClick={() => onCardSelect(selectedIndex === index ? -1 : index)}
              size="small"
              level={cardLevels[card.id.replace('evo-', '')] || 1}
              showLevel={true}
            />
          </div>
        );
      })}
    </div>
  );
}
