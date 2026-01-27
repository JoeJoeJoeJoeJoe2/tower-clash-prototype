import { GameState, CardDefinition, Position, Unit, Tower } from '@/types/game';

const ARENA_WIDTH = 400;

interface LaneState {
  left: { playerUnits: number; playerDamage: number; enemyUnits: number };
  right: { playerUnits: number; playerDamage: number; enemyUnits: number };
}

function analyzeLanes(state: GameState): LaneState {
  const midX = ARENA_WIDTH / 2;
  
  const left = { playerUnits: 0, playerDamage: 0, enemyUnits: 0 };
  const right = { playerUnits: 0, playerDamage: 0, enemyUnits: 0 };
  
  state.playerUnits.forEach(u => {
    if (u.health > 0) {
      if (u.position.x < midX) {
        left.playerUnits++;
        left.playerDamage += u.damage;
      } else {
        right.playerUnits++;
        right.playerDamage += u.damage;
      }
    }
  });
  
  state.enemyUnits.forEach(u => {
    if (u.health > 0) {
      if (u.position.x < midX) {
        left.enemyUnits++;
      } else {
        right.enemyUnits++;
      }
    }
  });
  
  return { left, right };
}

function getTowerHealth(towers: Tower[], side: 'left' | 'right' | 'king'): number {
  const tower = towers.find(t => {
    if (side === 'king') return t.type === 'king';
    if (side === 'left') return t.type === 'princess' && t.position.x < ARENA_WIDTH / 2;
    return t.type === 'princess' && t.position.x > ARENA_WIDTH / 2;
  });
  return tower?.health ?? 0;
}

function selectBestCard(
  hand: CardDefinition[], 
  elixir: number, 
  lanes: LaneState,
  enemyTowers: Tower[]
): { card: CardDefinition; index: number } | null {
  const affordable = hand
    .map((card, idx) => ({ card, idx }))
    .filter(({ card }) => card.elixirCost <= elixir);
  
  if (affordable.length === 0) return null;
  
  // Determine which lane needs attention
  const leftThreat = lanes.left.playerDamage;
  const rightThreat = lanes.right.playerDamage;
  const defendingLeft = leftThreat > rightThreat;
  
  // If under heavy attack, prioritize defensive cards
  const totalThreat = leftThreat + rightThreat;
  const needsDefense = totalThreat > 30;
  
  // Check if we have an opportunity to push
  const leftTowerLow = getTowerHealth(enemyTowers, 'left') < 80 && getTowerHealth(enemyTowers, 'left') > 0;
  const rightTowerLow = getTowerHealth(enemyTowers, 'right') < 80 && getTowerHealth(enemyTowers, 'right') > 0;
  const canPush = leftTowerLow || rightTowerLow;
  
  // Score each card
  let bestChoice: { card: CardDefinition; idx: number; score: number } | null = null;
  
  for (const { card, idx } of affordable) {
    let score = 0;
    
    // Defense priority
    if (needsDefense) {
      if (card.type === 'tank' || card.type === 'mini-tank') score += 15;
      if (card.range > 80) score += 10; // Ranged units for defense
    }
    
    // Push opportunity
    if (canPush) {
      if (card.type === 'tank') score += 20; // Tanks to push
      if (card.moveSpeed > 0.6) score += 10; // Fast units
    }
    
    // Value efficiency
    score += (card.health + card.damage * 5) / card.elixirCost;
    
    // Counter logic - ranged vs swarm, tank vs damage
    if (totalThreat > 0) {
      const threatLane = defendingLeft ? lanes.left : lanes.right;
      if (threatLane.playerUnits >= 3 && card.range > 60) {
        score += 15; // Splash/ranged vs swarm
      }
    }
    
    // Don't overspend on expensive cards early
    if (elixir < 6 && card.elixirCost >= 5) {
      score -= 10;
    }
    
    if (!bestChoice || score > bestChoice.score) {
      bestChoice = { card, idx, score };
    }
  }
  
  return bestChoice ? { card: bestChoice.card, index: bestChoice.idx } : null;
}

function selectPlacementPosition(
  card: CardDefinition,
  lanes: LaneState,
  enemyTowers: Tower[]
): Position {
  const leftThreat = lanes.left.playerDamage;
  const rightThreat = lanes.right.playerDamage;
  
  // Determine lane
  let targetX: number;
  
  // If defending, place in the threatened lane
  if (leftThreat > 20 || rightThreat > 20) {
    targetX = leftThreat > rightThreat ? 100 : ARENA_WIDTH - 100;
  } else {
    // Otherwise, attack the weaker lane
    const leftTowerHealth = getTowerHealth(enemyTowers, 'left');
    const rightTowerHealth = getTowerHealth(enemyTowers, 'right');
    
    if (leftTowerHealth <= 0) {
      targetX = ARENA_WIDTH / 2; // Attack king if princess down
    } else if (rightTowerHealth <= 0) {
      targetX = ARENA_WIDTH / 2;
    } else {
      targetX = leftTowerHealth < rightTowerHealth ? 100 : ARENA_WIDTH - 100;
    }
  }
  
  // Add some randomness to prevent predictable placement
  targetX += (Math.random() - 0.5) * 60;
  targetX = Math.max(50, Math.min(ARENA_WIDTH - 50, targetX));
  
  // Place tanks further back, ranged units behind
  let targetY: number;
  if (card.type === 'tank') {
    targetY = 180 + Math.random() * 40;
  } else if (card.range > 80) {
    targetY = 140 + Math.random() * 30;
  } else {
    targetY = 160 + Math.random() * 40;
  }
  
  return { x: targetX, y: targetY };
}

export interface AIDecision {
  shouldPlay: boolean;
  cardIndex?: number;
  position?: Position;
  card?: CardDefinition;
}

export function makeAIDecision(state: GameState, lastPlayTime: number): AIDecision {
  const now = performance.now();
  const timeSinceLastPlay = now - lastPlayTime;
  
  // Minimum delay between plays (2-4 seconds)
  const minDelay = 2000 + Math.random() * 2000;
  if (timeSinceLastPlay < minDelay) {
    return { shouldPlay: false };
  }
  
  // Don't play if elixir too low
  if (state.enemyElixir < 3) {
    return { shouldPlay: false };
  }
  
  // Chance to wait even when can play (more strategic)
  if (state.enemyElixir < 8 && Math.random() < 0.3) {
    return { shouldPlay: false };
  }
  
  const lanes = analyzeLanes(state);
  const selection = selectBestCard(state.enemyHand, state.enemyElixir, lanes, state.enemyTowers);
  
  if (!selection) {
    return { shouldPlay: false };
  }
  
  const position = selectPlacementPosition(selection.card, lanes, state.enemyTowers);
  
  return {
    shouldPlay: true,
    cardIndex: selection.index,
    position,
    card: selection.card
  };
}
