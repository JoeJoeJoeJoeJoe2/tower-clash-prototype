// Evolution data for all cards that have evolutions in Clash Royale
// 6 evolution shards unlock an evolution for any card

export interface Evolution {
  cardId: string;
  name: string;
  emoji: string;
  description: string;
  // Evolution bonuses (applied as multipliers or flat bonuses)
  healthBonus: number; // Percentage increase (e.g., 0.15 = +15%)
  damageBonus: number;
  specialEffect?: string; // Description of special ability
}

// All Clash Royale evolutions except Mega Knight
export const evolutions: Evolution[] = [
  // Common evolutions
  {
    cardId: 'knight',
    name: 'Evolved Knight',
    emoji: '⚔️✨',
    description: 'Gains a shield that blocks one hit',
    healthBonus: 0.10,
    damageBonus: 0.10,
    specialEffect: 'Shield blocks first hit'
  },
  {
    cardId: 'archers',
    name: 'Evolved Archers',
    emoji: '🏹✨',
    description: 'Faster fire rate and split on death',
    healthBonus: 0.10,
    damageBonus: 0.15,
    specialEffect: 'Faster attack speed'
  },
  {
    cardId: 'goblins',
    name: 'Evolved Goblins',
    emoji: '👺✨',
    description: 'Spawns an extra goblin with more HP',
    healthBonus: 0.15,
    damageBonus: 0.10,
    specialEffect: '+1 goblin spawned'
  },
  {
    cardId: 'skeletons',
    name: 'Evolved Skeletons',
    emoji: '💀✨',
    description: 'More skeletons and they deal more damage',
    healthBonus: 0.10,
    damageBonus: 0.20,
    specialEffect: '+1 skeleton spawned'
  },
  {
    cardId: 'bomber',
    name: 'Evolved Bomber',
    emoji: '💣✨',
    description: 'Bombs have larger splash radius',
    healthBonus: 0.15,
    damageBonus: 0.15,
    specialEffect: 'Larger splash radius'
  },
  {
    cardId: 'minions',
    name: 'Evolved Minions',
    emoji: '🦇✨',
    description: 'Faster and more durable',
    healthBonus: 0.20,
    damageBonus: 0.10,
    specialEffect: 'Increased speed'
  },
  
  // Rare evolutions
  {
    cardId: 'giant',
    name: 'Evolved Giant',
    emoji: '🗿✨',
    description: 'Regenerates health over time',
    healthBonus: 0.15,
    damageBonus: 0.10,
    specialEffect: 'Slowly regenerates HP'
  },
  {
    cardId: 'wizard',
    name: 'Evolved Wizard',
    emoji: '🔥✨',
    description: 'Fireballs leave burning ground',
    healthBonus: 0.10,
    damageBonus: 0.15,
    specialEffect: 'Leaves fire trail'
  },
  {
    cardId: 'valkyrie',
    name: 'Evolved Valkyrie',
    emoji: '🪓✨',
    description: 'Spin attack hits faster',
    healthBonus: 0.15,
    damageBonus: 0.15,
    specialEffect: 'Faster spin attacks'
  },
  {
    cardId: 'musketeer',
    name: 'Evolved Musketeer',
    emoji: '🎯✨',
    description: 'Bullets pierce through enemies',
    healthBonus: 0.10,
    damageBonus: 0.20,
    specialEffect: 'Piercing shots'
  },
  {
    cardId: 'baby-dragon',
    name: 'Evolved Baby Dragon',
    emoji: '🐉✨',
    description: 'Fire breath deals more splash damage',
    healthBonus: 0.15,
    damageBonus: 0.15,
    specialEffect: 'Enhanced splash'
  },
  {
    cardId: 'hog-rider',
    name: 'Evolved Hog Rider',
    emoji: '🐗✨',
    description: 'Jumps over the river, faster charge',
    healthBonus: 0.15,
    damageBonus: 0.15,
    specialEffect: 'Jump ability'
  },
  
  // Epic evolutions
  {
    cardId: 'prince',
    name: 'Evolved Prince',
    emoji: '🏇✨',
    description: 'Charge deals even more damage',
    healthBonus: 0.15,
    damageBonus: 0.20,
    specialEffect: 'Enhanced charge damage'
  },
  {
    cardId: 'witch',
    name: 'Evolved Witch',
    emoji: '🧙‍♀️✨',
    description: 'Spawns more powerful skeletons',
    healthBonus: 0.15,
    damageBonus: 0.15,
    specialEffect: 'Stronger spawned units'
  },
  {
    cardId: 'mini-pekka',
    name: 'Evolved Mini P.E.K.K.A',
    emoji: '🤖✨',
    description: 'Even deadlier attacks with rage effect',
    healthBonus: 0.15,
    damageBonus: 0.25,
    specialEffect: 'Rage when damaged'
  },
  {
    cardId: 'balloon',
    name: 'Evolved Balloon',
    emoji: '🎈✨',
    description: 'Death bomb is even more powerful',
    healthBonus: 0.20,
    damageBonus: 0.20,
    specialEffect: 'Larger death bomb'
  },
  
  // Legendary evolutions
  {
    cardId: 'pekka',
    name: 'Evolved P.E.K.K.A',
    emoji: '🦾✨',
    description: 'Ultimate destruction machine',
    healthBonus: 0.20,
    damageBonus: 0.20,
    specialEffect: 'Armor piercing attacks'
  },
  {
    cardId: 'electro-wizard',
    name: 'Evolved Electro Wizard',
    emoji: '⚡✨',
    description: 'Chain lightning between enemies',
    healthBonus: 0.15,
    damageBonus: 0.20,
    specialEffect: 'Chain lightning'
  },
  {
    cardId: 'princess',
    name: 'Evolved Princess',
    emoji: '👸✨',
    description: 'Arrows split on impact',
    healthBonus: 0.15,
    damageBonus: 0.20,
    specialEffect: 'Splitting arrows'
  },
  
  // Spell evolutions (apply to the spell effect)
  {
    cardId: 'fireball',
    name: 'Evolved Fireball',
    emoji: '☄️✨',
    description: 'Leaves burning ground after impact',
    healthBonus: 0,
    damageBonus: 0.25,
    specialEffect: 'Fire ground effect'
  },
  {
    cardId: 'arrows',
    name: 'Evolved Arrows',
    emoji: '🎯✨',
    description: 'Three waves of arrows',
    healthBonus: 0,
    damageBonus: 0.20,
    specialEffect: 'Triple wave'
  },
  {
    cardId: 'freeze',
    name: 'Evolved Freeze',
    emoji: '❄️✨',
    description: 'Longer freeze duration and slows after',
    healthBonus: 0,
    damageBonus: 0.15,
    specialEffect: 'Extended freeze'
  },
  {
    cardId: 'zap',
    name: 'Evolved Zap',
    emoji: '⚡✨',
    description: 'Larger radius and resets charges',
    healthBonus: 0,
    damageBonus: 0.20,
    specialEffect: 'Reset effect'
  },
  {
    cardId: 'poison',
    name: 'Evolved Poison',
    emoji: '☠️✨',
    description: 'Slows enemies caught in the poison',
    healthBonus: 0,
    damageBonus: 0.20,
    specialEffect: 'Slow effect'
  },
  
  // Building evolutions
  {
    cardId: 'cannon',
    name: 'Evolved Cannon',
    emoji: '🔫✨',
    description: 'Faster fire rate and longer lifetime',
    healthBonus: 0.20,
    damageBonus: 0.15,
    specialEffect: 'Extended lifetime'
  },
  {
    cardId: 'tesla',
    name: 'Evolved Tesla',
    emoji: '⚡✨',
    description: 'Chain lightning to nearby enemies',
    healthBonus: 0.15,
    damageBonus: 0.20,
    specialEffect: 'Chain attacks'
  },
  {
    cardId: 'tombstone',
    name: 'Evolved Tombstone',
    emoji: '🪦✨',
    description: 'Spawns more skeletons on death',
    healthBonus: 0.15,
    damageBonus: 0.15,
    specialEffect: 'Extra death spawn'
  },
  {
    cardId: 'goblin-hut',
    name: 'Evolved Goblin Hut',
    emoji: '🛖✨',
    description: 'Spawns goblins faster',
    healthBonus: 0.20,
    damageBonus: 0.15,
    specialEffect: 'Faster spawn'
  }
];

// Get evolution data for a specific card
export function getEvolution(cardId: string): Evolution | undefined {
  return evolutions.find(e => e.cardId === cardId);
}

// Check if a card has an available evolution
export function hasEvolution(cardId: string): boolean {
  return evolutions.some(e => e.cardId === cardId);
}

// Get all card IDs that have evolutions
export function getEvolvableCardIds(): string[] {
  return evolutions.map(e => e.cardId);
}

// Shards required to unlock an evolution
export const EVOLUTION_SHARDS_REQUIRED = 6;
