import { CardDefinition } from '@/types/game';

export const allCards: CardDefinition[] = [
  // Common troops - starter cards (actual Clash Royale names)
  {
    id: 'knight',
    name: 'Knight',
    type: 'mini-tank',
    elixirCost: 3,
    emoji: '⚔️',
    health: 180,
    damage: 18,
    attackSpeed: 1.1,
    moveSpeed: 0.5,
    range: 30,
    description: 'A sturdy melee fighter with a big sword',
    rarity: 'common',
    color: '#d97706',
    deployCooldown: 1.0
  },
  {
    id: 'archers',
    name: 'Archers',
    type: 'troop',
    elixirCost: 3,
    emoji: '🏹',
    health: 85,
    damage: 14,
    attackSpeed: 1.0,
    moveSpeed: 0.55,
    range: 120,
    description: 'A pair of sharpshooters',
    rarity: 'common',
    color: '#ec4899',
    deployCooldown: 1.0
  },
  {
    id: 'goblins',
    name: 'Goblins',
    type: 'troop',
    elixirCost: 2,
    emoji: '👺',
    health: 55,
    damage: 12,
    attackSpeed: 1.4,
    moveSpeed: 0.7,
    range: 25,
    description: 'Fast and cheap swarm',
    rarity: 'common',
    color: '#22c55e',
    deployCooldown: 1.0
  },
  {
    id: 'skeletons',
    name: 'Skeletons',
    type: 'troop',
    elixirCost: 1,
    emoji: '💀',
    health: 32,
    damage: 10,
    attackSpeed: 1.6,
    moveSpeed: 0.65,
    range: 25,
    description: 'Three spooky scary skeletons',
    rarity: 'common',
    color: '#a1a1aa',
    deployCooldown: 1.0
  },
  {
    id: 'bomber',
    name: 'Bomber',
    type: 'troop',
    elixirCost: 2,
    emoji: '💣',
    health: 65,
    damage: 16,
    attackSpeed: 1.1,
    moveSpeed: 0.5,
    range: 90,
    description: 'Throws explosive bombs',
    rarity: 'common',
    color: '#f97316',
    deployCooldown: 1.0
  },
  {
    id: 'minions',
    name: 'Minions',
    type: 'troop',
    elixirCost: 3,
    emoji: '🦇',
    health: 50,
    damage: 11,
    attackSpeed: 1.3,
    moveSpeed: 0.7,
    range: 35,
    description: 'Flying blue creatures',
    rarity: 'common',
    color: '#3b82f6',
    deployCooldown: 1.0
  },
  // Rare troops
  {
    id: 'giant',
    name: 'Giant',
    type: 'tank',
    elixirCost: 5,
    emoji: '🗿',
    health: 380,
    damage: 22,
    attackSpeed: 0.6,
    moveSpeed: 0.35,
    range: 25,
    description: 'Slow but incredibly tanky',
    rarity: 'rare',
    color: '#78716c',
    deployCooldown: 1.0
  },
  {
    id: 'wizard',
    name: 'Wizard',
    type: 'troop',
    elixirCost: 5,
    emoji: '🔥',
    health: 95,
    damage: 30,
    attackSpeed: 0.75,
    moveSpeed: 0.5,
    range: 100,
    description: 'Powerful fireball magic',
    rarity: 'rare',
    color: '#ea580c',
    deployCooldown: 1.0
  },
  {
    id: 'valkyrie',
    name: 'Valkyrie',
    type: 'mini-tank',
    elixirCost: 4,
    emoji: '🪓',
    health: 200,
    damage: 20,
    attackSpeed: 0.9,
    moveSpeed: 0.5,
    range: 35,
    description: 'Spins and hits everything around',
    rarity: 'rare',
    color: '#f472b6',
    deployCooldown: 1.0
  },
  {
    id: 'musketeer',
    name: 'Musketeer',
    type: 'troop',
    elixirCost: 4,
    emoji: '🎯',
    health: 110,
    damage: 24,
    attackSpeed: 0.85,
    moveSpeed: 0.5,
    range: 140,
    description: 'Long range shooter',
    rarity: 'rare',
    color: '#0891b2',
    deployCooldown: 1.0
  },
  {
    id: 'baby-dragon',
    name: 'Baby Dragon',
    type: 'troop',
    elixirCost: 4,
    emoji: '🐉',
    health: 130,
    damage: 18,
    attackSpeed: 1.0,
    moveSpeed: 0.55,
    range: 80,
    description: 'Flying fire breather',
    rarity: 'rare',
    color: '#7c3aed',
    deployCooldown: 1.0
  },
  {
    id: 'hog-rider',
    name: 'Hog Rider',
    type: 'troop',
    elixirCost: 4,
    emoji: '🐗',
    health: 150,
    damage: 22,
    attackSpeed: 1.0,
    moveSpeed: 0.75,
    range: 30,
    description: 'Fast tower rusher',
    rarity: 'rare',
    color: '#b45309',
    deployCooldown: 1.0
  },
  // Epic troops
  {
    id: 'prince',
    name: 'Prince',
    type: 'mini-tank',
    elixirCost: 5,
    emoji: '🏇',
    health: 190,
    damage: 35,
    attackSpeed: 0.9,
    moveSpeed: 0.6,
    range: 30,
    description: 'Charges into battle',
    rarity: 'epic',
    color: '#3b82f6',
    deployCooldown: 1.0
  },
  {
    id: 'witch',
    name: 'Witch',
    type: 'troop',
    elixirCost: 5,
    emoji: '🧙‍♀️',
    health: 90,
    damage: 26,
    attackSpeed: 0.85,
    moveSpeed: 0.45,
    range: 110,
    description: 'Summons skeletons to fight',
    rarity: 'epic',
    color: '#a855f7',
    deployCooldown: 1.0
  },
  {
    id: 'mini-pekka',
    name: 'Mini P.E.K.K.A',
    type: 'mini-tank',
    elixirCost: 4,
    emoji: '🤖',
    health: 140,
    damage: 38,
    attackSpeed: 0.8,
    moveSpeed: 0.55,
    range: 28,
    description: 'Pancakes! High damage dealer',
    rarity: 'epic',
    color: '#6366f1',
    deployCooldown: 1.0
  },
  {
    id: 'balloon',
    name: 'Balloon',
    type: 'troop',
    elixirCost: 5,
    emoji: '🎈',
    health: 160,
    damage: 45,
    attackSpeed: 0.6,
    moveSpeed: 0.4,
    range: 25,
    description: 'Death from above',
    rarity: 'epic',
    color: '#ef4444',
    deployCooldown: 1.0
  },
  // Legendary troops
  {
    id: 'pekka',
    name: 'P.E.K.K.A',
    type: 'tank',
    elixirCost: 7,
    emoji: '🦾',
    health: 520,
    damage: 50,
    attackSpeed: 0.55,
    moveSpeed: 0.3,
    range: 30,
    description: 'The ultimate war machine',
    rarity: 'legendary',
    color: '#1e40af',
    deployCooldown: 1.0
  },
  {
    id: 'mega-knight',
    name: 'Mega Knight',
    type: 'tank',
    elixirCost: 7,
    emoji: '👹',
    health: 480,
    damage: 42,
    attackSpeed: 0.6,
    moveSpeed: 0.35,
    range: 32,
    description: 'Jumps and smashes everything',
    rarity: 'legendary',
    color: '#0f172a',
    deployCooldown: 1.0
  },
  {
    id: 'electro-wizard',
    name: 'Electro Wizard',
    type: 'troop',
    elixirCost: 4,
    emoji: '⚡',
    health: 100,
    damage: 20,
    attackSpeed: 1.2,
    moveSpeed: 0.55,
    range: 100,
    description: 'Zaps enemies with lightning',
    rarity: 'legendary',
    color: '#0ea5e9',
    deployCooldown: 1.0
  },
  {
    id: 'princess',
    name: 'Princess',
    type: 'troop',
    elixirCost: 3,
    emoji: '👸',
    health: 60,
    damage: 16,
    attackSpeed: 1.0,
    moveSpeed: 0.5,
    range: 160,
    description: 'Incredible range archer',
    rarity: 'legendary',
    color: '#f472b6',
    deployCooldown: 1.0
  }
];

// Starting cards for new players
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
  // Shuffle the deck at battle start for random initial order
  return shuffle ? shuffleArray(cards) : cards;
}

export function drawHand(deck: CardDefinition[]): { hand: CardDefinition[], remainingDeck: CardDefinition[] } {
  // Hand is first 4 cards, remaining deck is cards 5-8 (cards not in hand yet)
  // When a card is played, it goes to the BACK of the queue (handled in playCard)
  const hand = deck.slice(0, 4);
  const remainingDeck = deck.slice(4); // Only cards NOT in hand - cycling handled by playCard
  return { hand, remainingDeck };
}

export function getCardById(id: string): CardDefinition | undefined {
  return allCards.find(c => c.id === id);
}
