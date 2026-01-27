import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Tower, Unit, CardDefinition, Position } from '@/types/game';
import { createDeck, drawHand, allCards } from '@/data/cards';

const ARENA_WIDTH = 400;
const ARENA_HEIGHT = 600;
const ELIXIR_REGEN_RATE = 0.5; // Per second
const GAME_DURATION = 180;
const TICK_RATE = 16; // ~60fps

export interface Projectile {
  id: string;
  from: Position;
  to: Position;
  progress: number; // 0-1
  damage: number;
  targetId: string;
  type: 'arrow' | 'fireball';
  owner: 'player' | 'enemy';
}

export interface SpawnEffect {
  id: string;
  position: Position;
  owner: 'player' | 'enemy';
  emoji: string;
  progress: number;
}

function createInitialTowers(): { playerTowers: Tower[], enemyTowers: Tower[] } {
  const playerTowers: Tower[] = [
    {
      id: 'player-king',
      type: 'king',
      owner: 'player',
      position: { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT - 50 },
      health: 400,
      maxHealth: 400,
      attackDamage: 15,
      attackRange: 100,
      attackCooldown: 1500,
      lastAttackTime: 0
    },
    {
      id: 'player-princess-left',
      type: 'princess',
      owner: 'player',
      position: { x: 80, y: ARENA_HEIGHT - 120 },
      health: 200,
      maxHealth: 200,
      attackDamage: 10,
      attackRange: 130,
      attackCooldown: 1200,
      lastAttackTime: 0
    },
    {
      id: 'player-princess-right',
      type: 'princess',
      owner: 'player',
      position: { x: ARENA_WIDTH - 80, y: ARENA_HEIGHT - 120 },
      health: 200,
      maxHealth: 200,
      attackDamage: 10,
      attackRange: 130,
      attackCooldown: 1200,
      lastAttackTime: 0
    }
  ];

  const enemyTowers: Tower[] = [
    {
      id: 'enemy-king',
      type: 'king',
      owner: 'enemy',
      position: { x: ARENA_WIDTH / 2, y: 50 },
      health: 400,
      maxHealth: 400,
      attackDamage: 15,
      attackRange: 100,
      attackCooldown: 1500,
      lastAttackTime: 0
    },
    {
      id: 'enemy-princess-left',
      type: 'princess',
      owner: 'enemy',
      position: { x: 80, y: 120 },
      health: 200,
      maxHealth: 200,
      attackDamage: 10,
      attackRange: 130,
      attackCooldown: 1200,
      lastAttackTime: 0
    },
    {
      id: 'enemy-princess-right',
      type: 'princess',
      owner: 'enemy',
      position: { x: ARENA_WIDTH - 80, y: 120 },
      health: 200,
      maxHealth: 200,
      attackDamage: 10,
      attackRange: 130,
      attackCooldown: 1200,
      lastAttackTime: 0
    }
  ];

  return { playerTowers, enemyTowers };
}

function getDistance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function createInitialState(playerDeckIds: string[]): GameState {
  const { playerTowers, enemyTowers } = createInitialTowers();
  const playerDeck = createDeck(playerDeckIds);
  const enemyDeck = createDeck(allCards.slice(0, 8).map(c => c.id));
  const { hand: playerHand, remainingDeck: playerRemainingDeck } = drawHand(playerDeck);
  const { hand: enemyHand, remainingDeck: enemyRemainingDeck } = drawHand(enemyDeck);

  return {
    playerElixir: 5,
    enemyElixir: 5,
    playerTowers,
    enemyTowers,
    playerUnits: [],
    enemyUnits: [],
    playerDeck: playerRemainingDeck,
    playerHand,
    enemyDeck: enemyRemainingDeck,
    enemyHand,
    timeRemaining: GAME_DURATION,
    gameStatus: 'playing',
    selectedCardIndex: null
  };
}

