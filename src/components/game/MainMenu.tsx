import { PlayerProgress } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Swords, Package, Trophy, LayoutGrid, Crown, Sparkles } from 'lucide-react';
import { allCards } from '@/data/cards';

interface MainMenuProps {
  progress: PlayerProgress;
  onBattle: () => void;
  onDeckBuilder: () => void;
  onCollection: () => void;
  onOpenChest: () => void;
  onReset: () => void;
}

export function MainMenu({ progress, onBattle, onDeckBuilder, onCollection, onOpenChest, onReset }: MainMenuProps) {
  // Get a featured card for display
  const featuredCard = allCards.find(c => c.rarity === 'legendary') || allCards[0];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(210,80%,25%)] via-[hsl(210,70%,20%)] to-[hsl(220,60%,15%)] flex flex-col">
      {/* Top Bar */}
      <div className="bg-gradient-to-b from-[hsl(220,30%,12%)] to-[hsl(220,25%,18%)] px-3 py-2 flex items-center justify-between border-b-2 border-primary/30">
        {/* Player Info */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center border-2 border-primary">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1 rounded">
              {Math.min(13, Math.floor(progress.wins / 3) + 1)}
            </span>
          </div>
          <div>
            <p className="text-foreground font-bold text-sm leading-tight">Player</p>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-400 w-3/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1">
            <span className="text-amber-400 text-sm">💰</span>
            <span className="text-foreground font-bold text-xs">{(progress.wins * 100).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1">
            <span className="text-purple-400 text-sm">💎</span>
            <span className="text-foreground font-bold text-xs">{progress.wins * 10}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4">
        {/* Trophy Display */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-900/50 via-amber-800/60 to-amber-900/50 px-6 py-2 rounded-full border border-amber-500/30">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span className="text-2xl font-bold text-foreground">{progress.wins * 30}</span>
        </div>

        {/* Featured Card Display */}
        <div className="relative w-64 h-72 flex items-center justify-center">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent rounded-full blur-2xl" />
          
          {/* Card frame */}
          <div className="relative z-10 w-48 h-60 rounded-2xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 p-1 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-xl bg-gradient-to-b from-[hsl(220,20%,25%)] to-[hsl(220,25%,15%)] flex flex-col items-center justify-center overflow-hidden">
              {/* Card emoji/icon */}
              <div className="text-7xl mb-2 drop-shadow-lg">{featuredCard.emoji}</div>
              <p className="text-foreground font-bold text-lg">{featuredCard.name}</p>
              <p className="text-muted-foreground text-xs capitalize">{featuredCard.rarity}</p>
              
              {/* Sparkle effects */}
              <Sparkles className="absolute top-4 right-4 w-4 h-4 text-amber-400 animate-pulse" />
              <Sparkles className="absolute bottom-8 left-4 w-3 h-3 text-amber-300 animate-pulse delay-300" />
            </div>
          </div>
        </div>

        {/* Battle Button */}
        <Button 
          onClick={onBattle}
          size="lg"
          className="relative w-64 h-16 text-2xl font-bold gap-3 bg-gradient-to-b from-green-500 via-green-600 to-green-700 hover:from-green-400 hover:via-green-500 hover:to-green-600 border-b-4 border-green-900 rounded-xl shadow-lg transform hover:scale-105 transition-all"
        >
          <Swords className="w-7 h-7" />
          Battle
        </Button>

        {/* Win/Loss Stats */}
        <div className="flex gap-6 text-center mt-2">
          <div>
            <span className="text-xl font-bold text-green-400">{progress.wins}</span>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <span className="text-xl font-bold text-destructive">{progress.losses}</span>
            <p className="text-xs text-muted-foreground">Losses</p>
          </div>
        </div>
      </div>

      {/* Chest Slots */}
      <div className="bg-gradient-to-t from-[hsl(220,25%,10%)] to-transparent px-4 py-3">
        <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
          {[0, 1, 2, 3].map((slot) => (
            <button
              key={slot}
              onClick={slot === 0 && progress.chestsAvailable > 0 ? onOpenChest : undefined}
              className={`relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                slot < progress.chestsAvailable 
                  ? 'bg-gradient-to-b from-amber-700 to-amber-900 border-amber-500 hover:scale-105 cursor-pointer animate-pulse' 
                  : 'bg-gradient-to-b from-muted to-muted/50 border-border cursor-default opacity-60'
              }`}
            >
              {slot < progress.chestsAvailable ? (
                <>
                  <Package className="w-8 h-8 text-amber-400" />
                  <span className="text-[10px] text-amber-300 font-bold mt-1">OPEN</span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded border-2 border-dashed border-muted-foreground/30" />
                  <span className="text-[10px] text-muted-foreground mt-1">Empty</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-[hsl(220,30%,8%)] border-t-2 border-primary/20 px-2 py-2 safe-area-inset-bottom">
        <div className="flex justify-around max-w-md mx-auto">
          <NavButton icon="🃏" label="Cards" onClick={onDeckBuilder} />
          <NavButton icon={<LayoutGrid className="w-5 h-5" />} label="Collection" onClick={onCollection} />
          <NavButton icon="⚔️" label="Battle" onClick={onBattle} active />
          <NavButton icon="🔄" label="Reset" onClick={onReset} />
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
      className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-all ${
        active 
          ? 'bg-primary/20 text-primary' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}
