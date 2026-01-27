import { Unit as UnitType } from '@/types/game';
import { getCardById } from '@/data/cards';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface UnitProps {
  unit: UnitType;
}

export const Unit = memo(function Unit({ unit }: UnitProps) {
  const card = getCardById(unit.cardId);
  const healthPercent = (unit.health / unit.maxHealth) * 100;
  const healthClass = healthPercent > 60 ? 'health-full' : healthPercent > 30 ? 'health-mid' : 'health-low';

  // Smoother animations based on state
  const getTransformStyle = () => {
    const baseScale = 1;
    const frame = unit.animationFrame;
    
    switch (unit.state) {
      case 'moving':
        // Subtle bobbing while moving
        const bob = Math.sin(frame * 0.3) * 1.5;
        return `translateY(${bob}px)`;
      case 'attacking':
        // Pulse when attacking
        const pulse = 1 + Math.sin(frame * 0.5) * 0.1;
        return `scale(${pulse})`;
      default:
        // Idle breathing
        const breath = 1 + Math.sin(frame * 0.1) * 0.02;
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
        zIndex: Math.floor(unit.position.y)
      }}
    >
      {/* Shadow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-2 bg-black/40 rounded-full blur-sm"
        style={{ transform: `translateX(-50%) scaleX(${unit.state === 'moving' ? 1.2 : 1})` }}
      />
      
      {/* Unit body */}
      <div
        className={cn(
          'w-10 h-10 flex items-center justify-center text-xl rounded-full relative',
          unit.owner === 'player' ? 'ring-2 ring-amber-400' : 'ring-2 ring-blue-400'
        )}
        style={{
          transform: getTransformStyle(),
          background: `linear-gradient(145deg, ${card?.color || '#666'}dd, ${card?.color || '#666'}99)`,
          boxShadow: unit.state === 'attacking' 
            ? `0 0 16px ${card?.color || '#fff'}aa, 0 4px 8px rgba(0,0,0,0.3)` 
            : `0 4px 8px rgba(0,0,0,0.3)`,
          transition: 'box-shadow 0.15s ease'
        }}
      >
        {/* Direction arrow */}
        <div className={cn(
          'absolute w-0 h-0',
          unit.direction === 'up' 
            ? 'top-0 border-l-[5px] border-r-[5px] border-b-[7px] border-l-transparent border-r-transparent border-b-white/60' 
            : 'bottom-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-white/60'
        )} />
        
        <span className="drop-shadow-lg">{card?.emoji || '⚔️'}</span>

        {/* Attack flash */}
        {unit.state === 'attacking' && unit.animationFrame % 15 < 5 && (
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent)',
              animation: 'ping 0.3s ease-out'
            }}
          />
        )}
      </div>
      
      {/* Health bar */}
      <div className="w-10 mt-1">
        <div className="health-bar-container h-1.5 rounded-full">
          <div
            className={cn('health-bar-fill', healthClass)}
            style={{ 
              width: `${healthPercent}%`,
              transition: 'width 0.2s ease-out'
            }}
          />
        </div>
      </div>
    </div>
  );
});