export function useGameState(playerDeckIds: string[]) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(playerDeckIds));
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [spawnEffects, setSpawnEffects] = useState<SpawnEffect[]>([]);
  
  const gameLoopRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(performance.now());
  const unitIdCounter = useRef(0);
  const projectileIdCounter = useRef(0);
  const spawnIdCounter = useRef(0);

  const spawnUnit = useCallback((card: CardDefinition, position: Position, owner: 'player' | 'enemy'): Unit => {
    return {
      id: `unit-${unitIdCounter.current++}`,
      cardId: card.id,
      owner,
      position: { ...position },
      health: card.health,
      maxHealth: card.health,
      damage: card.damage,
      attackSpeed: card.attackSpeed,
      moveSpeed: card.moveSpeed,
      range: card.range,
      lastAttackTime: 0,
      targetId: null,
      state: 'idle',
      animationFrame: 0,
      direction: owner === 'player' ? 'up' : 'down'
    };
  }, []);

  const addSpawnEffect = useCallback((position: Position, owner: 'player' | 'enemy', emoji: string) => {
    const effect: SpawnEffect = {
      id: `spawn-${spawnIdCounter.current++}`,
      position,
      owner,
      emoji,
      progress: 0
    };
    setSpawnEffects(prev => [...prev, effect]);
  }, []);

  const playCard = useCallback((cardIndex: number, position: Position) => {
    setGameState(prev => {
      const card = prev.playerHand[cardIndex];
      if (!card || prev.playerElixir < card.elixirCost) return prev;
      if (position.y < ARENA_HEIGHT / 2) return prev;

      const newUnit = spawnUnit(card, position, 'player');
      addSpawnEffect(position, 'player', card.emoji);
      
      const newHand = [...prev.playerHand];
      const nextCard = prev.playerDeck[0];
      newHand[cardIndex] = nextCard;
      const newDeck = [...prev.playerDeck.slice(1), card];

      return {
        ...prev,
        playerElixir: prev.playerElixir - card.elixirCost,
        playerUnits: [...prev.playerUnits, newUnit],
        playerHand: newHand,
        playerDeck: newDeck,
        selectedCardIndex: null
      };
    });
  }, [spawnUnit, addSpawnEffect]);

  const selectCard = useCallback((index: number | null) => {
    setGameState(prev => ({
      ...prev,
      selectedCardIndex: index
    }));
  }, []);

  // Main game loop
  useEffect(() => {
    let animationId: number;
    
    const tick = (currentTime: number) => {
      const deltaMs = currentTime - lastTickRef.current;
      
      // Cap delta to prevent huge jumps
      const delta = Math.min(deltaMs, 100) / 1000;
      lastTickRef.current = currentTime;

      // Update projectiles
      setProjectiles(prev => {
        const updated = prev.map(p => ({
          ...p,
          progress: p.progress + delta * 4 // Projectile speed
        })).filter(p => p.progress < 1);
        
        return updated;
      });

      // Update spawn effects
      setSpawnEffects(prev => 
        prev.map(e => ({
          ...e,
          progress: e.progress + delta * 2
        })).filter(e => e.progress < 1)
      );

      setGameState(prev => {
        if (prev.gameStatus !== 'playing') return prev;

        // Create mutable copies
        const state: GameState = {
          ...prev,
          playerTowers: prev.playerTowers.map(t => ({ ...t })),
          enemyTowers: prev.enemyTowers.map(t => ({ ...t })),
          playerUnits: prev.playerUnits.map(u => ({ ...u })),
          enemyUnits: prev.enemyUnits.map(u => ({ ...u }))
        };

        // Elixir regeneration
        state.playerElixir = Math.min(10, state.playerElixir + ELIXIR_REGEN_RATE * delta);
        state.enemyElixir = Math.min(10, state.enemyElixir + ELIXIR_REGEN_RATE * delta);
        state.timeRemaining = Math.max(0, state.timeRemaining - delta);

        // AI plays cards less frequently
        if (state.enemyElixir >= 4 && Math.random() < 0.008) {
          const affordableCards = state.enemyHand
            .map((card, idx) => ({ card, idx }))
            .filter(({ card }) => card.elixirCost <= state.enemyElixir);
          
          if (affordableCards.length > 0) {
            const { card, idx } = affordableCards[Math.floor(Math.random() * affordableCards.length)];
            const position: Position = {
              x: 50 + Math.random() * (ARENA_WIDTH - 100),
              y: 150 + Math.random() * 100
            };

            const newUnit = spawnUnit(card, position, 'enemy');
            addSpawnEffect(position, 'enemy', card.emoji);
            state.enemyUnits = [...state.enemyUnits, newUnit];
            state.enemyElixir -= card.elixirCost;

            const newHand = [...state.enemyHand];
            newHand[idx] = state.enemyDeck[0];
            state.enemyHand = newHand;
            state.enemyDeck = [...state.enemyDeck.slice(1), card];
          }
        }

        const now = performance.now();
        const newProjectiles: Projectile[] = [];

        // Update player units
        state.playerUnits = state.playerUnits.map(unit => {
          if (unit.health <= 0) return unit;

          const enemies = [
            ...state.enemyUnits.filter(u => u.health > 0),
            ...state.enemyTowers.filter(t => t.health > 0)
          ];

          let closestEnemy: (Unit | Tower) | null = null;
          let closestDist = Infinity;

          for (const enemy of enemies) {
            const dist = getDistance(unit.position, enemy.position);
            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = enemy;
            }
          }

          if (closestEnemy) {
            if (closestDist <= unit.range) {
              unit.state = 'attacking';
              if (now - unit.lastAttackTime > 1000 / unit.attackSpeed) {
                unit.lastAttackTime = now;
                closestEnemy.health -= unit.damage;
              }
            } else {
              unit.state = 'moving';
              const dx = closestEnemy.position.x - unit.position.x;
              const dy = closestEnemy.position.y - unit.position.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              
              unit.position = {
                x: unit.position.x + (dx / len) * unit.moveSpeed * delta * 60,
                y: unit.position.y + (dy / len) * unit.moveSpeed * delta * 60
              };
              unit.direction = dy < 0 ? 'up' : 'down';
            }
            unit.animationFrame = (unit.animationFrame + 1) % 60;
          } else {
            unit.state = 'idle';
          }

          return unit;
        });

        // Update enemy units
        state.enemyUnits = state.enemyUnits.map(unit => {
          if (unit.health <= 0) return unit;

          const enemies = [
            ...state.playerUnits.filter(u => u.health > 0),
            ...state.playerTowers.filter(t => t.health > 0)
          ];

          let closestEnemy: (Unit | Tower) | null = null;
          let closestDist = Infinity;

          for (const enemy of enemies) {
            const dist = getDistance(unit.position, enemy.position);
            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = enemy;
            }
          }

          if (closestEnemy) {
            if (closestDist <= unit.range) {
              unit.state = 'attacking';
              if (now - unit.lastAttackTime > 1000 / unit.attackSpeed) {
                unit.lastAttackTime = now;
                closestEnemy.health -= unit.damage;
              }
            } else {
              unit.state = 'moving';
              const dx = closestEnemy.position.x - unit.position.x;
              const dy = closestEnemy.position.y - unit.position.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              
              unit.position = {
                x: unit.position.x + (dx / len) * unit.moveSpeed * delta * 60,
                y: unit.position.y + (dy / len) * unit.moveSpeed * delta * 60
              };
              unit.direction = dy < 0 ? 'up' : 'down';
            }
            unit.animationFrame = (unit.animationFrame + 1) % 60;
          } else {
            unit.state = 'idle';
          }

          return unit;
        });

        // Tower attacks with projectiles
        state.playerTowers.forEach(tower => {
          if (tower.health <= 0) return;
          if (now - tower.lastAttackTime > tower.attackCooldown) {
            const enemies = state.enemyUnits.filter(u => 
              u.health > 0 && getDistance(tower.position, u.position) <= tower.attackRange
            );
            if (enemies.length > 0) {
              const target = enemies[0];
              tower.lastAttackTime = now;
              newProjectiles.push({
                id: `proj-${projectileIdCounter.current++}`,
                from: { ...tower.position },
                to: { ...target.position },
                progress: 0,
                damage: tower.attackDamage,
                targetId: target.id,
                type: tower.type === 'king' ? 'fireball' : 'arrow',
                owner: 'player'
              });
            }
          }
        });

        state.enemyTowers.forEach(tower => {
          if (tower.health <= 0) return;
          if (now - tower.lastAttackTime > tower.attackCooldown) {
            const enemies = state.playerUnits.filter(u => 
              u.health > 0 && getDistance(tower.position, u.position) <= tower.attackRange
            );
            if (enemies.length > 0) {
              const target = enemies[0];
              tower.lastAttackTime = now;
              newProjectiles.push({
                id: `proj-${projectileIdCounter.current++}`,
                from: { ...tower.position },
                to: { ...target.position },
                progress: 0,
                damage: tower.attackDamage,
                targetId: target.id,
                type: tower.type === 'king' ? 'fireball' : 'arrow',
                owner: 'enemy'
              });
            }
          }
        });

        // Add new projectiles
        if (newProjectiles.length > 0) {
          setProjectiles(prev => [...prev, ...newProjectiles]);
        }

        // Apply projectile damage when they hit
        setProjectiles(currentProjectiles => {
          currentProjectiles.forEach(proj => {
            if (proj.progress >= 0.9 && proj.progress < 1) {
              // Find target and apply damage
              const allUnits = [...state.playerUnits, ...state.enemyUnits];
              const target = allUnits.find(u => u.id === proj.targetId);
              if (target && target.health > 0) {
                target.health -= proj.damage;
              }
            }
          });
          return currentProjectiles;
        });

        // Remove dead units
        state.playerUnits = state.playerUnits.filter(u => u.health > 0);
        state.enemyUnits = state.enemyUnits.filter(u => u.health > 0);

        // Check win conditions
        const playerKing = state.playerTowers.find(t => t.type === 'king');
        const enemyKing = state.enemyTowers.find(t => t.type === 'king');

        if (enemyKing && enemyKing.health <= 0) {
          state.gameStatus = 'player-wins';
        } else if (playerKing && playerKing.health <= 0) {
          state.gameStatus = 'enemy-wins';
        } else if (state.timeRemaining <= 0) {
          const playerTowersAlive = state.playerTowers.filter(t => t.health > 0).length;
          const enemyTowersAlive = state.enemyTowers.filter(t => t.health > 0).length;
          const playerTowersDestroyed = 3 - enemyTowersAlive;
          const enemyTowersDestroyed = 3 - playerTowersAlive;

          if (playerTowersDestroyed > enemyTowersDestroyed) {
            state.gameStatus = 'player-wins';
          } else if (enemyTowersDestroyed > playerTowersDestroyed) {
            state.gameStatus = 'enemy-wins';
          } else {
            state.gameStatus = 'draw';
          }
        }

        return state;
      });

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [spawnUnit, addSpawnEffect]);

  const resetGame = useCallback(() => {
    setGameState(createInitialState(playerDeckIds));
    setProjectiles([]);
    setSpawnEffects([]);
  }, [playerDeckIds]);

  return {
    gameState,
    projectiles,
    spawnEffects,
    playCard,
    selectCard,
    resetGame,
    ARENA_WIDTH,
    ARENA_HEIGHT
  };
}
