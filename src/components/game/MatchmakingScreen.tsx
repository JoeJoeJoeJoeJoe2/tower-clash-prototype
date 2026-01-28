import { useState, useEffect } from 'react';
import { PlayerProgress } from '@/types/game';
import { getBannerById, allBanners } from '@/data/banners';
import { Trophy } from 'lucide-react';

interface MatchmakingScreenProps {
  progress: PlayerProgress;
  onReady: () => void;
}

// Random enemy names for variety
const ENEMY_NAMES = [
  'DarkKnight', 'ShadowStrike', 'ThunderBolt', 'IceQueen', 'FireLord',
  'StormRider', 'NightHawk', 'DragonSlayer', 'PhantomX', 'BlazeMaster',
  'FrostBite', 'VenomStrike', 'SteelClaw', 'CrimsonKing', 'SilverWolf'
];

export function MatchmakingScreen({ progress, onReady }: MatchmakingScreenProps) {
  const [showVs, setShowVs] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const playerBanner = getBannerById(progress.bannerId);
  const playerTrophies = progress.wins * 30;
  const playerLevel = Math.min(14, Math.floor(progress.wins / 5) + 1);

  // Generate random enemy
  const enemyName = ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)];
  const enemyBanner = allBanners[Math.floor(Math.random() * allBanners.length)];
  const enemyTrophies = Math.max(0, playerTrophies + Math.floor((Math.random() - 0.5) * 200));
  const enemyLevel = Math.max(1, Math.min(14, playerLevel + Math.floor((Math.random() - 0.5) * 4)));

  useEffect(() => {
    // Animate entrance
    const vsTimer = setTimeout(() => setShowVs(true), 400);
    const playerTimer = setTimeout(() => setShowPlayer(true), 800);
    
    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(onReady, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(vsTimer);
      clearTimeout(playerTimer);
      clearInterval(countdownInterval);
    };
  }, [onReady]);

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-[#1a0a2e] via-[#16213e] to-[#0f0f23] flex flex-col items-center justify-between py-8 overflow-hidden">
      {/* Enemy Profile - Top */}
      <div className="flex flex-col items-center animate-fade-in">
        {/* Enemy Banner */}
        <div 
          className="w-20 h-20 rounded-xl flex items-center justify-center border-4 shadow-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${enemyBanner.color}ee, ${enemyBanner.color}88)`,
            borderColor: `${enemyBanner.color}`,
            boxShadow: `0 0 30px ${enemyBanner.color}66`
          }}
        >
          <span className="text-4xl">{enemyBanner.emoji}</span>
        </div>
        
        {/* Enemy Level Badge */}
        <div className="relative -mt-3 z-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-red-500 to-red-700 border-2 border-red-400 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">{enemyLevel}</span>
          </div>
        </div>

        {/* Enemy Name & Trophies */}
        <div className="mt-2 text-center">
          <p className="text-white font-bold text-xl">{enemyName}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Trophy className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 font-semibold">{enemyTrophies}</span>
          </div>
        </div>
      </div>

      {/* VS Badge - Center */}
      <div className={`flex flex-col items-center transition-all duration-500 ${showVs ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        {/* Arena Preview */}
        <div className="relative w-48 h-32 rounded-xl overflow-hidden border-2 border-cyan-600/50 shadow-2xl mb-4">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-600 via-emerald-500 to-emerald-600">
            {/* River */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 opacity-80" />
            {/* Bridges */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[15%] w-6 h-4 bg-amber-700 rounded" />
            <div className="absolute top-1/2 -translate-y-1/2 right-[15%] w-6 h-4 bg-amber-700 rounded" />
          </div>
          {/* Mini Towers */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded bg-red-600 border border-red-400" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded bg-blue-600 border border-blue-400" />
        </div>

        {/* VS Text */}
        <div 
          className="relative"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(255,200,0,0.8))'
          }}
        >
          <div 
            className="text-5xl font-black px-6 py-2"
            style={{
              fontFamily: "'Luckiest Guy', cursive",
              background: 'linear-gradient(180deg, #fff9c4 0%, #ffd54f 30%, #ff8f00 60%, #e65100 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            VS
          </div>
        </div>

        {/* Countdown */}
        {countdown > 0 && (
          <div className="mt-4 text-4xl font-bold text-white animate-pulse">
            {countdown}
          </div>
        )}
        {countdown === 0 && (
          <div className="mt-4 text-2xl font-bold text-green-400 animate-bounce">
            GO!
          </div>
        )}
      </div>

      {/* Player Profile - Bottom */}
      <div className={`flex flex-col items-center transition-all duration-500 ${showPlayer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Player Name & Trophies */}
        <div className="mb-2 text-center">
          <p className="text-white font-bold text-xl">{progress.playerName}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Trophy className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 font-semibold">{playerTrophies}</span>
          </div>
        </div>

        {/* Player Level Badge */}
        <div className="relative mb-3 z-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-400 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">{playerLevel}</span>
          </div>
        </div>

        {/* Player Banner */}
        <div 
          className="w-20 h-20 rounded-xl flex items-center justify-center border-4 shadow-2xl"
          style={{ 
            background: playerBanner 
              ? `linear-gradient(135deg, ${playerBanner.color}ee, ${playerBanner.color}88)`
              : 'linear-gradient(135deg, #3b82f6ee, #3b82f688)',
            borderColor: playerBanner?.color || '#3b82f6',
            boxShadow: `0 0 30px ${playerBanner?.color || '#3b82f6'}66`
          }}
        >
          <span className="text-4xl">{playerBanner?.emoji || '⚔️'}</span>
        </div>
      </div>
    </div>
  );
}
