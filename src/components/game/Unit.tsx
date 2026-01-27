import { Unit as UnitType } from '@/types/game';
import { allCards } from '@/data/cards';
import { cn } from '@/lib/utils';

interface UnitProps {
  unit: UnitType;
}

export function Unit({ unit }: UnitProps) {
  const card = allCards.find(c => c.id === unit.cardId);
  const healthPercent = (unit.health / unit.maxHealth) * 100;
  const healthClass = healthPercent > 60 ? 'health-full' : healthPercent > 30 ? 'health-mid' : 'health-low';

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
      style={{
        left: unit.position.x,
        top: unit.position.y
      }}
    >
      <div
        className={cn(
          'unit-sprite w-8 h-8 flex items-center justify-center text-sm',
          unit.owner === 'player' ? 'unit-friendly bg-amber-600' : 'unit-enemy bg-blue-600'
        )}
      >
        {card?.emoji || '⚔️'}
      </div>
      
      <div className="w-8 mt-0.5">
        <div className="health-bar-container h-1">
          <div
            className={cn('health-bar-fill', healthClass)}
            style={{ width: `${healthPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
