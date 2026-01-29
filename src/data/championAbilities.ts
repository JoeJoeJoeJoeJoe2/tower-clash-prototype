// Champion Ability Definitions
// Each champion has a unique passive or active ability

export type ChampionAbilityType = 
  | 'dash-chain'      // Golden Knight - dashes between enemies
  | 'cloak'           // Archer Queen - becomes invisible
  | 'soul-summon'     // Skeleton King - summons skeletons from kills
  | 'drill'           // Mighty Miner - burrows to escape/reposition
  | 'guardian'        // Little Prince - summons guardian when low HP
  | 'reflect'         // Monk - reflects projectiles

export interface ChampionAbility {
  id: ChampionAbilityType;
  name: string;
  description: string;
  cooldown: number; // Seconds between ability activations
  duration?: number; // Duration of the ability effect
  triggerCondition: 'passive' | 'on-attack' | 'on-hit' | 'low-health' | 'interval';
  triggerThreshold?: number; // e.g., 50% health for low-health trigger
}

export const CHAMPION_ABILITIES: Record<string, ChampionAbility> = {
  'golden-knight': {
    id: 'dash-chain',
    name: 'Dashing Dash',
    description: 'Dashes to the next closest enemy after each kill',
    cooldown: 0, // No cooldown - triggers on kill
    triggerCondition: 'passive'
  },
  'archer-queen': {
    id: 'cloak',
    name: 'Cloaking Cape',
    description: 'Becomes invisible for 4 seconds when taking damage',
    cooldown: 10,
    duration: 4,
    triggerCondition: 'on-hit',
    triggerThreshold: 0.7 // Triggers when below 70% HP
  },
  'skeleton-king': {
    id: 'soul-summon',
    name: 'Soul Summoning',
    description: 'Summons skeletons for each enemy killed nearby',
    cooldown: 0, // Passive - accumulates souls
    triggerCondition: 'passive'
  },
  'mighty-miner': {
    id: 'drill',
    name: 'Explosive Escape',
    description: 'Burrows underground to the King Tower when low HP, dealing damage',
    cooldown: 15,
    triggerCondition: 'low-health',
    triggerThreshold: 0.3 // Triggers at 30% HP
  },
  'little-prince': {
    id: 'guardian',
    name: 'Royal Guardian',
    description: 'Summons a protective knight when taking damage',
    cooldown: 12,
    triggerCondition: 'on-hit',
    triggerThreshold: 0.5 // Triggers at 50% HP
  },
  'monk': {
    id: 'reflect',
    name: 'Pork Buns',
    description: 'Reflects incoming projectiles back at enemies',
    cooldown: 8,
    duration: 2,
    triggerCondition: 'interval' // Activates periodically
  }
};

export function getChampionAbility(cardId: string): ChampionAbility | null {
  return CHAMPION_ABILITIES[cardId] || null;
}

// Ability state tracking for units
export interface ChampionAbilityState {
  abilityType: ChampionAbilityType;
  lastActivationTime: number;
  isActive: boolean;
  stacks?: number; // For soul-summon tracking
  remainingDuration?: number;
}

export function createAbilityState(cardId: string): ChampionAbilityState | null {
  const ability = getChampionAbility(cardId);
  if (!ability) return null;
  
  return {
    abilityType: ability.id,
    lastActivationTime: 0,
    isActive: false,
    stacks: ability.id === 'soul-summon' ? 0 : undefined,
    remainingDuration: 0
  };
}
