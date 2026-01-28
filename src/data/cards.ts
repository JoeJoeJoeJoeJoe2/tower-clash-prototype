import { CardDefinition } from '@/types/game';

export const allCards: CardDefinition[] = [
  // ==================== COMMON TROOPS ====================
  // Low cost, basic stats, starter-friendly
  
  {
    id: 'knight',
    name: 'Knight',
    type: 'mini-tank',
    elixirCost: 3,
    emoji: '⚔️',
    health: 1452,
    damage: 167,
    attackSpeed: 0.77, // 1.3s hit speed
    moveSpeed: 60, // Medium
    range: 30,
    hitSpeed: 1.3,
    description: 'A sturdy melee fighter with a big sword',
    rarity: 'common',
    color: '#d97706',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'ground', // Melee, can't hit air
    count: 1
  },
  {
    id: 'archers',
    name: 'Archers',
    type: 'troop',
    elixirCost: 3,
    emoji: '🏹',
    health: 304, // Per archer
    damage: 107,
    attackSpeed: 0.83, // 1.2s hit speed
    moveSpeed: 60, // Medium
    range: 150,
    hitSpeed: 1.2,
    description: 'A pair of sharpshooters',
    rarity: 'common',
    color: '#ec4899',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'both', // Can shoot air
    count: 2
  },
  {
    id: 'goblins',
    name: 'Goblins',
    type: 'troop',
    elixirCost: 2,
    emoji: '👺',
    health: 202, // Per goblin
    damage: 120,
    attackSpeed: 0.91, // 1.1s hit speed
    moveSpeed: 80, // Very Fast
    range: 30,
    hitSpeed: 1.1,
    description: 'Fast and cheap swarm',
    rarity: 'common',
    color: '#22c55e',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'ground',
    count: 3
  },
  {
    id: 'skeletons',
    name: 'Skeletons',
    type: 'troop',
    elixirCost: 1,
    emoji: '💀',
    health: 81, // Per skeleton - very fragile
    damage: 81,
    attackSpeed: 1.0, // 1.0s hit speed
    moveSpeed: 70, // Fast
    range: 30,
    hitSpeed: 1.0,
    description: 'Three spooky scary skeletons',
    rarity: 'common',
    color: '#a1a1aa',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'ground',
    count: 3
  },
  {
    id: 'bomber',
    name: 'Bomber',
    type: 'troop',
    elixirCost: 2,
    emoji: '💣',
    health: 332,
    damage: 233,
    attackSpeed: 0.56, // 1.8s hit speed
    moveSpeed: 60, // Medium
    range: 100,
    hitSpeed: 1.8,
    description: 'Throws explosive bombs - splash damage',
    rarity: 'common',
    color: '#f97316',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'ground', // Can't hit air
    splashRadius: 40,
    count: 1
  },
  {
    id: 'minions',
    name: 'Minions',
    type: 'troop',
    elixirCost: 3,
    emoji: '🦇',
    health: 216, // Per minion - fragile flying
    damage: 84,
    attackSpeed: 1.0, // 1.0s hit speed
    moveSpeed: 80, // Very Fast
    range: 35,
    hitSpeed: 1.0,
    description: 'Flying blue creatures',
    rarity: 'common',
    color: '#3b82f6',
    deployCooldown: 1.0,
    isFlying: true, // AIR UNIT
    targetType: 'both',
    count: 3
  },

  // ==================== RARE TROOPS ====================
  // Medium cost, stronger stats, specialized roles
  
  {
    id: 'giant',
    name: 'Giant',
    type: 'tank',
    elixirCost: 5,
    emoji: '🗿',
    health: 4091,
    damage: 254,
    attackSpeed: 0.67, // 1.5s hit speed
    moveSpeed: 45, // Slow
    range: 30,
    hitSpeed: 1.5,
    description: 'Slow but incredibly tanky - targets buildings',
    rarity: 'rare',
    color: '#78716c',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'buildings', // Only attacks buildings/towers
    count: 1
  },
  {
    id: 'wizard',
    name: 'Wizard',
    type: 'troop',
    elixirCost: 5,
    emoji: '🔥',
    health: 720,
    damage: 281,
    attackSpeed: 0.59, // 1.7s hit speed
    moveSpeed: 60, // Medium
    range: 130,
    hitSpeed: 1.7,
    description: 'Powerful fireball magic - splash damage',
    rarity: 'rare',
    color: '#ea580c',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'both', // Hits air and ground
    splashRadius: 50,
    count: 1
  },
  {
    id: 'valkyrie',
    name: 'Valkyrie',
    type: 'mini-tank',
    elixirCost: 4,
    emoji: '🪓',
    health: 1908,
    damage: 221,
    attackSpeed: 0.67, // 1.5s hit speed
    moveSpeed: 60, // Medium
    range: 35,
    hitSpeed: 1.5,
    description: 'Spins and hits all ground units around her',
    rarity: 'rare',
    color: '#f472b6',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'ground', // Can't hit air
    splashRadius: 60, // 360° splash around her
    count: 1
  },
  {
    id: 'musketeer',
    name: 'Musketeer',
    type: 'troop',
    elixirCost: 4,
    emoji: '🎯',
    health: 720,
    damage: 208,
    attackSpeed: 0.91, // 1.1s hit speed
    moveSpeed: 60, // Medium
    range: 180,
    hitSpeed: 1.1,
    description: 'Long range shooter - high single target DPS',
    rarity: 'rare',
    color: '#0891b2',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'both', // Can shoot air
    count: 1
  },
  {
    id: 'baby-dragon',
    name: 'Baby Dragon',
    type: 'troop',
    elixirCost: 4,
    emoji: '🐉',
    health: 1152,
    damage: 160,
    attackSpeed: 0.67, // 1.5s hit speed
    moveSpeed: 70, // Fast
    range: 100,
    hitSpeed: 1.5,
    description: 'Flying fire breather - splash damage',
    rarity: 'rare',
    color: '#7c3aed',
    deployCooldown: 1.0,
    isFlying: true, // AIR UNIT
    targetType: 'both',
    splashRadius: 45,
    count: 1
  },
  {
    id: 'hog-rider',
    name: 'Hog Rider',
    type: 'troop',
    elixirCost: 4,
    emoji: '🐗',
    health: 1696,
    damage: 264,
    attackSpeed: 0.63, // 1.6s hit speed
    moveSpeed: 100, // Very Fast
    range: 30,
    hitSpeed: 1.6,
    description: 'Fast tower rusher - targets buildings only',
    rarity: 'rare',
    color: '#b45309',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'buildings', // Only attacks buildings
    count: 1
  },

  // ==================== EPIC TROOPS ====================
  // Higher cost, powerful unique abilities
  
  {
    id: 'prince',
    name: 'Prince',
    type: 'mini-tank',
    elixirCost: 5,
    emoji: '🏇',
    health: 1920,
    damage: 392,
    attackSpeed: 0.71, // 1.4s hit speed
    moveSpeed: 75, // Fast (can charge faster)
    range: 35,
    hitSpeed: 1.4,
    description: 'Charges into battle for double damage',
    rarity: 'epic',
    color: '#3b82f6',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'ground',
    count: 1
  },
  {
    id: 'witch',
    name: 'Witch',
    type: 'troop',
    elixirCost: 5,
    emoji: '🧙‍♀️',
    health: 880,
    damage: 138,
    attackSpeed: 0.71, // 1.4s hit speed
    moveSpeed: 60, // Medium
    range: 130,
    hitSpeed: 1.4,
    description: 'Summons skeletons to fight - splash damage',
    rarity: 'epic',
    color: '#a855f7',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'both', // Can hit air
    splashRadius: 35,
    count: 1
  },
  {
    id: 'mini-pekka',
    name: 'Mini P.E.K.K.A',
    type: 'mini-tank',
    elixirCost: 4,
    emoji: '🤖',
    health: 1129,
    damage: 598,
    attackSpeed: 0.56, // 1.8s hit speed - slow but devastating
    moveSpeed: 70, // Fast
    range: 30,
    hitSpeed: 1.8,
    description: 'Pancakes! Devastating single-target damage',
    rarity: 'epic',
    color: '#6366f1',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'ground',
    count: 1
  },
  {
    id: 'balloon',
    name: 'Balloon',
    type: 'troop',
    elixirCost: 5,
    emoji: '🎈',
    health: 1680,
    damage: 798,
    attackSpeed: 0.33, // 3.0s hit speed - very slow
    moveSpeed: 50, // Slow flying
    range: 35,
    hitSpeed: 3.0,
    description: 'Death from above - targets buildings only',
    rarity: 'epic',
    color: '#ef4444',
    deployCooldown: 1.0,
    isFlying: true, // AIR UNIT
    targetType: 'buildings', // Only attacks buildings
    count: 1
  },

  // ==================== LEGENDARY TROOPS ====================
  // Premium cards with unique mechanics
  
  {
    id: 'pekka',
    name: 'P.E.K.K.A',
    type: 'tank',
    elixirCost: 7,
    emoji: '🦾',
    health: 3760,
    damage: 816,
    attackSpeed: 0.56, // 1.8s hit speed
    moveSpeed: 45, // Slow
    range: 35,
    hitSpeed: 1.8,
    description: 'The ultimate war machine - massive damage',
    rarity: 'legendary',
    color: '#1e40af',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'ground',
    count: 1
  },
  {
    id: 'mega-knight',
    name: 'Mega Knight',
    type: 'tank',
    elixirCost: 7,
    emoji: '👹',
    health: 3300,
    damage: 267,
    attackSpeed: 0.59, // 1.7s hit speed
    moveSpeed: 60, // Medium
    range: 40,
    hitSpeed: 1.7,
    description: 'Jumps and smashes with splash damage',
    rarity: 'legendary',
    color: '#0f172a',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'ground',
    splashRadius: 70, // Big splash area
    count: 1
  },
  {
    id: 'electro-wizard',
    name: 'Electro Wizard',
    type: 'troop',
    elixirCost: 4,
    emoji: '⚡',
    health: 649,
    damage: 110, // Per zap (hits 2 targets)
    attackSpeed: 0.56, // 1.8s hit speed
    moveSpeed: 60, // Medium
    range: 130,
    hitSpeed: 1.8,
    description: 'Zaps 2 enemies at once - stuns on hit',
    rarity: 'legendary',
    color: '#0ea5e9',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'both', // Can hit air
    count: 1
  },
  {
    id: 'princess',
    name: 'Princess',
    type: 'troop',
    elixirCost: 3,
    emoji: '👸',
    health: 280,
    damage: 186,
    attackSpeed: 0.33, // 3.0s hit speed - very slow
    moveSpeed: 60, // Medium
    range: 250, // Incredible range - outranges towers
    hitSpeed: 3.0,
    description: 'Incredible range - outranges everything',
    rarity: 'legendary',
    color: '#f472b6',
    deployCooldown: 1.0,
    isFlying: false,
    targetType: 'both',
    splashRadius: 40, // Small area damage
    count: 1
  },

  // ==================== SPELLS ====================
  // Instant and duration-based effects
  
  {
    id: 'fireball',
    name: 'Fireball',
    type: 'spell',
    elixirCost: 4,
    emoji: '🔥',
    health: 0,
    damage: 572,
    attackSpeed: 0,
    moveSpeed: 0,
    range: 0,
    description: 'High area damage spell',
    rarity: 'rare',
    color: '#ef4444',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'both',
    spellRadius: 80,
    spellEffects: [{ type: 'damage', value: 572 }]
  },
  {
    id: 'arrows',
    name: 'Arrows',
    type: 'spell',
    elixirCost: 3,
    emoji: '🏹',
    health: 0,
    damage: 303,
    attackSpeed: 0,
    moveSpeed: 0,
    range: 0,
    description: 'Swarm killer - wide area',
    rarity: 'common',
    color: '#a855f7',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'both',
    spellRadius: 120,
    spellEffects: [{ type: 'damage', value: 303 }]
  },
  {
    id: 'zap',
    name: 'Zap',
    type: 'spell',
    elixirCost: 2,
    emoji: '⚡',
    health: 0,
    damage: 192,
    attackSpeed: 0,
    moveSpeed: 0,
    range: 0,
    description: 'Instant damage + stun',
    rarity: 'common',
    color: '#fbbf24',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'both',
    spellRadius: 70,
    spellEffects: [
      { type: 'damage', value: 192 },
      { type: 'stun', value: 0.5, duration: 0.5 }
    ]
  },
  {
    id: 'freeze',
    name: 'Freeze',
    type: 'spell',
    elixirCost: 4,
    emoji: '❄️',
    health: 0,
    damage: 95,
    attackSpeed: 0,
    moveSpeed: 0,
    range: 0,
    description: 'Freezes enemies in place',
    rarity: 'epic',
    color: '#06b6d4',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'both',
    spellRadius: 90,
    spellDuration: 4.0,
    spellEffects: [
      { type: 'damage', value: 95 },
      { type: 'freeze', value: 1, duration: 4.0 }
    ]
  },
  {
    id: 'poison',
    name: 'Poison',
    type: 'spell',
    elixirCost: 4,
    emoji: '☠️',
    health: 0,
    damage: 90, // Per second
    attackSpeed: 0,
    moveSpeed: 0,
    range: 0,
    description: 'Damage over time + slow',
    rarity: 'epic',
    color: '#22c55e',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'both',
    spellRadius: 100,
    spellDuration: 8.0,
    spellEffects: [
      { type: 'damage', value: 90 },
      { type: 'slow', value: 0.35, duration: 8.0 }
    ]
  },
  {
    id: 'log',
    name: 'The Log',
    type: 'spell',
    elixirCost: 2,
    emoji: '🪵',
    health: 0,
    damage: 240,
    attackSpeed: 0,
    moveSpeed: 0,
    range: 0,
    description: 'Rolling log with knockback',
    rarity: 'legendary',
    color: '#78350f',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'ground', // Can't hit air!
    spellRadius: 60,
    spellEffects: [
      { type: 'damage', value: 240 },
      { type: 'knockback', value: 50 }
    ]
  },
  {
    id: 'rage',
    name: 'Rage',
    type: 'spell',
    elixirCost: 2,
    emoji: '😤',
    health: 0,
    damage: 0,
    attackSpeed: 0,
    moveSpeed: 0,
    range: 0,
    description: 'Boosts movement and attack speed',
    rarity: 'epic',
    color: '#dc2626',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'both',
    spellRadius: 100,
    spellDuration: 6.0,
    spellEffects: [
      { type: 'slow', value: -0.35, duration: 6.0 } // Negative slow = speed boost
    ]
  },

  // ==================== BUILDINGS ====================
  // Defensive and spawner structures
  
  {
    id: 'cannon',
    name: 'Cannon',
    type: 'building',
    elixirCost: 3,
    emoji: '🔫',
    health: 742,
    damage: 127,
    attackSpeed: 0.91, // 1.1s hit speed
    moveSpeed: 0,
    range: 130,
    hitSpeed: 1.1,
    description: 'Ground targeting defense',
    rarity: 'common',
    color: '#6b7280',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'ground',
    buildingLifetime: 30
  },
  {
    id: 'tesla',
    name: 'Tesla',
    type: 'building',
    elixirCost: 4,
    emoji: '⚡',
    health: 954,
    damage: 150,
    attackSpeed: 0.77, // 1.3s hit speed
    moveSpeed: 0,
    range: 110,
    hitSpeed: 1.3,
    description: 'Hits air and ground',
    rarity: 'common',
    color: '#0ea5e9',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'both',
    buildingLifetime: 35
  },
  {
    id: 'inferno-tower',
    name: 'Inferno Tower',
    type: 'building',
    elixirCost: 5,
    emoji: '🔥',
    health: 1408,
    damage: 50, // Ramps up over time
    attackSpeed: 2.5, // Continuous beam
    moveSpeed: 0,
    range: 100,
    description: 'Melts tanks with ramping damage',
    rarity: 'rare',
    color: '#f97316',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'both',
    buildingLifetime: 40
  },
  {
    id: 'bomb-tower',
    name: 'Bomb Tower',
    type: 'building',
    elixirCost: 4,
    emoji: '💣',
    health: 1126,
    damage: 184,
    attackSpeed: 0.56, // 1.8s hit speed
    moveSpeed: 0,
    range: 100,
    hitSpeed: 1.8,
    description: 'Splash damage to ground',
    rarity: 'rare',
    color: '#374151',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'ground',
    buildingLifetime: 35,
    splashRadius: 45
  },
  {
    id: 'goblin-hut',
    name: 'Goblin Hut',
    type: 'building',
    elixirCost: 5,
    emoji: '🏠',
    health: 925,
    damage: 0,
    attackSpeed: 0,
    moveSpeed: 0,
    range: 0,
    description: 'Spawns Spear Goblins',
    rarity: 'rare',
    color: '#16a34a',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'both',
    buildingLifetime: 60,
    spawnInterval: 5.0,
    spawnCardId: 'goblins',
    spawnCount: 1
  },
  {
    id: 'tombstone',
    name: 'Tombstone',
    type: 'building',
    elixirCost: 3,
    emoji: '🪦',
    health: 511,
    damage: 0,
    attackSpeed: 0,
    moveSpeed: 0,
    range: 0,
    description: 'Spawns Skeletons',
    rarity: 'rare',
    color: '#6b7280',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'both',
    buildingLifetime: 40,
    spawnInterval: 3.5,
    spawnCardId: 'skeletons',
    spawnCount: 1
  },
  {
    id: 'furnace',
    name: 'Furnace',
    type: 'building',
    elixirCost: 4,
    emoji: '🔥',
    health: 960,
    damage: 0,
    attackSpeed: 0,
    moveSpeed: 0,
    range: 0,
    description: 'Spawns Fire Spirits',
    rarity: 'rare',
    color: '#ea580c',
    deployCooldown: 0,
    isFlying: false,
    targetType: 'both',
    buildingLifetime: 50,
    spawnInterval: 10.0,
    spawnCardId: 'bomber', // Using bomber as fire spirit substitute
    spawnCount: 1
  },
  {
    id: 'x-bow',
    name: 'X-Bow',
    type: 'building',
    elixirCost: 6,
    emoji: '🎯',
    health: 1500,
    damage: 26,
    attackSpeed: 4.0, // Very fast
    moveSpeed: 0,
    range: 280, // Can reach towers!
    description: 'Long range siege weapon',
    rarity: 'epic',
    color: '#7c3aed',
    deployCooldown: 3.5, // Long deploy time
    isFlying: false,
    targetType: 'ground',
    buildingLifetime: 40
  }
];

// Starting cards for new players - balanced starter deck
export const starterCardIds = ['knight', 'archers', 'goblins', 'skeletons', 'bomber', 'minions', 'giant', 'wizard'];

// Fisher-Yates shuffle for randomizing deck order at battle start
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createDeck(cardIds: string[], shuffle = true): CardDefinition[] {
  const cards = cardIds.map(id => allCards.find(c => c.id === id)!).filter(Boolean);
  return shuffle ? shuffleArray(cards) : cards;
}

export function drawHand(deck: CardDefinition[]): { hand: CardDefinition[], remainingDeck: CardDefinition[] } {
  const hand = deck.slice(0, 4);
  const remainingDeck = deck.slice(4);
  return { hand, remainingDeck };
}

export function getCardById(id: string): CardDefinition | undefined {
  return allCards.find(c => c.id === id);
}
