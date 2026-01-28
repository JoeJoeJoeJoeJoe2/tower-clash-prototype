import { PlayerProgress } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Swords, Trophy, LayoutGrid, Crown, Users, ShoppingBag, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainMenuProps {
  progress: PlayerProgress;
  onBattle: () => void;
  onDeckBuilder: () => void;
  onCollection: () => void;
  onOpenChest: () => void;
  onReset: () => void;
}

export function MainMenu({ progress, onBattle, onDeckBuilder, onCollection, onOpenChest, onReset }: MainMenuProps) {
  const playerLevel = Math.min(14, Math.floor(progress.wins / 5) + 1);
  const xpProgress = ((progress.wins % 5) / 5) * 100;
  const trophies = progress.wins * 30;
  const gold = progress.wins * 100 + 500;
  const gems = progress.wins * 5 + 50;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a3a5c] via-[#0d2840] to-[#0a1f33] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-gradient-to-b from-[#0d1b2a] to-[#152238] px-2 py-1.5 flex items-center justify-between border-b border-cyan-900/50">
        {/* Player Level & XP */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-blue-400 shadow-lg">
              <span className="text-white font-bold text-lg">{playerLevel}</span>
            </div>
            {/* XP bar below level */}
            <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-gray-800 rounded-full overflow-hidden mx-0.5">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-semibold text-sm leading-tight">Player</p>
            <p className="text-gray-400 text-[10px]">{progress.wins * 100}/500 XP</p>
          </div>
        </div>

        {/* Currency */}
        <div className="flex items-center gap-2">
          {/* Gold */}
          <div className="flex items-center bg-gradient-to-b from-yellow-900/80 to-yellow-950/80 rounded-full pl-1 pr-2.5 py-0.5 border border-yellow-600/50">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mr-1">
              <span className="text-[10px]">💰</span>
            </div>
            <span className="text-yellow-300 font-bold text-xs">{gold.toLocaleString()}</span>
          </div>
          
          {/* Gems */}
          <div className="flex items-center bg-gradient-to-b from-purple-900/80 to-purple-950/80 rounded-full pl-1 pr-2.5 py-0.5 border border-purple-600/50">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-1">
              <span className="text-[10px]">💎</span>
            </div>
            <span className="text-purple-300 font-bold text-xs">{gems}</span>
          </div>
        </div>
      </div>

      {/* Trophy Display */}
      <div className="flex justify-center py-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-900/60 via-orange-800/70 to-orange-900/60 px-5 py-1.5 rounded-full border border-orange-500/40 shadow-lg">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-yellow-200" />
          </div>
          <span className="text-2xl font-bold text-white tracking-wide">{trophies}</span>
        </div>
      </div>

      {/* Arena Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        {/* Arena Background */}
        <div className="relative w-full max-w-[280px] aspect-[4/3] rounded-2xl overflow-hidden border-4 border-emerald-700/50 shadow-2xl">
          {/* Arena grass field */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-600 via-emerald-500 to-emerald-600">
            {/* Grid lines for arena feel */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute w-full h-px bg-emerald-900" style={{ top: `${(i + 1) * 16}%` }} />
              ))}
            </div>
            
            {/* River */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-3 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 opacity-80" />
            
            {/* Bridges */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[15%] w-8 h-5 bg-amber-700 rounded" />
            <div className="absolute top-1/2 -translate-y-1/2 right-[15%] w-8 h-5 bg-amber-700 rounded" />
          </div>

          {/* Towers */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-lg bg-gradient-to-b from-red-500 to-red-700 border-2 border-red-400 flex items-center justify-center">
            <Crown className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="absolute top-8 left-4 w-7 h-7 rounded bg-gradient-to-b from-red-500 to-red-700 border-2 border-red-400" />
          <div className="absolute top-8 right-4 w-7 h-7 rounded bg-gradient-to-b from-red-500 to-red-700 border-2 border-red-400" />
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-lg bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-400 flex items-center justify-center">
            <Crown className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="absolute bottom-8 left-4 w-7 h-7 rounded bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-400" />
          <div className="absolute bottom-8 right-4 w-7 h-7 rounded bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-400" />

          {/* Decorative trees */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-3xl">🌲</div>
          <div className="absolute top-16 left-2 text-xl">🌳</div>
          <div className="absolute top-16 right-2 text-xl">🌳</div>
        </div>

        {/* Arena Name Badge */}
        <div className="mt-3 bg-gradient-to-r from-blue-900/80 to-cyan-900/80 px-4 py-1 rounded-full border border-cyan-500/40">
          <span className="text-cyan-300 font-semibold text-sm">Cracked Arena</span>
        </div>
      </div>

      {/* Chest Slots - 4 small slots above battle button */}
      <div className="px-4 mb-2">
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((slotIndex) => {
            const hasChest = slotIndex < progress.chestsAvailable;
            return (
              <button
                key={slotIndex}
                onClick={hasChest ? onOpenChest : undefined}
                disabled={!hasChest}
                className={cn(
                  "w-14 h-14 rounded-lg border-2 flex items-center justify-center transition-all relative overflow-hidden",
                  hasChest 
                    ? "bg-gradient-to-b from-purple-600 to-purple-900 border-amber-500 cursor-pointer hover:scale-105 shadow-lg shadow-purple-500/40" 
                    : "bg-gradient-to-b from-gray-800/50 to-gray-900/50 border-gray-700/50 cursor-not-allowed"
                )}
              >
                {hasChest ? (
                  <span className="text-2xl animate-bounce">🎁</span>
                ) : (
                  <span className="text-2xl opacity-30">📦</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Battle Button */}
      <div className="flex justify-center pb-3">
        <Button 
          onClick={onBattle}
          className="px-12 h-12 text-xl font-bold gap-2 bg-gradient-to-b from-green-500 via-green-600 to-green-700 hover:from-green-400 hover:via-green-500 hover:to-green-600 border-b-4 border-green-900 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all"
        >
          <Swords className="w-6 h-6" />
          Battle
        </Button>
      </div>
      <p className="text-center text-gray-500 text-xs pb-2">
        {progress.wins}W - {progress.losses}L
      </p>

      {/* Bottom Navigation */}
      <div className="bg-[#0a1525] border-t border-cyan-900/40 px-2 py-1.5 safe-area-inset-bottom">
        <div className="flex justify-around max-w-md mx-auto">
          <NavButton icon={<LayoutGrid className="w-5 h-5" />} label="Cards" onClick={onDeckBuilder} />
          <NavButton icon={<ShoppingBag className="w-5 h-5" />} label="Shop" onClick={onCollection} />
          <NavButton icon={<Swords className="w-5 h-5" />} label="Battle" onClick={onBattle} active />
          <NavButton icon={<Users className="w-5 h-5" />} label="Social" onClick={onCollection} />
          <NavButton icon={<Calendar className="w-5 h-5" />} label="Events" onClick={onReset} />
        </div>
      </div>
    </div>
  );
}

function NavButton({ 
  icon, 
  label, 
  onClick, 
  active = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
        active 
          ? 'bg-cyan-600/30 text-cyan-400' 
          : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
      }`}
    >
      {icon}
      <span className="text-[9px] font-semibold">{label}</span>
    </button>
  );
}
