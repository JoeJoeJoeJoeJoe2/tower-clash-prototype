import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Tower, Unit, CardDefinition, Position, PlacementZone } from '@/types/game';
import { createDeck, drawHand } from '@/data/cards';
import { makeAIDecision } from './useAI';

export const ARENA_WIDTH = 400;
export const ARENA_HEIGHT = 600;
const BASE_ELIXIR_REGEN_RATE = 0.35;
const SUDDEN_DEATH_ELIXIR_MULTIPLIER = 2;
const GAME_DURATION = 180;
const SUDDEN_DEATH_TIME = 60;

export interface Projectile {
  id: string;
  from: Position;
  to: Position;
  progress: number;
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

export interface DamageNumber {
  id: string;
  position: Position;
  damage: number;
  progress: number;
  isCritical: boolean;
}

function createInitialTowers(): { playerTowers: Tower[], enemyTowers: Tower[] } {
  const playerTowers: Tower[] = [
    {
      id: 'player-king',
      type: 'king',
      owner: 'player',
      position: { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT - 50 },
      health: 450,
      maxHealth: 450,
      attackDamage: 18,
      attackRange: 100,
      attackCooldown: 1200,
      lastAttackTime: 0
    },
    {
      id: 'player-princess-left',
      type: 'princess',
      owner: 'player',
      position: { x: 80, y: ARENA_HEIGHT - 120 },
      health: 220,
      maxHealth: 220,
      attackDamage: 12,
      attackRange: 180, // Extended range to hit units crossing the bridge
      attackCooldown: 1000,
      lastAttackTime: 0
    },
    {
      id: 'player-princess-right',
      type: 'princess',
      owner: 'player',
      position: { x: ARENA_WIDTH - 80, y: ARENA_HEIGHT - 120 },
      health: 220,
      maxHealth: 220,
      attackDamage: 12,
      attackRange: 180, // Extended range to hit units crossing the bridge
      attackCooldown: 1000,
      lastAttackTime: 0
    }
  ];

  const enemyTowers: Tower[] = [
    {
      id: 'enemy-king',
      type: 'king',
      owner: 'enemy',
      position: { x: ARENA_WIDTH / 2, y: 50 },
      health: 450,
      maxHealth: 450,
      attackDamage: 18,
      attackRange: 100,
      attackCooldown: 1200,
      lastAttackTime: 0
    },
    {
      id: 'enemy-princess-left',
      type: 'princess',
      owner: 'enemy',
      position: { x: 80, y: 120 },
      health: 220,
      maxHealth: 220,
      attackDamage: 12,
      attackRange: 180, // Extended range to hit units crossing the bridge
      attackCooldown: 1000,
      lastAttackTime: 0
    },
    {
      id: 'enemy-princess-right',
      type: 'princess',
      owner: 'enemy',
      position: { x: ARENA_WIDTH - 80, y: 120 },
      health: 220,
      maxHealth: 220,
      attackDamage: 12,
      attackRange: 180, // Extended range to hit units crossing the bridge
      attackCooldown: 1000,
      lastAttackTime: 0
    }
  ];

  return { playerTowers, enemyTowers };
}

function createInitialPlacementZones(): { playerZones: PlacementZone[], enemyZones: PlacementZone[] } {
  // Player's default zone is their half of the arena
  const playerZones: PlacementZone[] = [
    {
      id: 'player-default',
      minX: 0,
      maxX: ARENA_WIDTH,
      minY: ARENA_HEIGHT / 2,
      maxY: ARENA_HEIGHT,
      isActive: true,
      reason: 'default'
    }
  ];

  // Enemy's default zone is their half
  const enemyZones: PlacementZone[] = [
    {
      id: 'enemy-default',
      minX: 0,
      maxX: ARENA_WIDTH,
      minY: 0,
      maxY: ARENA_HEIGHT / 2,
      isActive: true,
      reason: 'default'
    }
  ];

  return { playerZones, enemyZones };
}

function getDistance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function isPositionInZones(position: Position, zones: PlacementZone[]): boolean {
  return zones.some(zone => 
    zone.isActive &&
    position.x >= zone.minX &&
    position.x <= zone.maxX &&
    position.y >= zone.minY &&
    position.y <= zone.maxY
  );
}

// River and bridge constants
const RIVER_Y = ARENA_HEIGHT / 2;
const RIVER_HALF_WIDTH = 8; // River extends 8 pixels above and below center
const LEFT_BRIDGE = { minX: 40, maxX: 104 };
const RIGHT_BRIDGE = { minX: ARENA_WIDTH - 104, maxX: ARENA_WIDTH - 40 };

function isOnBridge(x: number): boolean {
  return (x >= LEFT_BRIDGE.minX && x <= LEFT_BRIDGE.maxX) ||
         (x >= RIGHT_BRIDGE.minX && x <= RIGHT_BRIDGE.maxX);
}

function isInRiver(y: number): boolean {
  return y >= RIVER_Y - RIVER_HALF_WIDTH && y <= RIVER_Y + RIVER_HALF_WIDTH;
}

function wouldCrossRiver(fromY: number, toY: number): boolean {
  // Check if movement would cross the river center line
  return (fromY < RIVER_Y && toY >= RIVER_Y) || (fromY > RIVER_Y && toY <= RIVER_Y);
}

function getClosestBridgeX(x: number): number {
  const leftBridgeCenter = (LEFT_BRIDGE.minX + LEFT_BRIDGE.maxX) / 2;
  const rightBridgeCenter = (RIGHT_BRIDGE.minX + RIGHT_BRIDGE.maxX) / 2;
  
  const distToLeft = Math.abs(x - leftBridgeCenter);
  const distToRight = Math.abs(x - rightBridgeCenter);
  
  return distToLeft < distToRight ? leftBridgeCenter : rightBridgeCenter;
}

function calculateMovement(
  unit: Unit,
  target: Position,
  delta: number
): { newX: number; newY: number; direction: 'up' | 'down' } {
  const currentX = unit.position.x;
  const currentY = unit.position.y;
  const speed = unit.moveSpeed * delta * 50;
  
  // Check if we're on opposite sides of the river from target
  const unitOnPlayerSide = currentY > RIVER_Y;
  const targetOnPlayerSide = target.y > RIVER_Y;
  const needsToCrossRiver = unitOnPlayerSide !== targetOnPlayerSide;
  
  // If we're on a bridge or don't need to cross, move directly
  if (!needsToCrossRiver || isOnBridge(currentX)) {
    const dx = target.x - currentX;
    const dy = target.y - currentY;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    if (len < 0.1) return { newX: currentX, newY: currentY, direction: unit.direction };
    
    let newX = currentX + (dx / len) * speed;
    let newY = currentY + (dy / len) * speed;
    
    // If on bridge, allow crossing
    if (isOnBridge(currentX)) {
      return { newX, newY, direction: dy < 0 ? 'up' : 'down' };
    }
    
    // If would cross river but not on bridge, stop at river edge
    if (wouldCrossRiver(currentY, newY) && !isOnBridge(newX)) {
      newY = unitOnPlayerSide ? RIVER_Y + RIVER_HALF_WIDTH + 1 : RIVER_Y - RIVER_HALF_WIDTH - 1;
    }
    
    return { newX, newY, direction: dy < 0 ? 'up' : 'down' };
  }
  
  // Need to cross river but not on bridge - navigate to nearest bridge first
  const bridgeX = getClosestBridgeX(currentX);
  const bridgeY = unitOnPlayerSide ? RIVER_Y + RIVER_HALF_WIDTH : RIVER_Y - RIVER_HALF_WIDTH;
  
  // Move towards bridge
  const dx = bridgeX - currentX;
  const dy = bridgeY - currentY;
  const len = Math.sqrt(dx * dx + dy * dy);
  
  if (len < 0.1) {
    // At bridge entrance, move towards river
    return { 
      newX: currentX, 
      newY: currentY + (unitOnPlayerSide ? -speed : speed),
      direction: unitOnPlayerSide ? 'up' : 'down'
    };
  }
  
  const newX = currentX + (dx / len) * speed;
  const newY = currentY + (dy / len) * speed;
  
  return { newX, newY, direction: dy < 0 ? 'up' : 'down' };
}

function createInitialState(playerDeckIds: string[]): GameState {
  const { playerTowers, enemyTowers } = createInitialTowers();
  const { playerZones, enemyZones } = createInitialPlacementZones();
  const playerDeck = createDeck(playerDeckIds);
  const enemyDeckIds = ['knight', 'archers', 'giant', 'wizard', 'valkyrie', 'musketeer', 'goblins', 'bomber'];
  const enemyDeck = createDeck(enemyDeckIds);
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
    selectedCardIndex: null,
    isSuddenDeath: false,
    playerPlacementZones: playerZones,
    enemyPlacementZones: enemyZones,
    playerCardCooldowns: [0, 0, 0, 0], // No cooldown at start
    enemyCardCooldowns: [0, 0, 0, 0]
  };
}

