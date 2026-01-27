import { memo } from 'react';
import { Projectile, SpawnEffect } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';

interface ProjectileProps {
  projectile: Projectile;
}

export const ProjectileComponent = memo(function ProjectileComponent({ projectile }: ProjectileProps) {
  const { from, to, progress, type, owner } = projectile;
  
  // Interpolate position
  const x = from.x + (to.x - from.x) * progress;
  const y = from.y + (to.y - from.y) * progress;
  
  // Calculate rotation angle
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        zIndex: 1000
      }}
    >
      {type === 'arrow' ? (
        <div className={cn(
          'w-6 h-1 rounded-full relative',
          owner === 'player' ? 'bg-amber-400' : 'bg-blue-400'
        )}>
          {/* Arrow head */}
          <div className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0',
            'border-l-[6px] border-y-[3px] border-y-transparent',
            owner === 'player' ? 'border-l-amber-300' : 'border-l-blue-300'
          )} />
          {/* Trail */}
          <div className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 w-3 h-0.5 -ml-2 opacity-50',
            owner === 'player' ? 'bg-amber-300' : 'bg-blue-300'
          )} />
        </div>
      ) : (
        <div className="relative">
          <div className={cn(
            'w-4 h-4 rounded-full animate-pulse',
            owner === 'player' ? 'bg-orange-500' : 'bg-purple-500'
          )} 
          style={{
            boxShadow: owner === 'player' 
              ? '0 0 12px #f97316, 0 0 24px #ea580c' 
              : '0 0 12px #a855f7, 0 0 24px #7c3aed'
          }}
          />
          {/* Fire trail */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full opacity-30"
            style={{
              background: owner === 'player' 
                ? 'radial-gradient(circle, #fbbf24, transparent)' 
                : 'radial-gradient(circle, #c084fc, transparent)'
            }}
          />
        </div>
      )}
    </div>
  );
});

interface SpawnEffectProps {
  effect: SpawnEffect;
}

export const SpawnEffectComponent = memo(function SpawnEffectComponent({ effect }: SpawnEffectProps) {
  const scale = 1 + effect.progress * 0.5;
  const opacity = 1 - effect.progress;
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: effect.position.x,
        top: effect.position.y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        zIndex: 999
      }}
    >
      {/* Spawn ring */}
      <div 
        className={cn(
          'w-16 h-16 rounded-full border-4',
          effect.owner === 'player' ? 'border-amber-400' : 'border-blue-400'
        )}
        style={{
          boxShadow: effect.owner === 'player'
            ? '0 0 20px #fbbf24, inset 0 0 20px #fbbf2440'
            : '0 0 20px #60a5fa, inset 0 0 20px #60a5fa40'
        }}
      />
      
      {/* Center emoji */}
      <div className="absolute inset-0 flex items-center justify-center text-2xl">
        {effect.emoji}
      </div>
    </div>
  );
});
