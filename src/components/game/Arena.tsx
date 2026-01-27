import { GameState, Position, PlacementZone } from '@/types/game';
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

function PlacementZoneOverlay({ zone, isBonus }: { zone: PlacementZone; isBonus: boolean }) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none transition-all duration-300",
        isBonus 
          ? "bg-emerald-500/20 border-2 border-emerald-400/50 border-dashed" 
          : "bg-blue-500/15"
      )}
      style={{
        left: zone.minX,
        top: zone.minY,
        width: zone.maxX - zone.minX,
        height: zone.maxY - zone.minY,
      }}
    >
      {isBonus && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-emerald-400/70 text-xs font-bold bg-emerald-900/50 px-2 py-1 rounded">
            NEW ZONE
          </span>
        </div>
      )}
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
      className={cn(
        "arena-field relative rounded-xl overflow-hidden border-4 shadow-xl transition-all duration-500",
        gameState.isSuddenDeath 
          ? "border-orange-500/80 shadow-orange-500/30" 
          : "border-muted"
      )}
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
      
      {/* Sudden death overlay effect */}
      {gameState.isSuddenDeath && (
        <div 
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            background: 'radial-gradient(circle at center, transparent 40%, rgba(249,115,22,0.15) 100%)',
          }}
        />
      )}
      
      {/* Enemy side shading */}
      <div 
        className="absolute inset-x-0 top-0"
        style={{ 
          height: arenaHeight / 2,
          background: gameState.isSuddenDeath
            ? 'linear-gradient(to bottom, rgba(249,115,22,0.15), transparent)'
            : 'linear-gradient(to bottom, rgba(239,68,68,0.1), transparent)'
        }}
      />
      
      {/* Player side shading */}
      <div 
        className="absolute inset-x-0 bottom-0"
        style={{ 
          height: arenaHeight / 2,
          background: gameState.isSuddenDeath
            ? 'linear-gradient(to top, rgba(249,115,22,0.15), transparent)'
            : 'linear-gradient(to top, rgba(59,130,246,0.1), transparent)'
        }}
      />
      
      {/* River line */}
      <div 
        className={cn(
          "absolute left-0 right-0 h-4 transition-colors duration-500",
        )}
        style={{ 
          top: arenaHeight / 2 - 8,
          background: gameState.isSuddenDeath
            ? 'linear-gradient(to bottom, transparent, #f9731680, #fb923c80, #f9731680, transparent)'
            : 'linear-gradient(to bottom, transparent, #3b82f660, #60a5fa80, #3b82f660, transparent)'
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

      {/* Placement zones when card selected */}
      {gameState.selectedCardIndex !== null && (
        <>
          {gameState.playerPlacementZones.map(zone => (
            <PlacementZoneOverlay 
              key={zone.id} 
              zone={zone} 
              isBonus={zone.reason === 'tower-destroyed'}
            />
          ))}
        </>
      )}

      {/* Destroyed tower markers */}
      {gameState.enemyTowers.filter(t => t.health <= 0).map(tower => (
        <div
          key={`destroyed-${tower.id}`}
          className="absolute pointer-events-none"
          style={{
            left: tower.position.x,
            top: tower.position.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-12 h-12 rounded-full bg-gray-800/50 border-2 border-gray-600/50 flex items-center justify-center">
            <span className="text-2xl opacity-50">💥</span>
          </div>
        </div>
      ))}
      
      {gameState.playerTowers.filter(t => t.health <= 0).map(tower => (
        <div
          key={`destroyed-${tower.id}`}
          className="absolute pointer-events-none"
          style={{
            left: tower.position.x,
            top: tower.position.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-12 h-12 rounded-full bg-gray-800/50 border-2 border-gray-600/50 flex items-center justify-center">
            <span className="text-2xl opacity-50">💥</span>
          </div>
        </div>
      ))}

      {/* Towers (only alive ones) */}
      {gameState.playerTowers.filter(t => t.health > 0).map(tower => (
        <Tower key={tower.id} tower={tower} />
      ))}
      {gameState.enemyTowers.filter(t => t.health > 0).map(tower => (
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
        <div className={cn(
          "w-4 h-4 rounded-full border transition-colors duration-500",
          gameState.isSuddenDeath 
            ? "bg-orange-500/30 border-orange-400/50" 
            : "bg-white/20 border-white/30"
        )} />
      </div>
    </div>
  );
}
