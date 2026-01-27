import { CardDefinition } from '@/types/game';

export const allCards: CardDefinition[] = [
  {
    id: 'knight',
    name: 'Knight',
    type: 'mini-tank',
    elixirCost: 3,
    emoji: '⚔️',
    health: 150,
    damage: 15,
    attackSpeed: 1.2,
    moveSpeed: 1.5,
    range: 30,
    description: 'A sturdy melee fighter'
  },
  {
    id: 'archer',
    name: 'Archer',
    type: 'troop',
    elixirCost: 3,
    emoji: '🏹',
    health: 80,
    damage: 12,
    attackSpeed: 1.0,
    moveSpeed: 1.8,
    range: 120,
    description: 'Ranged attacker'
  },
  {
    id: 'giant',
    name: 'Giant',
    type: 'tank',
    elixirCost: 5,
    emoji: '🦍',
    health: 300,
    damage: 20,
    attackSpeed: 0.8,
    moveSpeed: 1.0,
    range: 25,
    description: 'Slow but tanky'
  },
  {
    id: 'goblin',
    name: 'Goblin',
    type: 'troop',
    elixirCost: 2,
    emoji: '👺',
    health: 50,
    damage: 10,
    attackSpeed: 1.5,
    moveSpeed: 2.2,
    range: 25,
    description: 'Fast and cheap'
  },
  {
    id: 'wizard',
    name: 'Wizard',
    type: 'troop',
    elixirCost: 5,
    emoji: '🧙',
    health: 90,
    damage: 25,
    attackSpeed: 0.8,
    moveSpeed: 1.4,
    range: 100,
    description: 'Powerful ranged magic'
  },
  {
    id: 'mini-pekka',
    name: 'Mini P.E.K.K.A',
    type: 'mini-tank',
    elixirCost: 4,
    emoji: '🤖',
    health: 120,
    damage: 30,
    attackSpeed: 0.9,
    moveSpeed: 1.6,
    range: 28,
    description: 'High damage dealer'
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    type: 'troop',
    elixirCost: 1,
    emoji: '💀',
    health: 30,
    damage: 8,
    attackSpeed: 1.8,
    moveSpeed: 2.0,
    range: 25,
    description: 'Cheap swarm unit'
  },
  {
    id: 'valkyrie',
    name: 'Valkyrie',
    type: 'mini-tank',
    elixirCost: 4,
    emoji: '🪓',
    health: 180,
    damage: 18,
    attackSpeed: 1.0,
    moveSpeed: 1.4,
    range: 30,
    description: 'Tough melee fighter'
  },
  {
    id: 'musketeer',
    name: 'Musketeer',
    type: 'troop',
    elixirCost: 4,
    emoji: '🔫',
    health: 100,
    damage: 20,
    attackSpeed: 0.9,
    moveSpeed: 1.5,
    range: 130,
    description: 'Long range shooter'
  },
  {
    id: 'baby-dragon',
    name: 'Baby Dragon',
    type: 'troop',
    elixirCost: 4,
    emoji: '🐉',
    health: 110,
    damage: 16,
    attackSpeed: 1.1,
    moveSpeed: 1.7,
    range: 80,
    description: 'Flying unit'
  },
  {
    id: 'prince',
    name: 'Prince',
    type: 'mini-tank',
    elixirCost: 5,
    emoji: '🏇',
    health: 160,
    damage: 28,
    attackSpeed: 1.0,
    moveSpeed: 1.8,
    range: 30,
    description: 'Charges into battle'
  },
  {
    id: 'bomber',
    name: 'Bomber',
    type: 'troop',
    elixirCost: 2,
    emoji: '💣',
    health: 60,
    damage: 14,
    attackSpeed: 1.2,
    moveSpeed: 1.6,
    range: 90,
    description: 'Throws explosives'
  }
];

export function createDeck(): CardDefinition[] {
  // Shuffle and pick 8 random cards
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 8);
}

export function drawHand(deck: CardDefinition[]): { hand: CardDefinition[], remainingDeck: CardDefinition[] } {
  const hand = deck.slice(0, 4);
  const remainingDeck = [...deck.slice(4), ...deck.slice(0, 4)]; // Cycle back
  return { hand, remainingDeck };
}
