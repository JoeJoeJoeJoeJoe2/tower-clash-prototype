import { GameState, Position } from '@/types/game';
import { Tower } from './Tower';
import { Unit } from './Unit';
import { cn } from '@/lib/utils';

interface ArenaProps {
  gameState: GameState;
  arenaWidth: number;
  arenaHeight: number;
  onArenaClick: (position: Position) => void;
}

export function Arena({ gameState, arenaWidth, arenaHeight, onArenaClick }: ArenaProps) {
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
      {/* River line */}
      <div 
        className="absolute left-0 right-0 h-2 bg-blue-400/60"
        style={{ top: arenaHeight / 2 - 4 }}
      />
      
      {/* Bridge left */}
      <div 
        className="absolute w-16 h-4 bg-amber-700 rounded"
        style={{ 
          left: 40, 
          top: arenaHeight / 2 - 8 
        }}
      />
      
      {/* Bridge right */}
      <div 
        className="absolute w-16 h-4 bg-amber-700 rounded"
        style={{ 
          right: 40, 
          top: arenaHeight / 2 - 8 
        }}
      />

      {/* Placement zone indicator */}
      {gameState.selectedCardIndex !== null && (
        <div 
          className={cn('placement-zone', gameState.selectedCardIndex !== null && 'active')}
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

      {/* Units */}
      {gameState.playerUnits.map(unit => (
        <Unit key={unit.id} unit={unit} />
      ))}
      {gameState.enemyUnits.map(unit => (
        <Unit key={unit.id} unit={unit} />
      ))}

      {/* Center line decoration */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-3 h-3 rounded-full bg-white/30" />
      </div>
    </div>
  );
}
