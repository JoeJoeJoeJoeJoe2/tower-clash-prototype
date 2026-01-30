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

  // Generate all trophy milestones - always start from 10 and go up
  const generateMilestones = useCallback(() => {
    const items: { trophies: number; type: 'chest' | 'arena'; arena?: Arena }[] = [];
    
    // Always start from 10 and show ahead of current trophies
    const maxMilestone = Math.max(trophies + 100, 200);
    
    for (let t = 10; t <= maxMilestone; t += 10) {
      const arena = ARENAS.find(a => a.trophiesRequired === t);
      if (arena) {
        items.push({ trophies: t, type: 'arena', arena });
      } else {
        items.push({ trophies: t, type: 'chest' });
      }
    }
    
    return items.reverse(); // Show highest at top
  }, [trophies]);

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
      const itemHeight = 100;
      scrollRef.current.scrollTop = scrollTarget * itemHeight;
    }
  }, [trophies, milestones]);

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
          className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-800 scrollbar-track-transparent"
        >
          {milestones.map((milestone, index) => {
            const isUnlocked = trophies >= milestone.trophies;
            const isClaimed = claimedRewards.includes(milestone.trophies);
            const canClaim = isUnlocked && !isClaimed;
            const isArena = milestone.type === 'arena';
            const isNext = !isUnlocked && (index === milestones.length - 1 || trophies >= milestones[index + 1]?.trophies);

            return (
              <div key={milestone.trophies} className="relative">
                {/* Vertical connection line */}
                {index < milestones.length - 1 && (
                  <div className={cn(
                    "absolute left-1/2 top-full w-1 h-4 -translate-x-1/2 z-0",
                    isUnlocked ? "bg-gradient-to-b from-amber-500 to-amber-600" : "bg-gray-700"
                  )} />
                )}

                <div 
                  className={cn(
                    "relative flex items-center gap-4 p-3 rounded-2xl transition-all mb-4",
                    isNext && "ring-2 ring-amber-400 bg-amber-500/10",
                    isUnlocked && "bg-white/5",
                    !isUnlocked && !isNext && "opacity-60"
                  )}
                >
                  {/* Trophy badge */}
                  <div className={cn(
                    "w-14 h-10 rounded-lg flex items-center justify-center gap-1 font-bold text-sm border",
                    isUnlocked 
                      ? "bg-gradient-to-b from-amber-500 to-amber-700 border-amber-400 text-white" 
                      : "bg-gray-800 border-gray-600 text-gray-400"
                  )}>
                    <Trophy className="w-3.5 h-3.5" />
                    {milestone.trophies}
                  </div>

                  {/* Chest or Arena visual */}
                  {isArena ? (
                    // Arena display
                    <div className={cn(
                      "flex-1 rounded-xl p-3 border-2 transition-all",
                      isUnlocked 
                        ? `bg-gradient-to-br ${milestone.arena?.bgGradient} border-amber-400 shadow-lg shadow-amber-500/20`
                        : "bg-gray-800/50 border-gray-700 grayscale"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center text-3xl",
                          isUnlocked 
                            ? "bg-black/30 shadow-inner" 
                            : "bg-gray-900/50"
                        )}>
                          {milestone.arena?.emoji}
                        </div>
                        <div className="flex-1">
                          <p className={cn(
                            "font-bold text-lg",
                            isUnlocked ? "text-white" : "text-gray-500"
                          )}>
                            {milestone.arena?.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <Crown className={cn("w-3.5 h-3.5", isUnlocked ? "text-amber-300" : "text-gray-600")} />
                            <span className={cn("text-xs", isUnlocked ? "text-amber-200" : "text-gray-600")}>
                              Arena {milestone.arena?.id}
                            </span>
                          </div>
                          {!isUnlocked && (
                            <div className="flex items-center gap-1 mt-1">
                              <Lock className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500">Locked</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Chest display
                    <div className={cn(
                      "flex-1 rounded-xl p-3 border-2 transition-all",
                      isUnlocked && !isClaimed
                        ? "bg-gradient-to-br from-gray-600 to-gray-800 border-gray-400 shadow-lg"
                        : isClaimed
                          ? "bg-gray-800/30 border-gray-700"
                          : "bg-gray-900/50 border-gray-700"
                    )}>
                      <div className="flex items-center gap-3">
                        {/* Chest icon */}
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center relative",
                          isUnlocked && !isClaimed
                            ? "bg-gradient-to-b from-gray-500 to-gray-700 shadow-lg"
                            : isClaimed
                              ? "bg-gray-800"
                              : "bg-gray-900"
                        )}>
                          {isClaimed ? (
                            <Check className="w-7 h-7 text-green-400" />
                          ) : isUnlocked ? (
                            <div className="relative">
                              <div className="text-3xl">📦</div>
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Gift className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <div className="text-3xl grayscale opacity-50">📦</div>
                              <Lock className="absolute -bottom-1 -right-1 w-4 h-4 text-gray-500" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className={cn(
                            "font-bold",
                            isUnlocked ? "text-white" : "text-gray-500"
                          )}>
                            Silver Chest
                          </p>
                          <p className={cn(
                            "text-xs",
                            isUnlocked ? "text-gray-300" : "text-gray-600"
                          )}>
                            {isClaimed ? "Reward claimed!" : "Contains cards and gold"}
                          </p>
                        </div>

                        {/* Claim button */}
                        {canClaim && (
                          <Button
                            size="sm"
                            onClick={() => handleClaimClick(milestone.trophies)}
                            className="bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold px-4 py-2 animate-pulse"
                          >
                            <Gift className="w-4 h-4 mr-1" />
                            Claim
                          </Button>
                        )}

                        {isClaimed && (
                          <span className="text-green-400 text-sm font-bold px-2">✓</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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
