export interface Position {
  x: number;
  y: number;
}

export interface Tower {
  id: string;
  type: 'king' | 'princess';
  owner: 'player' | 'enemy';
  position: Position;
  health: number;
  maxHealth: number;
  attackDamage: number;
  attackRange: number;
  attackCooldown: number;
  lastAttackTime: number;
  isActivated?: boolean; // King tower only attacks when activated (damaged)
}

export interface CardDefinition {
  id: string;
  name: string;
  type: 'troop' | 'tank' | 'mini-tank' | 'spell' | 'building';
  elixirCost: number;
  emoji: string;
  health: number;
  damage: number;
  attackSpeed: number; // Attacks per second (higher = faster)
  moveSpeed: number; // Movement speed (higher = faster)
  range: number; // Attack range in pixels
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  deployCooldown: number; // Cooldown in seconds before unit can act after spawn
  // Combat properties for counterplay
  isFlying: boolean; // Air units - only targetable by air-targeting units
  targetType: 'ground' | 'air' | 'both' | 'buildings'; // What this unit can attack
  splashRadius?: number; // Optional - units with splash deal damage in this radius
  count?: number; // Number of units spawned (for swarm cards like Skeletons, Goblins)
  hitSpeed?: number; // Time between attacks in seconds (alternative to attackSpeed)
}

export interface Unit {
  id: string;
  cardId: string;
  owner: 'player' | 'enemy';
  position: Position;
  health: number;
  maxHealth: number;
  damage: number;
  attackSpeed: number;
  moveSpeed: number;
  range: number;
  lastAttackTime: number;
  targetId: string | null;
  state: 'idle' | 'moving' | 'attacking';
  animationFrame: number;
  direction: 'up' | 'down';
  deployCooldown: number; // Remaining deploy cooldown before unit can act
  // Combat properties
  isFlying: boolean;
  targetType: 'ground' | 'air' | 'both' | 'buildings';
  splashRadius?: number;
  count: number; // Number of units in this group
}

export interface PlacementZone {
  id: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  isActive: boolean;
  reason: 'default' | 'tower-destroyed';
}

export interface GameState {
  playerElixir: number;
  enemyElixir: number;
  playerTowers: Tower[];
  enemyTowers: Tower[];
  playerUnits: Unit[];
  enemyUnits: Unit[];
  playerDeck: CardDefinition[];
  playerHand: CardDefinition[];
  enemyDeck: CardDefinition[];
  enemyHand: CardDefinition[];
  timeRemaining: number;
  gameStatus: 'playing' | 'player-wins' | 'enemy-wins' | 'draw';
  selectedCardIndex: number | null;
  isSuddenDeath: boolean;
  playerPlacementZones: PlacementZone[];
  enemyPlacementZones: PlacementZone[];
  playerCardCooldowns: number[]; // Remaining cooldown time for each hand slot (in seconds)
  enemyCardCooldowns: number[];
}

export interface DeckSlot {
  id: 'A' | 'B' | 'C';
  name: string;
  cardIds: string[];
}

export interface PlayerProgress {
  ownedCardIds: string[];
  currentDeck: string[];
  deckSlots: DeckSlot[];
  activeDeckId: 'A' | 'B' | 'C';
  wins: number;
  losses: number;
  chestsAvailable: number;
  lastFreeChestDate: string | null; // ISO date string for daily free chest
}

export interface ChestReward {
  cards: { cardId: string; isNew: boolean }[];
}
