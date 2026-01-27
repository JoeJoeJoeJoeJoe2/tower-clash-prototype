import { Unit as UnitType } from '@/types/game';
import { getCardById } from '@/data/cards';
import { cn } from '@/lib/utils';

interface UnitProps {
  unit: UnitType;
}

export function Unit({ unit }: UnitProps) {
  const card = getCardById(unit.cardId);
  const healthPercent = (unit.health / unit.maxHealth) * 100;
  const healthClass = healthPercent > 60 ? 'health-full' : healthPercent > 30 ? 'health-mid' : 'health-low';

  // Animation transforms based on state
  const getAnimationStyle = () => {
    switch (unit.state) {
      case 'moving':
        return {
          transform: `translateY(${Math.sin(unit.animationFrame * 0.8) * 2}px)`,
        };
      case 'attacking':
        return {
          transform: `scale(${1 + Math.sin(unit.animationFrame * 1.5) * 0.15})`,
        };
      default:
        return {
          transform: `scale(${1 + Math.sin(unit.animationFrame * 0.3) * 0.05})`,
        };
    }
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
      style={{
        left: unit.position.x,
        top: unit.position.y,
        zIndex: Math.floor(unit.position.y)
      }}
    >
      {/* Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/30 rounded-full blur-sm" />
      
      {/* Unit body */}
      <div
        className={cn(
          'unit-sprite w-9 h-9 flex items-center justify-center text-lg rounded-full relative',
          unit.owner === 'player' ? 'unit-friendly' : 'unit-enemy'
        )}
        style={{
          ...getAnimationStyle(),
          background: `linear-gradient(135deg, ${card?.color || '#666'}cc, ${card?.color || '#666'}88)`,
          boxShadow: unit.state === 'attacking' 
            ? `0 0 12px ${card?.color || '#fff'}80` 
            : undefined
        }}
      >
        {/* Direction indicator */}
        <div className={cn(
          'absolute w-0 h-0 border-l-[4px] border-r-[4px] border-transparent',
          unit.direction === 'up' 
            ? 'top-0 border-b-[6px] border-b-white/50' 
            : 'bottom-0 border-t-[6px] border-t-white/50'
        )} />
        
        <span className={cn(
          'drop-shadow-md',
          unit.state === 'attacking' && 'animate-pulse'
        )}>
          {card?.emoji || '⚔️'}
        </span>

        {/* Attack effect */}
        {unit.state === 'attacking' && unit.animationFrame % 4 === 0 && (
          <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
        )}
      </div>
      
      {/* Health bar */}
      <div className="w-9 mt-0.5">
        <div className="health-bar-container h-1.5 rounded-full">
          <div
            className={cn('health-bar-fill', healthClass)}
            style={{ width: `${healthPercent}%` }}
          />
        </div>
      </div>

      {/* State indicator for debugging (hidden in production) */}
      {/* <span className="absolute -top-4 text-[8px] text-white bg-black/50 px-1 rounded">
        {unit.state}
      </span> */}
    </div>
  );
}
