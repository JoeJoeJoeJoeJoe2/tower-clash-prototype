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

interface BannerCardProps {
  name: string;
  bannerColor: string;
  bannerEmoji: string;
  trophies: number;
  level: number;
  isPlayer: boolean;
  isVisible: boolean;
}

function BannerCard({ name, bannerColor, bannerEmoji, trophies, level, isPlayer, isVisible }: BannerCardProps) {
  return (
    <div 
      className={`
        absolute flex flex-col items-center transition-all duration-700 ease-out
        ${isPlayer 
          ? 'bottom-24 left-4 sm:bottom-28 sm:left-8' 
          : 'top-24 right-4 sm:top-28 sm:right-8'
        }
        ${isVisible 
          ? 'opacity-100 translate-x-0 translate-y-0' 
          : isPlayer 
            ? 'opacity-0 -translate-x-20 translate-y-20' 
            : 'opacity-0 translate-x-20 -translate-y-20'
        }
      `}
      style={{
        // Rotate banners to point toward middle
        transform: isVisible 
          ? `rotate(${isPlayer ? '90deg' : '-90deg'})` 
          : isPlayer 
            ? 'rotate(90deg) translateX(-80px) translateY(80px)' 
            : 'rotate(-90deg) translateX(80px) translateY(-80px)',
      }}
    >
      {/* Large Banner/Shield Container - Extended length */}
      <div 
        className="relative w-28 h-72 sm:w-36 sm:h-80 flex flex-col items-center justify-center"
        style={{
          background: `linear-gradient(180deg, ${bannerColor}dd 0%, ${bannerColor} 30%, ${bannerColor}aa 70%, ${bannerColor}66 100%)`,
          clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
          boxShadow: `0 0 40px ${bannerColor}88, inset 0 0 30px rgba(255,255,255,0.1)`,
        }}
      >
        {/* Inner border effect */}
        <div 
          className="absolute inset-3 opacity-40 pointer-events-none"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)',
          }}
        />
        
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        
        {/* Side decorations */}
        <div className="absolute top-4 left-2 w-1 h-24 bg-white/20 rounded-full" />
        <div className="absolute top-4 right-2 w-1 h-24 bg-white/20 rounded-full" />
        
        {/* Large emoji - counter-rotate to stay upright */}
        <span 
          className="text-5xl sm:text-6xl mb-8 drop-shadow-lg"
          style={{ transform: `rotate(${isPlayer ? '-90deg' : '90deg'})` }}
        >
          {bannerEmoji}
        </span>
        
        {/* Level badge */}
        <div 
          className={`
            absolute w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center
            border-2 shadow-xl
            ${isPlayer 
              ? 'bg-gradient-to-b from-blue-400 to-blue-600 border-blue-300' 
              : 'bg-gradient-to-b from-red-400 to-red-600 border-red-300'
            }
          `}
          style={{ 
            bottom: '8%',
            transform: `rotate(${isPlayer ? '-90deg' : '90deg'})` 
          }}
        >
          <span className="text-white font-black text-lg sm:text-xl">{level}</span>
        </div>
      </div>

      {/* Name and trophies - counter-rotate to stay readable */}
      <div 
        className="mt-4 text-center"
        style={{ transform: `rotate(${isPlayer ? '-90deg' : '90deg'})` }}
      >
        <p className="text-white font-bold text-lg sm:text-xl drop-shadow-lg whitespace-nowrap">{name}</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Trophy className="w-4 h-4 text-orange-400" />
          <span className="text-orange-300 font-bold text-base">{trophies}</span>
        </div>
      </div>
    </div>
  );
}

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
    <div className="h-screen w-screen relative flex flex-col items-center justify-center overflow-hidden">
      {/* Arena Background - Dimmed */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950">
          {/* Decorative sparkles */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }} 
              />
            ))}
          </div>
          {/* Arena floor glow */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-amber-600/30 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-cyan-600/20 to-transparent" />
        </div>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Searching Phase */}
      {phase === 'searching' && (
        <div className="flex flex-col items-center justify-center z-10">
          <div className="text-2xl sm:text-3xl font-bold text-white mb-4">Searching for opponent...</div>
          <div className="flex gap-2">
            <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}

      {/* Found Phase */}
      {phase === 'found' && (
        <div className="flex flex-col items-center justify-center z-10">
          <div className="text-2xl sm:text-3xl font-bold text-green-400 animate-pulse">Opponent Found!</div>
        </div>
      )}

      {/* Versus Phase - Show banners in corners */}
      {(phase === 'versus' || phase === 'ready') && (
        <>
          {/* Player Banner - Bottom Left, slides from bottom-left */}
          <BannerCard
            name={progress.playerName}
            bannerColor={playerBanner?.color || '#3b82f6'}
            bannerEmoji={playerBanner?.emoji || '⚔️'}
            trophies={playerTrophies}
            level={playerLevel}
            isPlayer={true}
            isVisible={showPlayer}
          />

          {/* VS Badge and Countdown - Center */}
          <div className={`z-10 flex flex-col items-center transition-all duration-500 ${showVs ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div 
              className="text-5xl sm:text-7xl font-black"
              style={{
                fontFamily: "'Luckiest Guy', cursive",
                background: 'linear-gradient(180deg, #fff9c4 0%, #ffd54f 30%, #ff8f00 60%, #e65100 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 30px rgba(255,200,0,0.9)) drop-shadow(2px 2px 0 #b45309)'
              }}
            >
              VS
            </div>
            {countdown > 0 && phase === 'ready' && (
              <div className="mt-4 sm:mt-6 text-4xl sm:text-5xl font-bold text-white animate-pulse">{countdown}</div>
            )}
            {countdown === 0 && (
              <div className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-green-400 animate-bounce">GO!</div>
            )}
          </div>

          {/* Enemy Banner - Top Right, slides from top-right */}
          <BannerCard
            name={enemy.name}
            bannerColor={enemy.banner.color}
            bannerEmoji={enemy.banner.emoji}
            trophies={enemy.trophies}
            level={enemy.level}
            isPlayer={false}
            isVisible={showEnemy}
          />
        </>
      )}
    </div>
  );
}
