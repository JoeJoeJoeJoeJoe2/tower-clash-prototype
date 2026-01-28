import { GameState, Position, PlacementZone, Building as BuildingType, ActiveSpell } from '@/types/game';
import { Projectile, SpawnEffect, DamageNumber, CrownAnimation } from '@/hooks/useGameState';
import { Tower } from './Tower';
import { Unit } from './Unit';
import { ProjectileComponent, SpawnEffectComponent } from './Projectile';
import { cn } from '@/lib/utils';
import { getCardById } from '@/data/cards';

interface ArenaProps {
  gameState: GameState;
  projectiles: Projectile[];
  spawnEffects: SpawnEffect[];
  damageNumbers: DamageNumber[];
  crownAnimations: CrownAnimation[];
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

function BuildingComponent({ building }: { building: BuildingType }) {
  const card = getCardById(building.cardId);
  const healthPercent = (building.health / building.maxHealth) * 100;
  const lifetimePercent = (building.lifetime / building.maxLifetime) * 100;
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: building.position.x,
        top: building.position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Building body */}
      <div 
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center text-lg border-2 shadow-lg",
          building.owner === 'player' 
            ? "bg-gradient-to-b from-blue-600 to-blue-800 border-blue-400" 
            : "bg-gradient-to-b from-red-600 to-red-800 border-red-400"
        )}
      >
        {card?.emoji || '🏰'}
      </div>
      
      {/* Health bar */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all",
            building.owner === 'player' ? "bg-blue-400" : "bg-red-400"
          )}
          style={{ width: `${healthPercent}%` }}
        />
      </div>
      
      {/* Lifetime indicator (circular) */}
      <div 
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white/50"
        style={{
          background: `conic-gradient(${building.owner === 'player' ? '#60a5fa' : '#f87171'} ${lifetimePercent}%, transparent ${lifetimePercent}%)`
        }}
      />
    </div>
  );
}

function SpellEffectComponent({ spell }: { spell: ActiveSpell }) {
  const card = getCardById(spell.cardId);
  const isFreeze = card?.id === 'freeze';
  const isPoison = card?.id === 'poison';
  const isRage = card?.id === 'rage';
  
  // Instant spells fade out quickly
  const opacity = spell.remainingDuration > 0 
    ? Math.min(1, spell.remainingDuration / 2) 
    : 1 - (spell.hasAppliedInstant ? 0.8 : 0);
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: spell.position.x,
        top: spell.position.y,
        transform: 'translate(-50%, -50%)',
        opacity
      }}
    >
      {/* Spell radius indicator */}
      <div 
        className={cn(
          "rounded-full border-2 animate-pulse",
          isFreeze ? "bg-cyan-400/30 border-cyan-300" :
          isPoison ? "bg-green-500/30 border-green-400" :
          isRage ? "bg-red-500/30 border-red-400" :
          spell.owner === 'player' ? "bg-blue-500/30 border-blue-400" : "bg-red-500/30 border-red-400"
        )}
        style={{
          width: spell.radius * 2,
          height: spell.radius * 2,
        }}
      />
      
      {/* Spell emoji in center */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
        {card?.emoji || '✨'}
      </div>
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

// Crown animation that flies from destroyed tower to score display
function CrownAnimationComponent({ crown, arenaHeight }: { crown: CrownAnimation; arenaHeight: number }) {
  // Calculate animation path - crown flies up and curves to the side
  const startX = crown.fromPosition.x;
  const startY = crown.fromPosition.y;
  
  // End position: top of arena, left side for player score, right for enemy
  const endX = crown.toSide === 'player' ? 60 : 260;
  const endY = -40; // Above the arena (into the HUD)
  
  // Bezier curve control point for arc motion
  const controlY = startY - 100;
  
  // Quadratic bezier interpolation
  const t = crown.progress;
  const oneMinusT = 1 - t;
  
  const x = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * startX + t * t * endX;
  const y = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * controlY + t * t * endY;
  
  // Scale and opacity animation
  const scale = 1 + Math.sin(t * Math.PI) * 0.5; // Bulge in the middle
  const opacity = t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2; // Fade out at the end
  
  return (
    <div
      className="absolute pointer-events-none z-[100]"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      <div className="relative">
        <span className="text-3xl drop-shadow-lg animate-pulse">👑</span>
        {/* Sparkle trail */}
        <div 
          className="absolute inset-0 animate-ping"
          style={{ animationDuration: '0.3s' }}
        >
          <span className="text-3xl opacity-50">✨</span>
        </div>
      </div>
    </div>
  );
}

export function Arena({ 
  gameState, 
  projectiles, 
  spawnEffects,
  damageNumbers,
  crownAnimations,
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

      {/* Buildings */}
      {gameState.playerBuildings.map(building => (
        <BuildingComponent key={building.id} building={building} />
      ))}
      {gameState.enemyBuildings.map(building => (
        <BuildingComponent key={building.id} building={building} />
      ))}

      {/* Active Spells (visual effects) */}
      {gameState.activeSpells.map(spell => (
        <SpellEffectComponent key={spell.id} spell={spell} />
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

      {/* Crown Animations */}
      {crownAnimations.map(crown => (
        <CrownAnimationComponent key={crown.id} crown={crown} arenaHeight={arenaHeight} />
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
