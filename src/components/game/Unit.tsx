import { Unit as UnitType } from '@/types/game';
import { getCardById } from '@/data/cards';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface UnitProps {
  unit: UnitType;
}

export const Unit = memo(function Unit({ unit }: UnitProps) {
  const card = getCardById(unit.cardId);
  if (!card) return null;
  
  const healthPercent = (unit.health / unit.maxHealth) * 100;
  const isPlayer = unit.owner === 'player';

  // Smoother animations based on state
  const getTransformStyle = () => {
    const frame = unit.animationFrame;
    
    switch (unit.state) {
      case 'moving':
        // Subtle bobbing while moving
        const bob = Math.sin(frame * 0.25) * 2;
        return `translateY(${bob}px)`;
      case 'attacking':
        // Shake when attacking
        const shake = Math.sin(frame * 0.6) * 3;
        const pulse = 1 + Math.sin(frame * 0.4) * 0.08;
        return `translateX(${shake}px) scale(${pulse})`;
      default:
        // Idle breathing
        const breath = 1 + Math.sin(frame * 0.08) * 0.03;
        return `scale(${breath})`;
    }
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: unit.position.x,
        top: unit.position.y,
        transform: 'translate(-50%, -50%)',
        zIndex: Math.floor(unit.position.y) + 10
      }}
    >
      {/* Shadow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/50 rounded-full blur-sm"
        style={{ transform: `translateX(-50%) scaleX(${unit.state === 'moving' ? 1.3 : 1})` }}
      />
      
      {/* Unit body */}
      <div
        className={cn(
          'w-10 h-10 flex items-center justify-center text-xl rounded-full relative',
          isPlayer ? 'ring-2 ring-blue-400' : 'ring-2 ring-red-400'
        )}
        style={{
          transform: getTransformStyle(),
          background: `linear-gradient(145deg, ${card.color}dd, ${card.color}99)`,
          boxShadow: unit.state === 'attacking' 
            ? `0 0 20px ${isPlayer ? '#3b82f6' : '#ef4444'}80, 0 4px 8px rgba(0,0,0,0.4)` 
            : `0 4px 8px rgba(0,0,0,0.4)`,
          transition: 'box-shadow 0.15s ease'
        }}
      >
        {/* Direction arrow */}
        {unit.state === 'moving' && (
          <div className={cn(
            'absolute w-0 h-0',
            unit.direction === 'up' 
              ? 'top-0 border-l-[5px] border-r-[5px] border-b-[7px] border-l-transparent border-r-transparent border-b-white/70' 
              : 'bottom-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-white/70'
          )} />
        )}
        
        <span className="drop-shadow-lg text-lg">{card.emoji}</span>

        {/* Attack flash */}
        {unit.state === 'attacking' && (
          <div 
            className="absolute inset-0 rounded-full animate-ping opacity-40"
            style={{
              background: `radial-gradient(circle, ${isPlayer ? '#3b82f6' : '#ef4444'} 0%, transparent 70%)`
            }}
          />
        )}
      </div>
      
      {/* Health bar */}
      <div className="w-10 mt-1">
        <div className="h-1.5 rounded-full bg-black/60 overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-200',
              healthPercent > 60 ? 'bg-green-400' : healthPercent > 30 ? 'bg-yellow-400' : 'bg-red-400'
            )}
            style={{ width: `${healthPercent}%` }}
          />
        </div>
      </div>
      
      {/* Card name */}
      <div 
        className={cn(
          "text-[7px] font-semibold text-center mt-0.5 px-1 rounded whitespace-nowrap",
          isPlayer ? "text-blue-200" : "text-red-200"
        )}
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
      >
        {card.name}
      </div>
    </div>
  );
});
