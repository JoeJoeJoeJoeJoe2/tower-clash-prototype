// Tower Troops that can replace Princess Towers
export interface TowerTroop {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  // Stats (multipliers compared to default Princess Tower)
  healthMultiplier: number;
  damageMultiplier: number;
  attackSpeedMultiplier: number; // Higher = faster attacks
  rangeMultiplier: number;
  // Special abilities
  hasSplash: boolean;
  splashRadius?: number;
  hasHealing?: boolean;
  healAmount?: number;
  healInterval?: number;
}

export const TOWER_TROOPS: TowerTroop[] = [
  {
    id: 'default',
    name: 'Princess Tower',
    emoji: '👸',
    description: 'The classic tower. Fires arrows at enemies.',
    rarity: 'common',
    color: '#3b82f6',
    healthMultiplier: 1,
    damageMultiplier: 1,
    attackSpeedMultiplier: 1,
    rangeMultiplier: 1,
    hasSplash: false,
  },
  {
    id: 'cannoneer',
    name: 'Cannoneer',
    emoji: '💣',
    description: 'High damage with splash. Slower attack speed.',
    rarity: 'rare',
    color: '#f59e0b',
    healthMultiplier: 0.9,
    damageMultiplier: 1.5,
    attackSpeedMultiplier: 0.7,
    rangeMultiplier: 0.9,
    hasSplash: true,
    splashRadius: 40,
  },
  {
    id: 'dagger-duchess',
    name: 'Dagger Duchess',
    emoji: '🗡️',
    description: 'Fast burst attacks with reload. Lower health.',
    rarity: 'epic',
    color: '#8b5cf6',
    healthMultiplier: 0.75,
    damageMultiplier: 0.6,
    attackSpeedMultiplier: 2.5, // Very fast attacks
    rangeMultiplier: 1.1,
    hasSplash: false,
  },
  {
    id: 'royal-chef',
    name: 'Royal Chef',
    emoji: '👨‍🍳',
    description: 'Splash damage and heals nearby troops.',
    rarity: 'legendary',
    color: '#ef4444',
    healthMultiplier: 0.85,
    damageMultiplier: 0.8,
    attackSpeedMultiplier: 0.9,
    rangeMultiplier: 0.85,
    hasSplash: true,
    splashRadius: 30,
    hasHealing: true,
    healAmount: 20, // HP per tick
    healInterval: 2, // seconds
  },
  {
    id: 'archer-queen',
    name: 'Archer Queen',
    emoji: '👑',
    description: 'Long range precision shots. Can cloak briefly.',
    rarity: 'legendary',
    color: '#10b981',
    healthMultiplier: 0.8,
    damageMultiplier: 1.3,
    attackSpeedMultiplier: 0.85,
    rangeMultiplier: 1.3,
    hasSplash: false,
  },
];

export function getTowerTroopById(id: string): TowerTroop {
  return TOWER_TROOPS.find(t => t.id === id) || TOWER_TROOPS[0];
}

export function getUnlockedTowerTroops(unlockedIds: string[]): TowerTroop[] {
  // Default tower is always unlocked
  return TOWER_TROOPS.filter(t => t.id === 'default' || unlockedIds.includes(t.id));
}
