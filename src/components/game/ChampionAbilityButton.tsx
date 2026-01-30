import { memo, useMemo } from 'react';
import { Unit } from '@/types/game';
import { getChampionAbility, CHAMPION_ABILITIES } from '@/data/championAbilities';
import { getCardById } from '@/data/cards';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface ChampionAbilityButtonProps {
  playerUnits: Unit[];
  onActivateAbility: (unitId: string) => void;
  currentTime: number;
}

export const ChampionAbilityButton = memo(function ChampionAbilityButton({
  playerUnits,
  onActivateAbility,
  currentTime
}: ChampionAbilityButtonProps) {
  // Find the first champion unit on the battlefield
  const championUnit = useMemo(() => {
    return playerUnits.find(unit => {
      const card = getCardById(unit.cardId);
      return card?.rarity === 'champion' && unit.health > 0;
    });
  }, [playerUnits]);

  if (!championUnit) return null;

  const card = getCardById(championUnit.cardId);
  const ability = getChampionAbility(championUnit.cardId);
  
  if (!ability || !card) return null;

  // Calculate cooldown
  const abilityState = championUnit.abilityState;
  const timeSinceLastActivation = abilityState 
    ? currentTime - abilityState.lastActivationTime 
    : ability.cooldown;
  const isOnCooldown = timeSinceLastActivation < ability.cooldown;
  const cooldownRemaining = Math.max(0, ability.cooldown - timeSinceLastActivation);
  const cooldownPercent = isOnCooldown ? (cooldownRemaining / ability.cooldown) * 100 : 0;
  
  // Check if ability is currently active
  const isActive = abilityState?.isActive || false;
  
  // Some abilities are passive and can't be manually triggered
  const isPassive = ability.triggerCondition === 'passive';
  const canActivate = !isOnCooldown && !isActive && !isPassive;

  const handleClick = () => {
    if (canActivate) {
      onActivateAbility(championUnit.id);
    }
  };

  // Get ability-specific styling
  const getAbilityColor = () => {
    switch (ability.id) {
      case 'cloak': return { from: 'from-purple-500', to: 'to-purple-700', border: 'border-purple-400', glow: 'shadow-purple-500/50' };
      case 'dash-chain': return { from: 'from-yellow-500', to: 'to-yellow-700', border: 'border-yellow-400', glow: 'shadow-yellow-500/50' };
      case 'soul-summon': return { from: 'from-green-500', to: 'to-green-700', border: 'border-green-400', glow: 'shadow-green-500/50' };
      case 'drill': return { from: 'from-orange-500', to: 'to-orange-700', border: 'border-orange-400', glow: 'shadow-orange-500/50' };
      case 'guardian': return { from: 'from-blue-500', to: 'to-blue-700', border: 'border-blue-400', glow: 'shadow-blue-500/50' };
      case 'reflect': return { from: 'from-cyan-500', to: 'to-cyan-700', border: 'border-cyan-400', glow: 'shadow-cyan-500/50' };
      default: return { from: 'from-amber-500', to: 'to-amber-700', border: 'border-amber-400', glow: 'shadow-amber-500/50' };
    }
  };

  const colors = getAbilityColor();

  // Get ability icon/emoji
  const getAbilityIcon = () => {
    switch (ability.id) {
      case 'cloak': return '👻';
      case 'dash-chain': return '⚔️';
      case 'soul-summon': return '💀';
      case 'drill': return '🔨';
      case 'guardian': return '🛡️';
      case 'reflect': return '🔄';
      default: return '⚡';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={!canActivate}
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center border-2 shadow-md transition-all relative overflow-hidden",
          `bg-gradient-to-b ${colors.from} ${colors.to} ${colors.border}`,
          canActivate && "hover:scale-105 active:scale-95",
          isActive && `animate-pulse shadow-lg ${colors.glow}`,
          (isOnCooldown || isPassive) && "opacity-60",
          isPassive && "cursor-default"
        )}
        title={`${ability.name}: ${ability.description}${isPassive ? ' (Passive)' : ''}`}
      >
        {/* Cooldown overlay */}
        {isOnCooldown && !isPassive && (
          <div 
            className="absolute inset-0 bg-black/60"
            style={{
              clipPath: `polygon(0 0, 100% 0, 100% ${cooldownPercent}%, 0 ${cooldownPercent}%)`
            }}
          />
        )}
        
        {/* Active glow ring */}
        {isActive && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-white/80 animate-ping" />
        )}
        
        {/* Ability icon */}
        <span className="text-base relative z-10">{getAbilityIcon()}</span>
        
        {/* Cooldown timer */}
        {isOnCooldown && !isPassive && (
          <div className="absolute bottom-0 left-0 right-0 text-[8px] font-bold text-white bg-black/50 text-center">
            {cooldownRemaining.toFixed(1)}
          </div>
        )}
        
        {/* Soul stacks indicator for Skeleton King */}
        {ability.id === 'soul-summon' && abilityState?.stacks !== undefined && abilityState.stacks > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 border border-purple-400 flex items-center justify-center text-[8px] text-white font-bold z-20">
            {abilityState.stacks}
          </div>
        )}
      </button>
      
      {/* Champion card emoji indicator */}
      <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-card border border-border flex items-center justify-center text-[10px] z-10">
        {card.emoji}
      </div>
    </div>
  );
});
