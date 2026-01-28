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
  attackSpeed: number;
  moveSpeed: number;
  range: number;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  deployCooldown: number; // Cooldown in seconds before card can be played again
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
}

export interface ChestReward {
  cards: { cardId: string; isNew: boolean }[];
}
