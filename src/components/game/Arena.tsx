import { GameState, Position } from '@/types/game';
import { Projectile, SpawnEffect, DamageNumber } from '@/hooks/useGameState';
import { Tower } from './Tower';
import { Unit } from './Unit';
import { ProjectileComponent, SpawnEffectComponent } from './Projectile';
import { cn } from '@/lib/utils';

interface ArenaProps {
  gameState: GameState;
  projectiles: Projectile[];
  spawnEffects: SpawnEffect[];
  damageNumbers: DamageNumber[];
  arenaWidth: number;
  arenaHeight: number;
  onArenaClick: (position: Position) => void;
}

function DamageNumberComponent({ dmg }: { dmg: DamageNumber }) {
  const opacity = 1 - dmg.progress;
  const translateY = -30 * dmg.progress;
  
  return (
    <div
      className={cn(
        "absolute pointer-events-none font-bold text-sm z-50",
        dmg.isCritical ? "text-amber-400 text-base" : "text-red-400"
      )}
      style={{
        left: dmg.position.x,
        top: dmg.position.y,
        transform: `translate(-50%, ${translateY}px) scale(${1 + dmg.progress * 0.3})`,
        opacity,
        textShadow: '0 2px 4px rgba(0,0,0,0.8)'
      }}
    >
      -{dmg.damage}
    </div>
  );
}

export function Arena({ 
  gameState, 
  projectiles, 
  spawnEffects,
  damageNumbers,
  arenaWidth, 
  arenaHeight, 
  onArenaClick 
}: ArenaProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onArenaClick({ x, y });
  };

  return (
    <div
      className="arena-field relative rounded-xl overflow-hidden border-4 border-muted shadow-xl"
      style={{ width: arenaWidth, height: arenaHeight }}
      onClick={handleClick}
    >
      {/* Grid pattern for depth */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Enemy side shading */}
      <div 
        className="absolute inset-x-0 top-0"
        style={{ 
          height: arenaHeight / 2,
          background: 'linear-gradient(to bottom, rgba(239,68,68,0.1), transparent)'
        }}
      />
      
      {/* Player side shading */}
      <div 
        className="absolute inset-x-0 bottom-0"
        style={{ 
          height: arenaHeight / 2,
          background: 'linear-gradient(to top, rgba(59,130,246,0.1), transparent)'
        }}
      />
      
      {/* River line */}
      <div 
        className="absolute left-0 right-0 h-4"
        style={{ 
          top: arenaHeight / 2 - 8,
          background: 'linear-gradient(to bottom, transparent, #3b82f660, #60a5fa80, #3b82f660, transparent)'
        }}
      />
      
      {/* Bridge left */}
      <div 
        className="absolute w-16 h-6 rounded-sm border border-amber-900/50"
        style={{ 
          left: 40, 
          top: arenaHeight / 2 - 12,
          background: 'linear-gradient(to bottom, #a16207, #78350f)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
        }}
      />
      
      {/* Bridge right */}
      <div 
        className="absolute w-16 h-6 rounded-sm border border-amber-900/50"
        style={{ 
          right: 40, 
          top: arenaHeight / 2 - 12,
          background: 'linear-gradient(to bottom, #a16207, #78350f)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
        }}
      />

      {/* Placement zone indicator */}
      {gameState.selectedCardIndex !== null && (
        <div 
          className={cn('placement-zone active')}
          style={{ 
            top: arenaHeight / 2,
            height: arenaHeight / 2
          }}
        />
      )}

      {/* Towers */}
      {gameState.playerTowers.map(tower => (
        <Tower key={tower.id} tower={tower} />
      ))}
      {gameState.enemyTowers.map(tower => (
        <Tower key={tower.id} tower={tower} />
      ))}

      {/* Spawn Effects */}
      {spawnEffects.map(effect => (
        <SpawnEffectComponent key={effect.id} effect={effect} />
      ))}

      {/* Units */}
      {gameState.playerUnits.map(unit => (
        <Unit key={unit.id} unit={unit} />
      ))}
      {gameState.enemyUnits.map(unit => (
        <Unit key={unit.id} unit={unit} />
      ))}

      {/* Projectiles */}
      {projectiles.map(proj => (
        <ProjectileComponent key={proj.id} projectile={proj} />
      ))}

      {/* Damage Numbers */}
      {damageNumbers.map(dmg => (
        <DamageNumberComponent key={dmg.id} dmg={dmg} />
      ))}

      {/* Center decoration */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-4 h-4 rounded-full bg-white/20 border border-white/30" />
      </div>
    </div>
  );
}
