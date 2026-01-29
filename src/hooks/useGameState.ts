import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Tower, Unit, CardDefinition, Position, PlacementZone, Building, ActiveSpell } from '@/types/game';
import { createDeck, drawHand, getCardById, SIZE_SPEED_MULTIPLIERS } from '@/data/cards';
import { makeAIDecision } from './useAI';

export const ARENA_WIDTH = 340;
export const ARENA_HEIGHT = 500;
const BASE_ELIXIR_REGEN_RATE = 0.35;
const SUDDEN_DEATH_ELIXIR_MULTIPLIER = 2;
const GAME_DURATION = 180;
const SUDDEN_DEATH_TIME = 60;
const DAMAGE_MULTIPLIER = 0.4; // Global damage reduction
const TARGET_BREAK_DISTANCE = 160; // 4 tiles - distance at which units stop chasing

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

export interface CrownAnimation {
  id: string;
  fromPosition: Position;
  toSide: 'player' | 'enemy'; // Which score side it goes to
  progress: number;
  towerType: 'king' | 'princess';
}

function createInitialTowers(towerLevels: { princess: number; king: number } = { princess: 1, king: 1 }): { playerTowers: Tower[], enemyTowers: Tower[] } {
  // Calculate level multipliers (10% per level)
  const princessMultiplier = Math.pow(1.1, towerLevels.princess - 1);
  const kingMultiplier = Math.pow(1.1, towerLevels.king - 1);
  
  // Base stats
  const basePrincessHealth = 2000;
  const basePrincessDamage = 50;
  const baseKingHealth = 2400;
  const baseKingDamage = 100;
  
  // Scaled stats for player
  const playerPrincessHealth = Math.floor(basePrincessHealth * princessMultiplier);
  const playerPrincessDamage = Math.floor(basePrincessDamage * princessMultiplier);
  const playerKingHealth = Math.floor(baseKingHealth * kingMultiplier);
  const playerKingDamage = Math.floor(baseKingDamage * kingMultiplier);
  
  // Enemy gets random level 1-5 for variety
  const enemyPrincessLevel = Math.floor(Math.random() * 5) + 1;
  const enemyKingLevel = Math.floor(Math.random() * 5) + 1;
  const enemyPrincessMultiplier = Math.pow(1.1, enemyPrincessLevel - 1);
  const enemyKingMultiplier = Math.pow(1.1, enemyKingLevel - 1);
  
  const playerTowers: Tower[] = [
    {
      id: 'player-king',
      type: 'king',
      owner: 'player',
      position: { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT - 50 },
      health: playerKingHealth,
      maxHealth: playerKingHealth,
      attackDamage: playerKingDamage,
      attackRange: 80,
      attackCooldown: 2000,
      lastAttackTime: 0,
      isActivated: false,
      level: towerLevels.king
    },
    {
      id: 'player-princess-left',
      type: 'princess',
      owner: 'player',
      position: { x: 70, y: ARENA_HEIGHT - 110 },
      health: playerPrincessHealth,
      maxHealth: playerPrincessHealth,
      attackDamage: playerPrincessDamage,
      attackRange: 140,
      attackCooldown: 1800,
      lastAttackTime: 0,
      level: towerLevels.princess
    },
    {
      id: 'player-princess-right',
      type: 'princess',
      owner: 'player',
      position: { x: ARENA_WIDTH - 70, y: ARENA_HEIGHT - 110 },
      health: playerPrincessHealth,
      maxHealth: playerPrincessHealth,
      attackDamage: playerPrincessDamage,
      attackRange: 140,
      attackCooldown: 1800,
      lastAttackTime: 0,
      level: towerLevels.princess
    }
  ];

  const enemyTowers: Tower[] = [
    {
      id: 'enemy-king',
      type: 'king',
      owner: 'enemy',
      position: { x: ARENA_WIDTH / 2, y: 50 },
      health: Math.floor(baseKingHealth * enemyKingMultiplier),
      maxHealth: Math.floor(baseKingHealth * enemyKingMultiplier),
      attackDamage: Math.floor(baseKingDamage * enemyKingMultiplier),
      attackRange: 80,
      attackCooldown: 2000,
      lastAttackTime: 0,
      isActivated: false,
      level: enemyKingLevel
    },
    {
      id: 'enemy-princess-left',
      type: 'princess',
      owner: 'enemy',
      position: { x: 70, y: 110 },
      health: Math.floor(basePrincessHealth * enemyPrincessMultiplier),
      maxHealth: Math.floor(basePrincessHealth * enemyPrincessMultiplier),
      attackDamage: Math.floor(basePrincessDamage * enemyPrincessMultiplier),
      attackRange: 140,
      attackCooldown: 1800,
      lastAttackTime: 0,
      level: enemyPrincessLevel
    },
    {
      id: 'enemy-princess-right',
      type: 'princess',
      owner: 'enemy',
      position: { x: ARENA_WIDTH - 70, y: 110 },
      health: Math.floor(basePrincessHealth * enemyPrincessMultiplier),
      maxHealth: Math.floor(basePrincessHealth * enemyPrincessMultiplier),
      attackDamage: Math.floor(basePrincessDamage * enemyPrincessMultiplier),
      attackRange: 140,
      attackCooldown: 1800,
      lastAttackTime: 0,
      level: enemyPrincessLevel
    }
  ];

  return { playerTowers, enemyTowers };
}

