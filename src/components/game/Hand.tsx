import { CardDefinition } from '@/types/game';
import { GameCard } from './GameCard';

interface HandProps {
  cards: CardDefinition[];
  elixir: number;
  selectedIndex: number | null;
  onCardSelect: (index: number) => void;
}

export function Hand({ cards, elixir, selectedIndex, onCardSelect }: HandProps) {
  return (
    <div className="flex gap-2 justify-center">
      {cards.map((card, index) => (
        <GameCard
          key={`${card.id}-${index}`}
          card={card}
          isSelected={selectedIndex === index}
          canAfford={elixir >= card.elixirCost}
          onClick={() => onCardSelect(selectedIndex === index ? -1 : index)}
        />
      ))}
    </div>
  );
}
