import { GameState, Position } from '@/types/game';
import { Projectile, SpawnEffect } from '@/hooks/useGameState';
import { Tower } from './Tower';
import { Unit } from './Unit';
import { ProjectileComponent, SpawnEffectComponent } from './Projectile';
import { cn } from '@/lib/utils';

interface ArenaProps {
  gameState: GameState;
  projectiles: Projectile[];
  spawnEffects: SpawnEffect[];
  arenaWidth: number;
  arenaHeight: number;
  onArenaClick: (position: Position) => void;
}

export function Arena({ 
  gameState, 
  projectiles, 
  spawnEffects, 
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
      className="arena-field relative rounded-xl overflow-hidden border-4 border-muted shadow-lg"
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
      
      {/* River line */}
      <div 
        className="absolute left-0 right-0 h-3"
        style={{ 
          top: arenaHeight / 2 - 6,
          background: 'linear-gradient(to bottom, transparent, #3b82f680, #60a5fa80, #3b82f680, transparent)'
        }}
      />
      
      {/* Bridge left */}
      <div 
        className="absolute w-16 h-5 rounded"
        style={{ 
          left: 40, 
          top: arenaHeight / 2 - 10,
          background: 'linear-gradient(to bottom, #92400e, #78350f)'
        }}
      />
      
      {/* Bridge right */}
      <div 
        className="absolute w-16 h-5 rounded"
        style={{ 
          right: 40, 
          top: arenaHeight / 2 - 10,
          background: 'linear-gradient(to bottom, #92400e, #78350f)'
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

      {/* Center line decoration */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-3 h-3 rounded-full bg-white/30" />
      </div>
    </div>
  );
}
