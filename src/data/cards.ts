import { CardDefinition } from '@/types/game';

export const allCards: CardDefinition[] = [
  // Common troops - starter cards
  {
    id: 'squire',
    name: 'Squire',
    type: 'mini-tank',
    elixirCost: 3,
    emoji: '⚔️',
    health: 150,
    damage: 15,
    attackSpeed: 1.2,
    moveSpeed: 0.8, // Slowed
    range: 30,
    description: 'A sturdy melee fighter',
    rarity: 'common',
    color: '#d97706'
  },
  {
    id: 'bowman',
    name: 'Bowman',
    type: 'troop',
    elixirCost: 3,
    emoji: '🏹',
    health: 80,
    damage: 12,
    attackSpeed: 1.0,
    moveSpeed: 0.9,
    range: 120,
    description: 'Ranged attacker',
    rarity: 'common',
    color: '#16a34a'
  },
  {
    id: 'imp',
    name: 'Imp',
    type: 'troop',
    elixirCost: 2,
    emoji: '👺',
    health: 50,
    damage: 10,
    attackSpeed: 1.5,
    moveSpeed: 1.1,
    range: 25,
    description: 'Fast and cheap',
    rarity: 'common',
    color: '#dc2626'
  },
  {
    id: 'bones',
    name: 'Bones',
    type: 'troop',
    elixirCost: 1,
    emoji: '💀',
    health: 30,
    damage: 8,
    attackSpeed: 1.8,
    moveSpeed: 1.0,
    range: 25,
    description: 'Cheap swarm unit',
    rarity: 'common',
    color: '#a1a1aa'
  },
  {
    id: 'bomber',
    name: 'Blaster',
    type: 'troop',
    elixirCost: 2,
    emoji: '💣',
    health: 60,
    damage: 14,
    attackSpeed: 1.2,
    moveSpeed: 0.8,
    range: 90,
    description: 'Throws explosives',
    rarity: 'common',
    color: '#f97316'
  },
  // Rare troops
  {
    id: 'golem',
    name: 'Stone Golem',
    type: 'tank',
    elixirCost: 5,
    emoji: '🗿',
    health: 350,
    damage: 20,
    attackSpeed: 0.7,
    moveSpeed: 0.5,
    range: 25,
    description: 'Slow but incredibly tanky',
    rarity: 'rare',
    color: '#78716c'
  },
  {
    id: 'mage',
    name: 'Fire Mage',
    type: 'troop',
    elixirCost: 5,
    emoji: '🔥',
    health: 90,
    damage: 28,
    attackSpeed: 0.8,
    moveSpeed: 0.7,
    range: 100,
    description: 'Powerful ranged magic',
    rarity: 'rare',
    color: '#ea580c'
  },
  {
    id: 'berserker',
    name: 'Berserker',
    type: 'mini-tank',
    elixirCost: 4,
    emoji: '🪓',
    health: 180,
    damage: 18,
    attackSpeed: 1.0,
    moveSpeed: 0.7,
    range: 30,
    description: 'Tough melee fighter',
    rarity: 'rare',
    color: '#b91c1c'
  },
  {
    id: 'sniper',
    name: 'Sharpshooter',
    type: 'troop',
    elixirCost: 4,
    emoji: '🎯',
    health: 100,
    damage: 22,
    attackSpeed: 0.9,
    moveSpeed: 0.75,
    range: 140,
    description: 'Long range shooter',
    rarity: 'rare',
    color: '#0891b2'
  },
  {
    id: 'drake',
    name: 'Fire Drake',
    type: 'troop',
    elixirCost: 4,
    emoji: '🐉',
    health: 120,
    damage: 16,
    attackSpeed: 1.1,
    moveSpeed: 0.85,
    range: 80,
    description: 'Flying fire breather',
    rarity: 'rare',
    color: '#7c3aed'
  },
  // Epic troops
  {
    id: 'automaton',
    name: 'War Machine',
    type: 'mini-tank',
    elixirCost: 4,
    emoji: '🤖',
    health: 130,
    damage: 32,
    attackSpeed: 0.9,
    moveSpeed: 0.8,
    range: 28,
    description: 'High damage dealer',
    rarity: 'epic',
    color: '#6366f1'
  },
  {
    id: 'champion',
    name: 'Champion',
    type: 'mini-tank',
    elixirCost: 5,
    emoji: '🏇',
    health: 170,
    damage: 30,
    attackSpeed: 1.0,
    moveSpeed: 0.9,
    range: 30,
    description: 'Charges into battle',
    rarity: 'epic',
    color: '#eab308'
  },
  {
    id: 'frost-mage',
    name: 'Frost Mage',
    type: 'troop',
    elixirCost: 5,
    emoji: '❄️',
    health: 85,
    damage: 24,
    attackSpeed: 0.9,
    moveSpeed: 0.7,
    range: 110,
    description: 'Freezing magical attacks',
    rarity: 'epic',
    color: '#06b6d4'
  },
  {
    id: 'shadow',
    name: 'Shadow Assassin',
    type: 'troop',
    elixirCost: 3,
    emoji: '🗡️',
    health: 70,
    damage: 35,
    attackSpeed: 1.3,
    moveSpeed: 1.2,
    range: 25,
    description: 'Fast and deadly',
    rarity: 'epic',
    color: '#1e1b4b'
  },
  // Legendary troops
  {
    id: 'titan',
    name: 'Titan',
    type: 'tank',
    elixirCost: 7,
    emoji: '👹',
    health: 500,
    damage: 40,
    attackSpeed: 0.6,
    moveSpeed: 0.4,
    range: 30,
    description: 'Unstoppable force',
    rarity: 'legendary',
    color: '#be123c'
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    type: 'troop',
    elixirCost: 6,
    emoji: '🦅',
    health: 150,
    damage: 28,
    attackSpeed: 1.0,
    moveSpeed: 0.95,
    range: 90,
    description: 'Rises from ashes',
    rarity: 'legendary',
    color: '#f59e0b'
  }
];

// Starting cards for new players
export const starterCardIds = ['squire', 'bowman', 'imp', 'bones', 'bomber', 'golem', 'mage', 'berserker'];

export function createDeck(cardIds: string[]): CardDefinition[] {
  return cardIds.map(id => allCards.find(c => c.id === id)!).filter(Boolean);
}

export function drawHand(deck: CardDefinition[]): { hand: CardDefinition[], remainingDeck: CardDefinition[] } {
  const hand = deck.slice(0, 4);
  const remainingDeck = [...deck.slice(4), ...deck.slice(0, 4)];
  return { hand, remainingDeck };
}

export function getCardById(id: string): CardDefinition | undefined {
  return allCards.find(c => c.id === id);
}
