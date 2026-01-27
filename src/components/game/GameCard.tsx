import { CardDefinition } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameCardProps {
  card: CardDefinition;
  isSelected: boolean;
  canAfford: boolean;
  onClick: () => void;
}

export function GameCard({ card, isSelected, canAfford, onClick }: GameCardProps) {
  return (
    <div
      className={cn(
        'game-card relative w-16 h-20 flex flex-col items-center justify-center',
        !canAfford && 'disabled',
        isSelected && 'selected'
      )}
      onClick={() => canAfford && onClick()}
    >
      <div className="card-cost text-white">
        {card.elixirCost}
      </div>
      
      <span className="text-2xl mt-1">{card.emoji}</span>
      
      <span className="text-[10px] font-bold text-foreground mt-1 text-center leading-tight">
        {card.name}
      </span>
    </div>
  );
}
