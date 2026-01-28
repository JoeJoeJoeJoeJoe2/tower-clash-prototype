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

type MatchmakingPhase = 'searching' | 'found' | 'versus' | 'ready';

export function MatchmakingScreen({ progress, onReady }: MatchmakingScreenProps) {
  const [phase, setPhase] = useState<MatchmakingPhase>('searching');
  const [showEnemy, setShowEnemy] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showVs, setShowVs] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const playerBanner = getBannerById(progress.bannerId);
  const playerTrophies = progress.wins * 30;
  const playerLevel = Math.min(14, Math.floor(progress.wins / 5) + 1);

  // Generate random enemy (memoized to prevent re-renders changing it)
  const [enemy] = useState(() => ({
    name: ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)],
    banner: allBanners[Math.floor(Math.random() * allBanners.length)],
    trophies: Math.max(0, playerTrophies + Math.floor((Math.random() - 0.5) * 200)),
    level: Math.max(1, Math.min(14, playerLevel + Math.floor((Math.random() - 0.5) * 4)))
  }));

  useEffect(() => {
    const searchTimer = setTimeout(() => setPhase('found'), 1500);
    const foundTimer = setTimeout(() => {
      setPhase('versus');
      setShowEnemy(true);
    }, 2300);
    const playerTimer = setTimeout(() => setShowPlayer(true), 2800);
    const vsTimer = setTimeout(() => {
      setShowVs(true);
      setPhase('ready');
    }, 3300);

    return () => {
      clearTimeout(searchTimer);
      clearTimeout(foundTimer);
      clearTimeout(playerTimer);
      clearTimeout(vsTimer);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'ready') return;
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(onReady, 400);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, [phase, onReady]);

  return (
    <div className="h-screen w-screen relative flex flex-col items-center justify-between py-8 overflow-hidden">
      {/* Arena Background - Dimmed */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-700 via-emerald-600 to-emerald-700">
          <div className="absolute inset-0 opacity-20">
            {[...Array(12)].map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full h-px bg-emerald-900" style={{ top: `${(i + 1) * 8}%` }} />
            ))}
          </div>
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 opacity-60" />
          <div className="absolute top-1/2 -translate-y-1/2 left-[20%] w-16 h-8 bg-amber-800/70 rounded" />
          <div className="absolute top-1/2 -translate-y-1/2 right-[20%] w-16 h-8 bg-amber-800/70 rounded" />
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-16 h-16 rounded-lg bg-red-700/50 border-2 border-red-500/30" />
          <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-16 h-16 rounded-lg bg-blue-700/50 border-2 border-blue-500/30" />
        </div>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Searching Phase */}
      {phase === 'searching' && (
        <div className="flex-1 flex flex-col items-center justify-center z-10">
          <div className="text-2xl font-bold text-white mb-4">Searching for opponent...</div>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}

      {/* Found Phase */}
      {phase === 'found' && (
        <div className="flex-1 flex flex-col items-center justify-center z-10">
          <div className="text-2xl font-bold text-green-400 animate-pulse">Opponent Found!</div>
        </div>
      )}

      {/* Versus Phase - Show banners */}
      {(phase === 'versus' || phase === 'ready') && (
        <>
          {/* Enemy Profile - Top */}
          <div className={`flex flex-col items-center z-10 transition-all duration-500 ${showEnemy ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <div 
              className="w-20 h-20 rounded-xl flex items-center justify-center border-4 shadow-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${enemy.banner.color}ee, ${enemy.banner.color}88)`,
                borderColor: enemy.banner.color,
                boxShadow: `0 0 30px ${enemy.banner.color}66`
              }}
            >
              <span className="text-4xl">{enemy.banner.emoji}</span>
            </div>
            <div className="relative -mt-3 z-10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-red-500 to-red-700 border-2 border-red-400 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">{enemy.level}</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-white font-bold text-xl">{enemy.name}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Trophy className="w-4 h-4 text-orange-400" />
                <span className="text-orange-300 font-semibold">{enemy.trophies}</span>
              </div>
            </div>
          </div>

          {/* VS Badge - Center */}
          <div className={`flex flex-col items-center transition-all duration-500 z-10 ${showVs ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div 
              className="text-6xl font-black"
              style={{
                fontFamily: "'Luckiest Guy', cursive",
                background: 'linear-gradient(180deg, #fff9c4 0%, #ffd54f 30%, #ff8f00 60%, #e65100 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(255,200,0,0.8))'
              }}
            >
              VS
            </div>
            {countdown > 0 && phase === 'ready' && (
              <div className="mt-4 text-4xl font-bold text-white animate-pulse">{countdown}</div>
            )}
            {countdown === 0 && (
              <div className="mt-4 text-2xl font-bold text-green-400 animate-bounce">GO!</div>
            )}
          </div>

          {/* Player Profile - Bottom */}
          <div className={`flex flex-col items-center transition-all duration-500 z-10 ${showPlayer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-2 text-center">
              <p className="text-white font-bold text-xl">{progress.playerName}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Trophy className="w-4 h-4 text-orange-400" />
                <span className="text-orange-300 font-semibold">{playerTrophies}</span>
              </div>
            </div>
            <div className="relative mb-3 z-10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-400 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">{playerLevel}</span>
              </div>
            </div>
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
        </>
      )}
    </div>
  );
}
