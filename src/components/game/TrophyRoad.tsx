import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Gift, Crown, Lock, Check, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ARENAS, getCurrentArena, getNextArena, Arena } from '@/data/arenas';
import { ChestReward } from './ChestReward';
import { ChestReward as ChestRewardType } from '@/types/game';

interface TrophyRoadProps {
  trophies: number;
  onClose: () => void;
  onClaimReward?: (trophyMilestone: number) => boolean;
  onGenerateReward?: (stars: number, skipInventoryCheck?: boolean) => ChestRewardType | null;
  claimedRewards?: number[]; // Trophy milestones already claimed
}

export function TrophyRoad({ trophies, onClose, onClaimReward, onGenerateReward, claimedRewards = [] }: TrophyRoadProps) {
  const currentArena = getCurrentArena(trophies);
  const nextArena = getNextArena(trophies);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showChestReward, setShowChestReward] = useState(false);
  const [pendingMilestone, setPendingMilestone] = useState<number | null>(null);

  // Generate all trophy milestones
  const milestones = generateMilestones();

  // Handle claiming a reward - opens chest experience
  const handleClaimClick = useCallback((milestone: number) => {
    setPendingMilestone(milestone);
    setShowChestReward(true);
  }, []);

  // Handle chest reward generation
  const handleGenerateReward = useCallback((stars: number): ChestRewardType | null => {
    if (pendingMilestone && onClaimReward) {
      onClaimReward(pendingMilestone);
    }
    if (onGenerateReward) {
      // Pass true to skip inventory check for trophy road rewards
      return onGenerateReward(stars, true);
    }
    return null;
  }, [pendingMilestone, onClaimReward, onGenerateReward]);

  // Handle closing chest reward
  const handleChestClose = useCallback(() => {
    setShowChestReward(false);
    setPendingMilestone(null);
  }, []);

  // Scroll to current progress on mount
  useEffect(() => {
    if (scrollRef.current) {
      const currentMilestoneIndex = milestones.findIndex(m => m.trophies > trophies);
      const scrollTarget = Math.max(0, currentMilestoneIndex - 3);
      const itemHeight = 80; // Approximate height per item
      scrollRef.current.scrollTop = scrollTarget * itemHeight;
    }
  }, [trophies]);

  function generateMilestones() {
    const items: { trophies: number; type: 'chest' | 'arena'; arena?: Arena }[] = [];
    
    // Generate milestones dynamically - extend beyond player's current trophies
    // Start at 10, then 20, 30... with arenas every 100 (100, 200, 300...)
    const maxMilestone = Math.max(trophies + 200, 500); // Show at least 200 ahead of current
    
    for (let t = 10; t <= maxMilestone; t += 10) {
      const arena = ARENAS.find(a => a.trophiesRequired === t);
      if (arena) {
        items.push({ trophies: t, type: 'arena', arena });
      } else {
        items.push({ trophies: t, type: 'chest' });
      }
    }
    
    return items.reverse(); // Show highest at top
  }

  const trophiesToNextArena = nextArena ? nextArena.trophiesRequired - trophies : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a3a5c] via-[#0d2840] to-[#0a1f33] flex flex-col">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-[#0d1b2a] to-[#152238] px-4 py-3 border-b border-cyan-900/50">
        <button 
          onClick={onClose}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Trophy Road</h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-bold">{trophies}</span>
          </div>
        </div>
      </div>

      {/* Current Arena Card */}
      <div className="p-4">
        <div 
          className={cn(
            "relative rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-xl",
            `bg-gradient-to-br ${currentArena.bgGradient}`
          )}
        >
          {/* Arena display */}
          <div className="p-4 text-center">
            <div className="text-5xl mb-2">{currentArena.emoji}</div>
            <h2 className="text-2xl font-bold text-white">{currentArena.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Crown className="w-4 h-4 text-amber-300" />
              <span className="text-amber-200 text-sm">ARENA {currentArena.id}</span>
            </div>
            
            {/* Trophy count display */}
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-white font-bold">{trophies}</span>
              </div>
              {nextArena && (
                <div className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full">
                  <Trophy className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{nextArena.trophiesRequired}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress to next arena */}
          {nextArena && (
            <div className="bg-black/40 p-3">
              <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                <span>Progress to {nextArena.name}</span>
                <span>{trophiesToNextArena} trophies needed</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, ((trophies - currentArena.trophiesRequired) / (nextArena.trophiesRequired - currentArena.trophiesRequired)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Warning for King level requirement */}
          {nextArena && trophiesToNextArena <= 50 && (
            <div className="bg-amber-900/50 px-3 py-2 flex items-center gap-2">
              <span className="text-amber-300 text-xs">
                ⚠️ You need a higher King level to progress to the next Arena!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Trophy Road List */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-cyan-800 scrollbar-track-transparent"
        >
          {milestones.map((milestone, index) => {
            const isUnlocked = trophies >= milestone.trophies;
            const isClaimed = claimedRewards.includes(milestone.trophies);
            const canClaim = isUnlocked && !isClaimed;
            const isArena = milestone.type === 'arena';
            const isCurrentProgress = trophies >= milestone.trophies - 10 && trophies < milestone.trophies;

            return (
              <div 
                key={milestone.trophies}
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded-xl transition-all",
                  isCurrentProgress && "bg-amber-500/20 border border-amber-500/40",
                  isUnlocked && !isCurrentProgress && "bg-white/5",
                  !isUnlocked && "opacity-50"
                )}
              >
                {/* Trophy count */}
                <div className={cn(
                  "w-16 flex items-center gap-1 font-bold text-sm",
                  isUnlocked ? "text-amber-400" : "text-gray-500"
                )}>
                  <Trophy className="w-4 h-4" />
                  {milestone.trophies}
                </div>

                {/* Connection line */}
                {index < milestones.length - 1 && (
                  <div className={cn(
                    "absolute left-[4.5rem] top-full w-0.5 h-1",
                    isUnlocked ? "bg-amber-500" : "bg-gray-600"
                  )} />
                )}

                {/* Reward icon */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-lg",
                  isArena 
                    ? `bg-gradient-to-br ${milestone.arena?.bgGradient || 'from-gray-600 to-gray-800'} border-amber-400`
                    : isUnlocked 
                      ? "bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400"
                      : "bg-gradient-to-br from-gray-700 to-gray-900 border-gray-600"
                )}>
                  {isArena ? (
                    <span className="text-2xl">{milestone.arena?.emoji}</span>
                  ) : isClaimed ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : isUnlocked ? (
                    <Gift className="w-5 h-5 text-purple-200" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-500" />
                  )}
                </div>

                {/* Reward description */}
                <div className="flex-1">
                  {isArena ? (
                    <div>
                      <p className="font-bold text-white text-sm">{milestone.arena?.name}</p>
                      <p className="text-xs text-gray-400">Arena {milestone.arena?.id} Unlocked!</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-white text-sm">Silver Chest</p>
                      <p className="text-xs text-gray-400">Contains cards and gold</p>
                    </div>
                  )}
                </div>

                {/* Claim button */}
                {!isArena && canClaim && (
                  <Button
                    size="sm"
                    onClick={() => handleClaimClick(milestone.trophies)}
                    className="bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold text-xs px-3"
                  >
                    Claim
                  </Button>
                )}

                {isClaimed && !isArena && (
                  <span className="text-green-400 text-xs font-bold">Claimed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* OK Button */}
      <div className="p-4 bg-gradient-to-t from-[#0a1525] to-transparent">
        <Button
          onClick={onClose}
          className="w-full h-12 text-lg font-bold bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 border-b-4 border-blue-900 rounded-xl"
        >
          OK
        </Button>
      </div>

      {/* Chest Reward Overlay */}
      {showChestReward && onGenerateReward && (
        <ChestReward
          onGenerateReward={handleGenerateReward}
          onClose={handleChestClose}
        />
      )}
    </div>
  );
}