export function useGameState(playerDeckIds: string[]) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(playerDeckIds));
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [spawnEffects, setSpawnEffects] = useState<SpawnEffect[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  
  const lastTickRef = useRef<number>(performance.now());
  const unitIdCounter = useRef(0);
  const projectileIdCounter = useRef(0);
  const spawnIdCounter = useRef(0);
  const damageIdCounter = useRef(0);
  const aiLastPlayTime = useRef(0);

  const addDamageNumber = useCallback((position: Position, damage: number, isCritical = false) => {
    const num: DamageNumber = {
      id: `dmg-${damageIdCounter.current++}`,
      position: { x: position.x + (Math.random() - 0.5) * 20, y: position.y },
      damage,
      progress: 0,
      isCritical
    };
    setDamageNumbers(prev => [...prev, num]);
  }, []);

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
      direction: owner === 'player' ? 'up' : 'down',
      deployCooldown: card.deployCooldown // Unit has cooldown before it can act
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
      
      // Check if card is on cooldown
      if (prev.playerCardCooldowns[cardIndex] > 0) return prev;
      
      // Check if position is in valid placement zones
      if (!isPositionInZones(position, prev.playerPlacementZones)) return prev;

      // Check we have a next card available
      const nextCard = prev.playerDeck[0];
      if (!nextCard) return prev;

      const newUnit = spawnUnit(card, position, 'player');
      addSpawnEffect(position, 'player', card.emoji);
      
      const newHand = [...prev.playerHand];
      newHand[cardIndex] = nextCard;
      // Played card goes to end of deck queue (FIFO cycling)
      const newDeck = [...prev.playerDeck.slice(1), card];

      // Set cooldown for the new card entering this slot
      const newCooldowns = [...prev.playerCardCooldowns];
      newCooldowns[cardIndex] = nextCard.deployCooldown;

      return {
        ...prev,
        playerElixir: prev.playerElixir - card.elixirCost,
        playerUnits: [...prev.playerUnits, newUnit],
        playerHand: newHand,
        playerDeck: newDeck,
        selectedCardIndex: null,
        playerCardCooldowns: newCooldowns
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
      const delta = Math.min(deltaMs, 100) / 1000;
      lastTickRef.current = currentTime;

      // Update projectiles
      setProjectiles(prev => 
        prev.map(p => ({
          ...p,
          progress: p.progress + delta * 3.5
        })).filter(p => p.progress < 1)
      );

      // Update spawn effects
      setSpawnEffects(prev => 
        prev.map(e => ({
          ...e,
          progress: e.progress + delta * 1.5
        })).filter(e => e.progress < 1)
      );

      // Update damage numbers
      setDamageNumbers(prev =>
        prev.map(d => ({
          ...d,
          progress: d.progress + delta * 2
        })).filter(d => d.progress < 1)
      );

      setGameState(prev => {
        if (prev.gameStatus !== 'playing') return prev;

        const state: GameState = {
          ...prev,
          playerTowers: prev.playerTowers.map(t => ({ ...t })),
          enemyTowers: prev.enemyTowers.map(t => ({ ...t })),
          playerUnits: prev.playerUnits.map(u => ({ ...u })),
          enemyUnits: prev.enemyUnits.map(u => ({ ...u })),
          playerPlacementZones: [...prev.playerPlacementZones],
          enemyPlacementZones: [...prev.enemyPlacementZones],
          playerCardCooldowns: prev.playerCardCooldowns.map(cd => Math.max(0, cd - delta)),
          enemyCardCooldowns: prev.enemyCardCooldowns.map(cd => Math.max(0, cd - delta))
        };

        // Check for sudden death
        const wasSuddenDeath = prev.isSuddenDeath;
        state.isSuddenDeath = state.timeRemaining <= SUDDEN_DEATH_TIME;
        
        // Calculate elixir regen rate
        const elixirRate = state.isSuddenDeath 
          ? BASE_ELIXIR_REGEN_RATE * SUDDEN_DEATH_ELIXIR_MULTIPLIER 
          : BASE_ELIXIR_REGEN_RATE;

        // Elixir regeneration
        state.playerElixir = Math.min(10, state.playerElixir + elixirRate * delta);
        state.enemyElixir = Math.min(10, state.enemyElixir + elixirRate * delta);
        state.timeRemaining = Math.max(0, state.timeRemaining - delta);

        // Update placement zones based on destroyed towers
        const updatePlacementZonesForPlayer = () => {
          const zones: PlacementZone[] = [
            {
              id: 'player-default',
              minX: 0,
              maxX: ARENA_WIDTH,
              minY: ARENA_HEIGHT / 2,
              maxY: ARENA_HEIGHT,
              isActive: true,
              reason: 'default'
            }
          ];
          
          // Check enemy princess towers
          const enemyLeftPrincess = state.enemyTowers.find(t => t.id === 'enemy-princess-left');
          const enemyRightPrincess = state.enemyTowers.find(t => t.id === 'enemy-princess-right');
          
          if (enemyLeftPrincess && enemyLeftPrincess.health <= 0) {
            zones.push({
              id: 'enemy-left-destroyed',
              minX: 0,
              maxX: ARENA_WIDTH / 2 - 20,
              minY: ARENA_HEIGHT / 2 - 100,
              maxY: ARENA_HEIGHT / 2,
              isActive: true,
              reason: 'tower-destroyed'
            });
          }
          
          if (enemyRightPrincess && enemyRightPrincess.health <= 0) {
            zones.push({
              id: 'enemy-right-destroyed',
              minX: ARENA_WIDTH / 2 + 20,
              maxX: ARENA_WIDTH,
              minY: ARENA_HEIGHT / 2 - 100,
              maxY: ARENA_HEIGHT / 2,
              isActive: true,
              reason: 'tower-destroyed'
            });
          }
          
          return zones;
        };

        const updatePlacementZonesForEnemy = () => {
          const zones: PlacementZone[] = [
            {
              id: 'enemy-default',
              minX: 0,
              maxX: ARENA_WIDTH,
              minY: 0,
              maxY: ARENA_HEIGHT / 2,
              isActive: true,
              reason: 'default'
            }
          ];
          
          const playerLeftPrincess = state.playerTowers.find(t => t.id === 'player-princess-left');
          const playerRightPrincess = state.playerTowers.find(t => t.id === 'player-princess-right');
          
          if (playerLeftPrincess && playerLeftPrincess.health <= 0) {
            zones.push({
              id: 'player-left-destroyed',
              minX: 0,
              maxX: ARENA_WIDTH / 2 - 20,
              minY: ARENA_HEIGHT / 2,
              maxY: ARENA_HEIGHT / 2 + 100,
              isActive: true,
              reason: 'tower-destroyed'
            });
          }
          
          if (playerRightPrincess && playerRightPrincess.health <= 0) {
            zones.push({
              id: 'player-right-destroyed',
              minX: ARENA_WIDTH / 2 + 20,
              maxX: ARENA_WIDTH,
              minY: ARENA_HEIGHT / 2,
              maxY: ARENA_HEIGHT / 2 + 100,
              isActive: true,
              reason: 'tower-destroyed'
            });
          }
          
          return zones;
        };

        state.playerPlacementZones = updatePlacementZonesForPlayer();
        state.enemyPlacementZones = updatePlacementZonesForEnemy();

        // AI decision making with adjusted timing for sudden death
        const aiDecision = makeAIDecision(state, aiLastPlayTime.current);
        if (aiDecision.shouldPlay && aiDecision.card && aiDecision.position !== undefined && aiDecision.cardIndex !== undefined) {
          // Check AI cooldown
          if (state.enemyCardCooldowns[aiDecision.cardIndex] <= 0) {
            // Validate AI placement against their zones
            if (isPositionInZones(aiDecision.position, state.enemyPlacementZones)) {
              const newUnit = spawnUnit(aiDecision.card, aiDecision.position, 'enemy');
              addSpawnEffect(aiDecision.position, 'enemy', aiDecision.card.emoji);
              state.enemyUnits = [...state.enemyUnits, newUnit];
              state.enemyElixir -= aiDecision.card.elixirCost;
              aiLastPlayTime.current = performance.now();

              const newHand = [...state.enemyHand];
              const nextCard = state.enemyDeck[0];
              if (nextCard) {
                newHand[aiDecision.cardIndex] = nextCard;
                state.enemyHand = newHand;
                state.enemyDeck = [...state.enemyDeck.slice(1), aiDecision.card];
                state.enemyCardCooldowns[aiDecision.cardIndex] = nextCard.deployCooldown;
              }
            }
          }
        }

        const now = performance.now();
        const newProjectiles: Projectile[] = [];

        // Update player units
        state.playerUnits = state.playerUnits.map(unit => {
          if (unit.health <= 0) return unit;

          // Decrement deploy cooldown
          if (unit.deployCooldown > 0) {
            unit.deployCooldown = Math.max(0, unit.deployCooldown - delta);
            unit.animationFrame = (unit.animationFrame + 1) % 60;
            return unit; // Don't move or attack while deploying
          }

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
                const damage = unit.damage;
                closestEnemy.health -= damage;
                addDamageNumber(closestEnemy.position, damage, damage > 25);
              }
            } else {
              unit.state = 'moving';
              const movement = calculateMovement(unit, closestEnemy.position, delta);
              unit.position = { x: movement.newX, y: movement.newY };
              unit.direction = movement.direction;
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

          // Decrement deploy cooldown
          if (unit.deployCooldown > 0) {
            unit.deployCooldown = Math.max(0, unit.deployCooldown - delta);
            unit.animationFrame = (unit.animationFrame + 1) % 60;
            return unit; // Don't move or attack while deploying
          }

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
                const damage = unit.damage;
                closestEnemy.health -= damage;
                addDamageNumber(closestEnemy.position, damage, damage > 25);
              }
            } else {
              unit.state = 'moving';
              const movement = calculateMovement(unit, closestEnemy.position, delta);
              unit.position = { x: movement.newX, y: movement.newY };
              unit.direction = movement.direction;
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

        if (newProjectiles.length > 0) {
          setProjectiles(prev => [...prev, ...newProjectiles]);
        }

        // Apply projectile damage
        setProjectiles(currentProjectiles => {
          currentProjectiles.forEach(proj => {
            if (proj.progress >= 0.85 && proj.progress < 0.95) {
              const allUnits = [...state.playerUnits, ...state.enemyUnits];
              const target = allUnits.find(u => u.id === proj.targetId);
              if (target && target.health > 0) {
                target.health -= proj.damage;
                addDamageNumber(target.position, proj.damage);
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
  }, [spawnUnit, addSpawnEffect, addDamageNumber]);

  const resetGame = useCallback(() => {
    setGameState(createInitialState(playerDeckIds));
    setProjectiles([]);
    setSpawnEffects([]);
    setDamageNumbers([]);
    aiLastPlayTime.current = 0;
  }, [playerDeckIds]);

  return {
    gameState,
    projectiles,
    spawnEffects,
    damageNumbers,
    playCard,
    selectCard,
    resetGame,
    ARENA_WIDTH,
    ARENA_HEIGHT
  };
}
