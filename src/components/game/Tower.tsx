import { Tower as TowerType } from '@/types/game';
import { cn } from '@/lib/utils';

interface TowerProps {
  tower: TowerType;
}

export function Tower({ tower }: TowerProps) {
  const healthPercent = (tower.health / tower.maxHealth) * 100;
  const isDestroyed = tower.health <= 0;
  
  const healthClass = healthPercent > 60 ? 'health-full' : healthPercent > 30 ? 'health-mid' : 'health-low';

  const size = tower.type === 'king' ? 'w-14 h-14' : 'w-10 h-10';

  return (
    <div
      className={cn(
        'absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300',
        isDestroyed && 'opacity-30'
      )}
      style={{
        left: tower.position.x,
        top: tower.position.y
      }}
    >
      <div
        className={cn(
          'tower-base flex items-center justify-center text-lg',
          size,
          tower.owner === 'player' ? 'tower-friendly' : 'tower-enemy',
          tower.type === 'king' && 'tower-king'
        )}
      >
        {tower.type === 'king' ? '🏰' : '🗼'}
      </div>
      
      {!isDestroyed && (
        <div className="w-full mt-1">
          <div className="health-bar-container">
            <div
              className={cn('health-bar-fill', healthClass)}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>
      )}

      {isDestroyed && (
        <span className="text-xs text-destructive font-bold mt-1">💥</span>
      )}
    </div>
  );
}