function createInitialPlacementZones(): { playerZones: PlacementZone[], enemyZones: PlacementZone[] } {
  // Player's default zone is their half of the arena (extended to allow placement behind king tower)
  const playerZones: PlacementZone[] = [
    {
      id: 'player-default',
      minX: 0,
      maxX: ARENA_WIDTH,
      minY: ARENA_HEIGHT / 2 - 40, // Extended 40px higher to allow placement near/behind king tower
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
const LEFT_BRIDGE = { minX: 30, maxX: 80 };
const RIGHT_BRIDGE = { minX: ARENA_WIDTH - 80, maxX: ARENA_WIDTH - 30 };

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
  const speed = unit.moveSpeed * delta * 0.8; // Ultra slow smooth movement
  
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

function createInitialState(playerDeckIds: string[], towerLevels: { princess: number; king: number } = { princess: 1, king: 1 }): GameState {
  const { playerTowers, enemyTowers } = createInitialTowers(towerLevels);
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
    playerBuildings: [],
    enemyBuildings: [],
    activeSpells: [],
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
    playerCardCooldowns: [0, 0, 0, 0],
    enemyCardCooldowns: [0, 0, 0, 0]
  };
}

export function useGameState(
  playerDeckIds: string[],
  playerCardLevels: Record<string, number>,
  towerLevels: { princess: number; king: number } = { princess: 1, king: 1 },
  onTrackDamage?: (cardId: string, damage: number) => void,
  getBalancedCardStats?: (cardId: string) => CardDefinition | null
) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(playerDeckIds, towerLevels));
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [spawnEffects, setSpawnEffects] = useState<SpawnEffect[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [crownAnimations, setCrownAnimations] = useState<CrownAnimation[]>([]);
  
  // Store card levels in a ref so spawnUnit can access them
  const cardLevelsRef = useRef(playerCardLevels);
  cardLevelsRef.current = playerCardLevels;
  
  // Track previous tower health to detect when towers are destroyed
  const prevTowerHealthRef = useRef<Map<string, number>>(new Map());
  
  const lastTickRef = useRef<number>(performance.now());
  const unitIdCounter = useRef(0);
  const projectileIdCounter = useRef(0);
  const spawnIdCounter = useRef(0);
  const damageIdCounter = useRef(0);
  const crownIdCounter = useRef(0);
  const aiLastPlayTime = useRef(0);
  const trackDamageRef = useRef(onTrackDamage);
  const getBalancedStatsRef = useRef(getBalancedCardStats);
  
  // Keep refs updated
  useEffect(() => {
    trackDamageRef.current = onTrackDamage;
    getBalancedStatsRef.current = getBalancedCardStats;
  }, [onTrackDamage, getBalancedCardStats]);

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

  // Track damage for balance system
  const trackCardDamage = useCallback((cardId: string, damage: number, owner: 'player' | 'enemy') => {
    // Only track player's cards for balance
    if (owner === 'player' && trackDamageRef.current) {
      trackDamageRef.current(cardId, damage);
    }
  }, []);

  // Get balanced card (with nerfs applied if any)
  const getCardWithBalance = useCallback((card: CardDefinition): CardDefinition => {
    if (!getBalancedStatsRef.current) return card;
    const balanced = getBalancedStatsRef.current(card.id);
    return balanced || card;
  }, []);

  const spawnUnit = useCallback((card: CardDefinition, position: Position, owner: 'player' | 'enemy', level: number = 1): Unit => {
    // Apply balance modifiers for player cards
    const balancedCard = owner === 'player' ? getCardWithBalance(card) : card;
    
    // Apply size-based speed multiplier
    const sizeSpeedMultiplier = SIZE_SPEED_MULTIPLIERS[balancedCard.size];
    const effectiveMoveSpeed = Math.round(balancedCard.moveSpeed * sizeSpeedMultiplier);
    
    // Calculate level multiplier (10% per level)
    const levelMultiplier = Math.pow(1.1, level - 1);
    const scaledHealth = Math.floor(balancedCard.health * levelMultiplier);
    const scaledDamage = Math.floor(balancedCard.damage * levelMultiplier);
    
    // Initialize champion ability state if applicable
    const abilityState = balancedCard.championAbility ? {
      type: balancedCard.championAbility,
      lastActivationTime: 0,
      isActive: false,
      stacks: 0,
      remainingDuration: 0,
      hasTriggered: false
    } : undefined;
    
    return {
      id: `unit-${unitIdCounter.current++}`,
      cardId: balancedCard.id,
      owner,
      position: { ...position },
      health: scaledHealth,
      maxHealth: scaledHealth,
      damage: scaledDamage,
      attackSpeed: balancedCard.attackSpeed,
      moveSpeed: effectiveMoveSpeed,
      range: balancedCard.range,
      lastAttackTime: 0,
      targetId: null,
      state: 'idle',
      animationFrame: 0,
      direction: owner === 'player' ? 'up' : 'down',
      deployCooldown: balancedCard.deployCooldown,
      level,
      // Combat properties from card
      isFlying: balancedCard.isFlying,
      targetType: balancedCard.targetType,
      splashRadius: balancedCard.splashRadius,
      count: balancedCard.count || 1,
      size: balancedCard.size,
      statusEffects: [],
      // Spawning properties (for units like Witch)
      spawnInterval: balancedCard.spawnInterval,
      spawnCardId: balancedCard.spawnCardId,
      spawnCount: balancedCard.spawnCount,
      lastSpawnTime: 0,
      // Champion ability state
      abilityState
    };
  }, [getCardWithBalance]);

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

  const spawnBuilding = useCallback((card: CardDefinition, position: Position, owner: 'player' | 'enemy'): Building => {
    return {
      id: `building-${unitIdCounter.current++}`,
      cardId: card.id,
      owner,
      position: { ...position },
      health: card.health,
      maxHealth: card.health,
      damage: card.damage,
      attackSpeed: card.attackSpeed,
      range: card.range,
      lastAttackTime: 0,
      targetType: card.targetType === 'buildings' ? 'both' : card.targetType,
      lifetime: card.buildingLifetime || 30,
      maxLifetime: card.buildingLifetime || 30,
      isSpawner: !!(card.spawnCardId),
      spawnInterval: card.spawnInterval,
      spawnCardId: card.spawnCardId,
      spawnCount: card.spawnCount || 1,
      lastSpawnTime: 0,
      splashRadius: card.splashRadius
    };
  }, []);

  const castSpell = useCallback((card: CardDefinition, position: Position, owner: 'player' | 'enemy'): ActiveSpell => {
    return {
      id: `spell-${unitIdCounter.current++}`,
      cardId: card.id,
      owner,
      position: { ...position },
      radius: card.spellRadius || 80,
      effects: card.spellEffects || [],
      remainingDuration: card.spellDuration || 0,
      damage: card.damage,
      hasAppliedInstant: false
    };
  }, []);

  const playCard = useCallback((cardIndex: number, position: Position) => {
    setGameState(prev => {
      const card = prev.playerHand[cardIndex];
      if (!card || prev.playerElixir < card.elixirCost) return prev;
      
      // Check if card is on cooldown
      if (prev.playerCardCooldowns[cardIndex] > 0) return prev;
      
      // Spells can be placed anywhere (even enemy side)
      const isSpell = card.type === 'spell';
      
      // Check if position is in valid placement zones (unless it's a spell)
      if (!isSpell && !isPositionInZones(position, prev.playerPlacementZones)) return prev;

      // Check we have a next card available
      const nextCard = prev.playerDeck[0];
      if (!nextCard) return prev;

      addSpawnEffect(position, 'player', card.emoji);
      
      const newHand = [...prev.playerHand];
      newHand[cardIndex] = nextCard;
      const newDeck = [...prev.playerDeck.slice(1), card];

      const newCooldowns = [...prev.playerCardCooldowns];
      newCooldowns[cardIndex] = nextCard.deployCooldown;

      const newState = {
        ...prev,
        playerElixir: prev.playerElixir - card.elixirCost,
        playerHand: newHand,
        playerDeck: newDeck,
        selectedCardIndex: null,
        playerCardCooldowns: newCooldowns
      };

      // Handle different card types
      if (card.type === 'spell') {
        const newSpell = castSpell(card, position, 'player');
        newState.activeSpells = [...prev.activeSpells, newSpell];
      } else if (card.type === 'building') {
        const newBuilding = spawnBuilding(card, position, 'player');
        newState.playerBuildings = [...prev.playerBuildings, newBuilding];
      } else {
        // Troop/tank/mini-tank - spawn units
        const unitCount = card.count || 1;
        const cardLevel = cardLevelsRef.current[card.id] || 1;
        const newUnits: Unit[] = [];
        for (let i = 0; i < unitCount; i++) {
          // Spread multiple units slightly
          const offset = unitCount > 1 ? {
            x: (i - (unitCount - 1) / 2) * 15,
            y: (i % 2) * 10
          } : { x: 0, y: 0 };
          const unitPos = { x: position.x + offset.x, y: position.y + offset.y };
          const unit = spawnUnit(card, unitPos, 'player', cardLevel);
          // Adjust health for multi-unit cards (health is per unit) - scale by level
          const levelMultiplier = Math.pow(1.1, cardLevel - 1);
          unit.health = Math.floor(card.health * levelMultiplier);
          unit.maxHealth = Math.floor(card.health * levelMultiplier);
          newUnits.push(unit);
        }
        newState.playerUnits = [...prev.playerUnits, ...newUnits];
      }

      return newState;
    });
  }, [spawnUnit, spawnBuilding, castSpell, addSpawnEffect]);

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
      // Cap delta at 33ms (~30fps min) for smoother gameplay
      const delta = Math.min(deltaMs, 33) / 1000;
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

      // Update crown animations
      setCrownAnimations(prev =>
        prev.map(c => ({
          ...c,
          progress: c.progress + delta * 0.8
        })).filter(c => c.progress < 1)
      );

      setGameState(prev => {
        if (prev.gameStatus !== 'playing') return prev;

        const state: GameState = {
          ...prev,
          playerTowers: prev.playerTowers.map(t => ({ ...t })),
          enemyTowers: prev.enemyTowers.map(t => ({ ...t })),
          playerUnits: prev.playerUnits.map(u => ({ ...u, statusEffects: [...u.statusEffects] })),
          enemyUnits: prev.enemyUnits.map(u => ({ ...u, statusEffects: [...u.statusEffects] })),
          playerBuildings: prev.playerBuildings.map(b => ({ ...b })),
          enemyBuildings: prev.enemyBuildings.map(b => ({ ...b })),
          activeSpells: prev.activeSpells.map(s => ({ ...s, effects: [...s.effects] })),
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
              // Enemy gets random level 1-5 for variety
              const enemyLevel = Math.floor(Math.random() * 5) + 1;
              const newUnit = spawnUnit(aiDecision.card, aiDecision.position, 'enemy', enemyLevel);
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

          // Filter valid targets based on unit's targetType
          const validEnemyUnits = state.enemyUnits.filter(u => {
            if (u.health <= 0) return false;
            // Check if this unit can target the enemy based on flying status
            if (unit.targetType === 'ground' && u.isFlying) return false;
            if (unit.targetType === 'air' && !u.isFlying) return false;
            if (unit.targetType === 'buildings') return false; // Buildings-only units don't attack units
            // Cloaked units (Archer Queen) can't be targeted
            if (u.abilityState?.type === 'cloak' && u.abilityState.isActive) return false;
            return true; // 'both' targets everything
          });

          const validEnemyTowers = unit.targetType === 'air' 
            ? [] // Air-only units can't attack towers (ground buildings)
            : state.enemyTowers.filter(t => t.health > 0);
          
          // Include enemy buildings as valid targets for building-targeting units
          const validEnemyBuildings = unit.targetType === 'air'
            ? []
            : state.enemyBuildings.filter(b => b.health > 0);

          // For buildings-only units (Giant, Hog, Balloon, Golem), target nearest building OR tower
          // Buildings take priority if closer than towers
          if (unit.targetType === 'buildings') {
            const allBuildingTargets = [...validEnemyBuildings, ...validEnemyTowers];
            
            // Check if current target is still valid
            let currentTarget: (Building | Tower) | null = null;
            if (unit.targetId) {
              currentTarget = allBuildingTargets.find(t => t.id === unit.targetId) || null;
              if (currentTarget) {
                const distToTarget = getDistance(unit.position, currentTarget.position);
                // Break target lock if too far away (4 tiles)
                if (distToTarget > TARGET_BREAK_DISTANCE) {
                  currentTarget = null;
                  unit.targetId = null;
                }
              } else {
                unit.targetId = null;
              }
            }
            
            // Find new target if none locked
            if (!currentTarget) {
              let closestDist = Infinity;
              for (const target of allBuildingTargets) {
                const dist = getDistance(unit.position, target.position);
                if (dist < closestDist) {
                  closestDist = dist;
                  currentTarget = target;
                }
              }
              if (currentTarget) {
                unit.targetId = currentTarget.id;
              }
            }
            
            if (currentTarget) {
              const distToTarget = getDistance(unit.position, currentTarget.position);
              if (distToTarget <= unit.range) {
                unit.state = 'attacking';
                if (now - unit.lastAttackTime > 1000 / unit.attackSpeed) {
                  unit.lastAttackTime = now;
                  const damage = Math.round(unit.damage * DAMAGE_MULTIPLIER);
                  currentTarget.health -= damage;
                  addDamageNumber(currentTarget.position, damage, damage > 200);
                  trackCardDamage(unit.cardId, damage, 'player');
                }
              } else {
                unit.state = 'moving';
                const movement = calculateMovement(unit, currentTarget.position, delta);
                unit.position = { x: movement.newX, y: movement.newY };
                unit.direction = movement.direction;
              }
              unit.animationFrame = (unit.animationFrame + 1) % 60;
            } else {
              unit.state = 'idle';
              unit.targetId = null;
            }
            return unit;
          }

          // For units that attack other units - implement target locking
          const allValidTargets = [...validEnemyUnits, ...validEnemyBuildings, ...validEnemyTowers];
          
          // Check if current target is still valid
          let currentTarget: (Unit | Tower | Building) | null = null;
          if (unit.targetId) {
            currentTarget = allValidTargets.find(t => t.id === unit.targetId) || null;
            if (currentTarget) {
              const distToTarget = getDistance(unit.position, currentTarget.position);
              // Break target lock if too far away (4 tiles)
              if (distToTarget > TARGET_BREAK_DISTANCE) {
                currentTarget = null;
                unit.targetId = null;
              }
            } else {
              unit.targetId = null;
            }
          }
          
          // Find new target if none locked
          if (!currentTarget) {
            let closestDist = Infinity;
            
            // FIRST PRIORITY: Closest enemy BUILDING (buildings attract troops)
            for (const building of validEnemyBuildings) {
              const dist = getDistance(unit.position, building.position);
              if (dist < closestDist) {
                closestDist = dist;
                currentTarget = building;
              }
            }
            
            // SECOND PRIORITY: If no buildings, target closest enemy unit
            if (!currentTarget) {
              for (const enemy of validEnemyUnits) {
                const dist = getDistance(unit.position, enemy.position);
                if (dist < closestDist) {
                  closestDist = dist;
                  currentTarget = enemy;
                }
              }
            }
            
            // THIRD PRIORITY: If no buildings or units, target closest tower
            if (!currentTarget) {
              for (const tower of validEnemyTowers) {
                const dist = getDistance(unit.position, tower.position);
                if (dist < closestDist) {
                  closestDist = dist;
                  currentTarget = tower;
                }
              }
            }
            
            if (currentTarget) {
              unit.targetId = currentTarget.id;
            }
          }

          if (currentTarget) {
            const distToTarget = getDistance(unit.position, currentTarget.position);
            if (distToTarget <= unit.range) {
              unit.state = 'attacking';
              if (now - unit.lastAttackTime > 1000 / unit.attackSpeed) {
                unit.lastAttackTime = now;
                const damage = Math.round(unit.damage * DAMAGE_MULTIPLIER);
                
                // Handle splash damage
                if (unit.splashRadius && unit.splashRadius > 0) {
                  // Deal damage to all valid enemies in splash radius (including buildings)
                  const splashTargets = [...validEnemyUnits, ...validEnemyBuildings, ...validEnemyTowers];
                  splashTargets.forEach(target => {
                    const distToSplash = getDistance(currentTarget!.position, target.position);
                    if (distToSplash <= unit.splashRadius!) {
                      target.health -= damage;
                      addDamageNumber(target.position, damage, damage > 200);
                      // Track damage for balance system (player units only)
                      trackCardDamage(unit.cardId, damage, 'player');
                    }
                  });
                } else {
                  // Single target damage
                  currentTarget.health -= damage;
                  addDamageNumber(currentTarget.position, damage, damage > 200);
                  // Track damage for balance system (player units only)
                  trackCardDamage(unit.cardId, damage, 'player');
                }
              }
            } else {
              unit.state = 'moving';
              const movement = calculateMovement(unit, currentTarget.position, delta);
              unit.position = { x: movement.newX, y: movement.newY };
              unit.direction = movement.direction;
            }
            unit.animationFrame = (unit.animationFrame + 1) % 60;
          } else {
            unit.state = 'idle';
            unit.targetId = null;
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

          // Filter valid targets based on unit's targetType
          const validPlayerUnits = state.playerUnits.filter(u => {
            if (u.health <= 0) return false;
            if (unit.targetType === 'ground' && u.isFlying) return false;
            if (unit.targetType === 'air' && !u.isFlying) return false;
            if (unit.targetType === 'buildings') return false;
            // Cloaked units (Archer Queen) can't be targeted
            if (u.abilityState?.type === 'cloak' && u.abilityState.isActive) return false;
            return true;
          });

          const validPlayerTowers = unit.targetType === 'air' 
            ? []
            : state.playerTowers.filter(t => t.health > 0);
          
          // Include player buildings as valid targets
          const validPlayerBuildings = unit.targetType === 'air'
            ? []
            : state.playerBuildings.filter(b => b.health > 0);

          // For buildings-only units (Giant, Hog, Balloon, Golem), target nearest building OR tower
          if (unit.targetType === 'buildings') {
            const allBuildingTargets = [...validPlayerBuildings, ...validPlayerTowers];
            
            // Check if current target is still valid
            let currentTarget: (Building | Tower) | null = null;
            if (unit.targetId) {
              currentTarget = allBuildingTargets.find(t => t.id === unit.targetId) || null;
              if (currentTarget) {
                const distToTarget = getDistance(unit.position, currentTarget.position);
                // Break target lock if too far away (4 tiles)
                if (distToTarget > TARGET_BREAK_DISTANCE) {
                  currentTarget = null;
                  unit.targetId = null;
                }
              } else {
                unit.targetId = null;
              }
            }
            
            // Find new target if none locked
            if (!currentTarget) {
              let closestDist = Infinity;
              for (const target of allBuildingTargets) {
                const dist = getDistance(unit.position, target.position);
                if (dist < closestDist) {
                  closestDist = dist;
                  currentTarget = target;
                }
              }
              if (currentTarget) {
                unit.targetId = currentTarget.id;
              }
            }
            
            if (currentTarget) {
              const distToTarget = getDistance(unit.position, currentTarget.position);
              if (distToTarget <= unit.range) {
                unit.state = 'attacking';
                if (now - unit.lastAttackTime > 1000 / unit.attackSpeed) {
                  unit.lastAttackTime = now;
                  const damage = Math.round(unit.damage * DAMAGE_MULTIPLIER);
                  currentTarget.health -= damage;
                  addDamageNumber(currentTarget.position, damage, damage > 200);
                }
              } else {
                unit.state = 'moving';
                const movement = calculateMovement(unit, currentTarget.position, delta);
                unit.position = { x: movement.newX, y: movement.newY };
                unit.direction = movement.direction;
              }
              unit.animationFrame = (unit.animationFrame + 1) % 60;
            } else {
              unit.state = 'idle';
              unit.targetId = null;
            }
            return unit;
          }

          // For units that attack other units - implement target locking
          const allValidTargets = [...validPlayerUnits, ...validPlayerBuildings, ...validPlayerTowers];
          
          // Check if current target is still valid
          let currentTarget: (Unit | Tower | Building) | null = null;
          if (unit.targetId) {
            currentTarget = allValidTargets.find(t => t.id === unit.targetId) || null;
            if (currentTarget) {
              const distToTarget = getDistance(unit.position, currentTarget.position);
              // Break target lock if too far away (4 tiles)
              if (distToTarget > TARGET_BREAK_DISTANCE) {
                currentTarget = null;
                unit.targetId = null;
              }
            } else {
              unit.targetId = null;
            }
          }
          
          // Find new target if none locked
          if (!currentTarget) {
            let closestDist = Infinity;
            
            // FIRST PRIORITY: Closest player BUILDING (buildings attract troops)
            for (const building of validPlayerBuildings) {
              const dist = getDistance(unit.position, building.position);
              if (dist < closestDist) {
                closestDist = dist;
                currentTarget = building;
              }
            }
            
            // SECOND PRIORITY: If no buildings, target closest player unit
            if (!currentTarget) {
              for (const enemy of validPlayerUnits) {
                const dist = getDistance(unit.position, enemy.position);
                if (dist < closestDist) {
                  closestDist = dist;
                  currentTarget = enemy;
                }
              }
            }
            
            // THIRD PRIORITY: If no buildings or units, target closest tower
            if (!currentTarget) {
              for (const tower of validPlayerTowers) {
                const dist = getDistance(unit.position, tower.position);
                if (dist < closestDist) {
                  closestDist = dist;
                  currentTarget = tower;
                }
              }
            }
            
            if (currentTarget) {
              unit.targetId = currentTarget.id;
            }
          }

          if (currentTarget) {
            const distToTarget = getDistance(unit.position, currentTarget.position);
            if (distToTarget <= unit.range) {
              unit.state = 'attacking';
              if (now - unit.lastAttackTime > 1000 / unit.attackSpeed) {
                unit.lastAttackTime = now;
                const damage = Math.round(unit.damage * DAMAGE_MULTIPLIER);
                
                // Handle splash damage (including buildings)
                if (unit.splashRadius && unit.splashRadius > 0) {
                  const splashTargets = [...validPlayerUnits, ...validPlayerBuildings, ...validPlayerTowers];
                  splashTargets.forEach(target => {
                    const distToSplash = getDistance(currentTarget!.position, target.position);
                    if (distToSplash <= unit.splashRadius!) {
                      target.health -= damage;
                      addDamageNumber(target.position, damage, damage > 200);
                    }
                  });
                } else {
                  currentTarget.health -= damage;
                  addDamageNumber(currentTarget.position, damage, damage > 200);
                }
              }
            } else {
              unit.state = 'moving';
              const movement = calculateMovement(unit, currentTarget.position, delta);
              unit.position = { x: movement.newX, y: movement.newY };
              unit.direction = movement.direction;
            }
            unit.animationFrame = (unit.animationFrame + 1) % 60;
          } else {
            unit.state = 'idle';
            unit.targetId = null;
          }

          return unit;
        });

        // ==================== UPDATE SPELLS ====================
        // Process active spells (damage, status effects)
        state.activeSpells = state.activeSpells.map(spell => {
          const updatedSpell = { ...spell };
          
          // Get all targets in spell radius
          const allEnemyUnits = spell.owner === 'player' ? state.enemyUnits : state.playerUnits;
          const allEnemyTowers = spell.owner === 'player' ? state.enemyTowers : state.playerTowers;
          const allEnemyBuildings = spell.owner === 'player' ? state.enemyBuildings : state.playerBuildings;
          
          // Check targetType from card
          const card = getCardById(spell.cardId);
          const canHitAir = card?.targetType !== 'ground';
          const canHitGround = card?.targetType !== 'air';
          
          const targetsInRange = [
            ...allEnemyUnits.filter(u => {
              if (u.health <= 0) return false;
              if (u.isFlying && !canHitAir) return false;
              if (!u.isFlying && !canHitGround) return false;
              return getDistance(spell.position, u.position) <= spell.radius;
            }),
            ...allEnemyTowers.filter(t => t.health > 0 && getDistance(spell.position, t.position) <= spell.radius),
            ...allEnemyBuildings.filter(b => b.health > 0 && getDistance(spell.position, b.position) <= spell.radius)
          ];
          
          // Apply instant damage (only once)
          if (!updatedSpell.hasAppliedInstant && spell.damage > 0) {
            const spellDamage = Math.round(spell.damage * DAMAGE_MULTIPLIER);
            targetsInRange.forEach(target => {
              target.health -= spellDamage;
              addDamageNumber(target.position, spellDamage, spellDamage > 150);
              // Track spell damage for balance system (player spells only)
              if (spell.owner === 'player') {
                trackCardDamage(spell.cardId, spellDamage, 'player');
              }
            });
            updatedSpell.hasAppliedInstant = true;
          }
          
          // Apply duration-based effects
          if (spell.remainingDuration > 0) {
            spell.effects.forEach(effect => {
              if (effect.type === 'freeze' || effect.type === 'stun') {
                // Apply freeze/stun status effect to units
                allEnemyUnits.filter(u => u.health > 0 && getDistance(spell.position, u.position) <= spell.radius)
                  .forEach(unit => {
                    const existingEffect = unit.statusEffects.find(e => e.sourceId === spell.id && e.type === effect.type);
                    if (!existingEffect) {
                      unit.statusEffects.push({
                        type: effect.type,
                        value: effect.value,
                        remainingDuration: effect.duration || spell.remainingDuration,
                        sourceId: spell.id
                      });
                    }
                  });
              } else if (effect.type === 'slow') {
                // Apply slow (or speed boost if negative)
                allEnemyUnits.filter(u => u.health > 0 && getDistance(spell.position, u.position) <= spell.radius)
                  .forEach(unit => {
                    const existingEffect = unit.statusEffects.find(e => e.sourceId === spell.id && e.type === 'slow');
                    if (!existingEffect) {
                      unit.statusEffects.push({
                        type: 'slow',
                        value: effect.value,
                        remainingDuration: effect.duration || spell.remainingDuration,
                        sourceId: spell.id
                      });
                    }
                  });
              } else if (effect.type === 'damage' && spell.remainingDuration > 0) {
                // DoT spells (like Poison) deal damage over time
                const dotDamage = effect.value * delta; // Damage per second
                targetsInRange.forEach(target => {
                  target.health -= dotDamage;
                });
              }
            });
            
            updatedSpell.remainingDuration -= delta;
          }
          
          return updatedSpell;
        }).filter(spell => spell.remainingDuration > 0 || !spell.hasAppliedInstant || spell.remainingDuration === 0 && spell.hasAppliedInstant);
        
        // Remove expired instant spells
        state.activeSpells = state.activeSpells.filter(spell => {
          if (spell.remainingDuration <= 0 && spell.hasAppliedInstant) {
            return false; // Remove completed spells
          }
          return true;
        });
        
        // Update unit status effects (decrement durations, apply effects)
        [...state.playerUnits, ...state.enemyUnits].forEach(unit => {
          // Apply status effect modifiers
          unit.statusEffects = unit.statusEffects.map(effect => ({
            ...effect,
            remainingDuration: effect.remainingDuration - delta
          })).filter(effect => effect.remainingDuration > 0);
          
          // Check for freeze/stun - prevents movement and attacking
          const isFrozen = unit.statusEffects.some(e => e.type === 'freeze' || e.type === 'stun');
          if (isFrozen) {
            unit.state = 'idle';
          }
        });

        // ==================== UNIT SPAWNING (Witch, etc.) ====================
        // Handle units that spawn other units
        const processUnitSpawning = (units: Unit[], owner: 'player' | 'enemy') => {
          units.forEach(unit => {
            if (unit.health <= 0) return;
            if (!unit.spawnCardId || !unit.spawnInterval) return;
            
            if (now - unit.lastSpawnTime > unit.spawnInterval * 1000) {
              const spawnCard = getCardById(unit.spawnCardId);
              if (spawnCard) {
                // Spawn offset based on owner direction
                const spawnY = owner === 'player' ? unit.position.y - 15 : unit.position.y + 15;
                const spawnCount = unit.spawnCount || 1;
                for (let i = 0; i < spawnCount; i++) {
                  const offsetX = (i - (spawnCount - 1) / 2) * 12;
                  // Spawned units inherit the parent unit's level
                  const newUnit = spawnUnit(spawnCard, { x: unit.position.x + offsetX, y: spawnY }, owner, unit.level);
                  if (owner === 'player') {
                    state.playerUnits.push(newUnit);
                  } else {
                    state.enemyUnits.push(newUnit);
                  }
                  addSpawnEffect({ x: unit.position.x + offsetX, y: spawnY }, owner, spawnCard.emoji);
                }
                unit.lastSpawnTime = now;
              }
            }
          });
        };
        
        processUnitSpawning(state.playerUnits, 'player');
        processUnitSpawning(state.enemyUnits, 'enemy');

        // ==================== UPDATE BUILDINGS ====================
        // Decrease building lifetime and handle spawner buildings
        // Buildings also take slow decay damage over time
        const BUILDING_DECAY_RATE = 5; // Health lost per second
        
        const updateBuildings = (buildings: Building[], owner: 'player' | 'enemy') => {
          return buildings.map(building => {
            const updated = { ...building };
            
            // Decrease lifetime
            updated.lifetime -= delta;
            
            // Buildings take decay damage over time
            if (updated.health > 0) {
              updated.health -= BUILDING_DECAY_RATE * delta;
            }
            
            // Spawner buildings spawn units periodically
            if (updated.isSpawner && updated.spawnCardId && updated.lifetime > 0) {
              if (now - updated.lastSpawnTime > (updated.spawnInterval || 5) * 1000) {
                const spawnCard = getCardById(updated.spawnCardId);
                if (spawnCard) {
                  // Spawn offset based on owner direction
                  const spawnY = owner === 'player' ? updated.position.y - 20 : updated.position.y + 20;
                  // Building spawned units get level 1 (buildings don't have levels for now)
                  const spawnLevel = owner === 'player' ? (cardLevelsRef.current[updated.cardId] || 1) : Math.floor(Math.random() * 3) + 1;
                  for (let i = 0; i < (updated.spawnCount || 1); i++) {
                    const newUnit = spawnUnit(spawnCard, { x: updated.position.x + (i * 10), y: spawnY }, owner, spawnLevel);
                    if (owner === 'player') {
                      state.playerUnits.push(newUnit);
                    } else {
                      state.enemyUnits.push(newUnit);
                    }
                    addSpawnEffect({ x: updated.position.x, y: spawnY }, owner, spawnCard.emoji);
                  }
                  updated.lastSpawnTime = now;
                }
              }
            }
            
            // Defensive buildings attack enemies
            if (updated.damage > 0 && updated.range > 0 && updated.lifetime > 0 && updated.health > 0) {
              const enemyUnits = owner === 'player' ? state.enemyUnits : state.playerUnits;
              
              // Filter valid targets based on building's targetType
              const validTargets = enemyUnits.filter(u => {
                if (u.health <= 0) return false;
                if (updated.targetType === 'ground' && u.isFlying) return false;
                if (updated.targetType === 'air' && !u.isFlying) return false;
                return getDistance(updated.position, u.position) <= updated.range;
              });
              
              if (validTargets.length > 0 && now - updated.lastAttackTime > 1000 / updated.attackSpeed) {
                const target = validTargets[0];
                updated.lastAttackTime = now;
                
                // Apply damage (splash or single target)
                const buildingDamage = Math.round(updated.damage * DAMAGE_MULTIPLIER);
                if (updated.splashRadius && updated.splashRadius > 0) {
                  validTargets.forEach(t => {
                    if (getDistance(target.position, t.position) <= updated.splashRadius!) {
                      t.health -= buildingDamage;
                      addDamageNumber(t.position, buildingDamage, buildingDamage > 60);
                    }
                  });
                } else {
                  target.health -= buildingDamage;
                  addDamageNumber(target.position, buildingDamage, buildingDamage > 60);
                }
                
                // Add projectile visual
                newProjectiles.push({
                  id: `proj-${projectileIdCounter.current++}`,
                  from: { ...updated.position },
                  to: { ...target.position },
                  progress: 0,
                  damage: 0, // Damage already applied
                  targetId: target.id,
                  type: 'arrow',
                  owner
                });
              }
            }
            
            return updated;
          }).filter(b => b.lifetime > 0 && b.health > 0); // Remove expired/destroyed buildings
        };
        
        state.playerBuildings = updateBuildings(state.playerBuildings, 'player');
        state.enemyBuildings = updateBuildings(state.enemyBuildings, 'enemy');

        // Tower attacks with projectiles
        state.playerTowers.forEach(tower => {
          if (tower.health <= 0) return;
          // King tower only attacks when activated
          if (tower.type === 'king' && !tower.isActivated) return;
          
          if (now - tower.lastAttackTime > tower.attackCooldown) {
            let enemies: Unit[] = [];
            
            if (tower.type === 'king' && tower.isActivated) {
              // ACTIVATED KING TOWER: Can attack enemies near either princess tower OR in king range
              const princessTowers = state.playerTowers.filter(t => t.type === 'princess' && t.health > 0);
              
              enemies = state.enemyUnits.filter(u => {
                if (u.health <= 0) return false;
                
                // Check if enemy is in king tower's own range
                if (getDistance(tower.position, u.position) <= tower.attackRange) return true;
                
                // Check if enemy is attacking/near any princess tower (within princess attack range)
                for (const princess of princessTowers) {
                  if (getDistance(princess.position, u.position) <= princess.attackRange) {
                    return true;
                  }
                }
                
                return false;
              });
            } else {
              // Princess towers - original logic with bridge restriction
              enemies = state.enemyUnits.filter(u => {
                if (u.health <= 0) return false;
                if (getDistance(tower.position, u.position) > tower.attackRange) return false;
                
                // Princess towers cannot fire at units on/past the bridge (enemy's side)
                if (tower.type === 'princess') {
                  const isOnOrPastBridge = u.position.y <= RIVER_Y + RIVER_HALF_WIDTH;
                  if (isOnOrPastBridge) return false;
                }
                
                return true;
              });
            }
            
            if (enemies.length > 0) {
              // Sort by distance to prioritize closer enemies
              enemies.sort((a, b) => getDistance(tower.position, a.position) - getDistance(tower.position, b.position));
              const target = enemies[0];
              tower.lastAttackTime = now;
              newProjectiles.push({
                id: `proj-${projectileIdCounter.current++}`,
                from: { ...tower.position },
                to: { ...target.position },
                progress: 0,
                damage: Math.round(tower.attackDamage * DAMAGE_MULTIPLIER),
                targetId: target.id,
                type: tower.type === 'king' ? 'fireball' : 'arrow',
                owner: 'player'
              });
            }
          }
        });

        state.enemyTowers.forEach(tower => {
          if (tower.health <= 0) return;
          // King tower only attacks when activated
          if (tower.type === 'king' && !tower.isActivated) return;
          
          if (now - tower.lastAttackTime > tower.attackCooldown) {
            let enemies: Unit[] = [];
            
            if (tower.type === 'king' && tower.isActivated) {
              // ACTIVATED KING TOWER: Can attack enemies near either princess tower OR in king range
              const princessTowers = state.enemyTowers.filter(t => t.type === 'princess' && t.health > 0);
              
              enemies = state.playerUnits.filter(u => {
                if (u.health <= 0) return false;
                
                // Check if enemy is in king tower's own range
                if (getDistance(tower.position, u.position) <= tower.attackRange) return true;
                
                // Check if enemy is attacking/near any princess tower (within princess attack range)
                for (const princess of princessTowers) {
                  if (getDistance(princess.position, u.position) <= princess.attackRange) {
                    return true;
                  }
                }
                
                return false;
              });
            } else {
              // Princess towers - original logic with bridge restriction
              enemies = state.playerUnits.filter(u => {
                if (u.health <= 0) return false;
                if (getDistance(tower.position, u.position) > tower.attackRange) return false;
                
                // Princess towers cannot fire at units on/past the bridge (player's side)
                if (tower.type === 'princess') {
                  const isOnOrPastBridge = u.position.y >= RIVER_Y - RIVER_HALF_WIDTH;
                  if (isOnOrPastBridge) return false;
                }
                
                return true;
              });
            }
            
            if (enemies.length > 0) {
              // Sort by distance to prioritize closer enemies
              enemies.sort((a, b) => getDistance(tower.position, a.position) - getDistance(tower.position, b.position));
              const target = enemies[0];
              tower.lastAttackTime = now;
              newProjectiles.push({
                id: `proj-${projectileIdCounter.current++}`,
                from: { ...tower.position },
                to: { ...target.position },
                progress: 0,
                damage: Math.round(tower.attackDamage * DAMAGE_MULTIPLIER),
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

        // ==================== CHAMPION ABILITIES ====================
        // Process champion unit abilities before removing dead units
        
        const processChampionAbilities = (units: Unit[], owner: 'player' | 'enemy', enemyUnits: Unit[]) => {
          const unitsToAdd: Unit[] = [];
          const deadEnemies = enemyUnits.filter(u => u.health <= 0);
          
          units.forEach(unit => {
            if (unit.health <= 0 || !unit.abilityState) return;
            
            const ability = unit.abilityState;
            const healthPercent = unit.health / unit.maxHealth;
            
            switch (ability.type) {
              case 'dash-chain': {
                // Golden Knight: Dash to next enemy when killing an enemy
                // Check if we just killed someone (we're attacking and there are new dead enemies)
                if (unit.state === 'attacking' && deadEnemies.length > 0) {
                  // Find next closest alive enemy
                  const aliveEnemies = enemyUnits.filter(e => e.health > 0 && e.id !== unit.targetId);
                  if (aliveEnemies.length > 0) {
                    let closestEnemy: Unit | null = null;
                    let closestDist = 200; // Max dash range
                    
                    aliveEnemies.forEach(enemy => {
                      const dist = getDistance(unit.position, enemy.position);
                      if (dist < closestDist) {
                        closestDist = dist;
                        closestEnemy = enemy;
                      }
                    });
                    
                    if (closestEnemy) {
                      // Dash to the enemy (instant teleport + damage)
                      unit.position = { 
                        x: closestEnemy.position.x + 20, 
                        y: closestEnemy.position.y 
                      };
                      unit.targetId = closestEnemy.id;
                      // Deal bonus dash damage
                      const dashDamage = Math.round(unit.damage * 0.5 * DAMAGE_MULTIPLIER);
                      closestEnemy.health -= dashDamage;
                      addDamageNumber(closestEnemy.position, dashDamage, true);
                      addSpawnEffect(unit.position, owner, '⚡');
                    }
                  }
                }
                break;
              }
              
              case 'cloak': {
                // Archer Queen: Become invisible when below 70% HP (cooldown: 10s)
                if (!ability.isActive && healthPercent < 0.7 && now - ability.lastActivationTime > 10000) {
                  ability.isActive = true;
                  ability.remainingDuration = 4; // 4 seconds of invisibility
                  ability.lastActivationTime = now;
                  // Visual effect
                  addSpawnEffect(unit.position, owner, '👻');
                  // Make untargetable by removing from enemy targeting (handled in targeting logic)
                }
                
                // Update cloak duration
                if (ability.isActive) {
                  ability.remainingDuration -= delta;
                  if (ability.remainingDuration <= 0) {
                    ability.isActive = false;
                    addSpawnEffect(unit.position, owner, '👑🏹');
                  }
                }
                break;
              }
              
              case 'soul-summon': {
                // Skeleton King: Gain souls from nearby deaths, summon skeletons
                // Count nearby dead enemies
                const SOUL_RANGE = 100;
                const soulsGained = deadEnemies.filter(e => 
                  getDistance(unit.position, e.position) <= SOUL_RANGE
                ).length;
                
                ability.stacks += soulsGained;
                
                // Summon skeletons when enough souls (4 souls = 4 skeletons)
                if (ability.stacks >= 4 && now - ability.lastActivationTime > 3000) {
                  const skeletonCard = getCardById('skeletons');
                  if (skeletonCard) {
                    const numToSpawn = Math.min(ability.stacks, 8); // Max 8 at once
                    for (let i = 0; i < numToSpawn; i++) {
                      const offsetX = (i % 4 - 1.5) * 15;
                      const offsetY = Math.floor(i / 4) * 15;
                      const spawnPos = {
                        x: unit.position.x + offsetX,
                        y: unit.position.y + (owner === 'player' ? -25 : 25) + offsetY
                      };
                      unitsToAdd.push(spawnUnit(skeletonCard, spawnPos, owner, unit.level));
                      addSpawnEffect(spawnPos, owner, '💀');
                    }
                    ability.stacks -= numToSpawn;
                    ability.lastActivationTime = now;
                  }
                }
                break;
              }
              
              case 'drill': {
                // Mighty Miner: Burrow to safety at 30% HP (one-time use)
                if (!ability.hasTriggered && healthPercent <= 0.3) {
                  ability.hasTriggered = true;
                  // Burrow damage to enemies in path
                  const BURROW_DAMAGE = Math.round(unit.damage * 0.8 * DAMAGE_MULTIPLIER);
                  enemyUnits.filter(e => e.health > 0 && getDistance(unit.position, e.position) <= 60).forEach(enemy => {
                    enemy.health -= BURROW_DAMAGE;
                    addDamageNumber(enemy.position, BURROW_DAMAGE, false);
                  });
                  
                  // Teleport to king tower area
                  const escapeY = owner === 'player' ? ARENA_HEIGHT - 80 : 80;
                  unit.position = { x: ARENA_WIDTH / 2, y: escapeY };
                  unit.targetId = null;
                  addSpawnEffect(unit.position, owner, '⛏️');
                }
                break;
              }
              
              case 'guardian': {
                // Little Prince: Summon guardian knight at 50% HP (cooldown: 12s)
                if (!ability.hasTriggered && healthPercent <= 0.5 && now - ability.lastActivationTime > 12000) {
                  ability.hasTriggered = true;
                  ability.lastActivationTime = now;
                  
                  // Spawn a knight as guardian
                  const knightCard = getCardById('knight');
                  if (knightCard) {
                    const guardianPos = {
                      x: unit.position.x + 20,
                      y: unit.position.y + (owner === 'player' ? -15 : 15)
                    };
                    const guardian = spawnUnit(knightCard, guardianPos, owner, unit.level);
                    // Guardian has boosted stats
                    guardian.health = Math.floor(guardian.health * 1.2);
                    guardian.maxHealth = guardian.health;
                    guardian.damage = Math.floor(guardian.damage * 1.2);
                    unitsToAdd.push(guardian);
                    addSpawnEffect(guardianPos, owner, '🛡️');
                  }
                }
                break;
              }
              
              case 'reflect': {
                // Monk: Activate reflect mode periodically (every 8s, lasts 2s)
                if (!ability.isActive && now - ability.lastActivationTime > 8000) {
                  ability.isActive = true;
                  ability.remainingDuration = 2;
                  ability.lastActivationTime = now;
                  addSpawnEffect(unit.position, owner, '🧘');
                }
                
                if (ability.isActive) {
                  ability.remainingDuration -= delta;
                  if (ability.remainingDuration <= 0) {
                    ability.isActive = false;
                  }
                }
                break;
              }
            }
          });
          
          return unitsToAdd;
        };
        
        // Process abilities for both sides
        const newPlayerUnits = processChampionAbilities(state.playerUnits, 'player', state.enemyUnits);
        const newEnemyUnits = processChampionAbilities(state.enemyUnits, 'enemy', state.playerUnits);
        
        if (newPlayerUnits.length > 0) {
          state.playerUnits = [...state.playerUnits, ...newPlayerUnits];
        }
        if (newEnemyUnits.length > 0) {
          state.enemyUnits = [...state.enemyUnits, ...newEnemyUnits];
        }

        // Remove dead units
        state.playerUnits = state.playerUnits.filter(u => u.health > 0);
        state.enemyUnits = state.enemyUnits.filter(u => u.health > 0);

        // Detect tower destructions and spawn crown animations
        // Also activate king tower when princess tower is destroyed
        const checkTowerDestruction = (towers: Tower[], side: 'player' | 'enemy') => {
          towers.forEach(tower => {
            const prevHealth = prevTowerHealthRef.current.get(tower.id) ?? tower.maxHealth;
            
            // King tower activation: activate when damaged
            if (tower.type === 'king' && !tower.isActivated && tower.health < prevHealth && tower.health > 0) {
              tower.isActivated = true;
            }
            
            if (prevHealth > 0 && tower.health <= 0) {
              // Tower just got destroyed - spawn crown animation
              // Crown goes to the opposite side (enemy tower destroyed = player scores)
              const scoringSide = side === 'enemy' ? 'player' : 'enemy';
              setCrownAnimations(prev => [...prev, {
                id: `crown-${crownIdCounter.current++}`,
                fromPosition: { ...tower.position },
                toSide: scoringSide,
                progress: 0,
                towerType: tower.type
              }]);
              
              // King tower activation: activate when princess tower is destroyed
              if (tower.type === 'princess') {
                const kingTower = towers.find(t => t.type === 'king');
                if (kingTower && !kingTower.isActivated) {
                  kingTower.isActivated = true;
                }
              }
            }
            prevTowerHealthRef.current.set(tower.id, tower.health);
          });
        };
        
        checkTowerDestruction(state.playerTowers, 'player');
        checkTowerDestruction(state.enemyTowers, 'enemy');

        // Check win conditions
        const playerKing = state.playerTowers.find(t => t.type === 'king');
        const enemyKing = state.enemyTowers.find(t => t.type === 'king');

        // King tower destroyed = instant win (all 3 towers count as destroyed)
        if (enemyKing && enemyKing.health <= 0) {
          // Destroy all enemy towers when king falls
          state.enemyTowers.forEach(t => {
            if (t.health > 0) {
              t.health = 0;
              // Spawn crowns for any remaining towers
              setCrownAnimations(prev => [...prev, {
                id: `crown-${crownIdCounter.current++}`,
                fromPosition: { ...t.position },
                toSide: 'player',
                progress: 0,
                towerType: t.type
              }]);
            }
          });
          state.gameStatus = 'player-wins';
        } else if (playerKing && playerKing.health <= 0) {
          // Destroy all player towers when king falls
          state.playerTowers.forEach(t => {
            if (t.health > 0) {
              t.health = 0;
              // Spawn crowns for any remaining towers
              setCrownAnimations(prev => [...prev, {
                id: `crown-${crownIdCounter.current++}`,
                fromPosition: { ...t.position },
                toSide: 'enemy',
                progress: 0,
                towerType: t.type
              }]);
            }
          });
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
            // Tie-breaker: find tower with lowest health percentage and destroy it
            const allTowers = [
              ...state.playerTowers.filter(t => t.health > 0).map(t => ({ ...t, side: 'player' as const })),
              ...state.enemyTowers.filter(t => t.health > 0).map(t => ({ ...t, side: 'enemy' as const }))
            ];
            
            let lowestHealthTower: { id: string; healthPercent: number; side: 'player' | 'enemy' } | null = null;
            
            for (const tower of allTowers) {
              const healthPercent = tower.health / tower.maxHealth;
              if (!lowestHealthTower || healthPercent < lowestHealthTower.healthPercent) {
                lowestHealthTower = { id: tower.id, healthPercent, side: tower.side };
              }
            }
            
            if (lowestHealthTower) {
              // Destroy the tower with lowest health
              if (lowestHealthTower.side === 'player') {
                const tower = state.playerTowers.find(t => t.id === lowestHealthTower!.id);
                if (tower) tower.health = 0;
                state.gameStatus = 'enemy-wins';
              } else {
                const tower = state.enemyTowers.find(t => t.id === lowestHealthTower!.id);
                if (tower) tower.health = 0;
                state.gameStatus = 'player-wins';
              }
            } else {
              state.gameStatus = 'draw';
            }
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
  }, [spawnUnit, addSpawnEffect, addDamageNumber, trackCardDamage]);

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
    crownAnimations,
    playCard,
    selectCard,
    resetGame,
    ARENA_WIDTH,
    ARENA_HEIGHT
  };
}
