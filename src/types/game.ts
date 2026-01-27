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
}

export interface CardDefinition {
  id: string;
  name: string;
  type: 'troop' | 'tank' | 'mini-tank' | 'spell' | 'building';
  elixirCost: number;
  emoji: string;
  health: number;
  damage: number;
  attackSpeed: number; // attacks per second
  moveSpeed: number; // pixels per tick
  range: number;
  description: string;
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
}
