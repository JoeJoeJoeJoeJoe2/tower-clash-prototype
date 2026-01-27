import { PlayerProgress } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Swords, Package, Trophy, RotateCcw, LayoutGrid } from 'lucide-react';

interface MainMenuProps {
  progress: PlayerProgress;
  onBattle: () => void;
  onDeckBuilder: () => void;
  onCollection: () => void;
  onOpenChest: () => void;
  onReset: () => void;
}

export function MainMenu({ progress, onBattle, onDeckBuilder, onCollection, onOpenChest, onReset }: MainMenuProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="game-title text-5xl md:text-6xl text-primary mb-2">
          Tower Clash
        </h1>
        <p className="text-muted-foreground">Real-time strategy battles</p>
      </div>

      {/* Stats */}
      <div className="flex gap-8 bg-card/50 rounded-xl px-8 py-4 border border-border">
        <div className="text-center">
          <Trophy className="w-6 h-6 mx-auto text-primary mb-1" />
          <span className="text-2xl font-bold text-primary">{progress.wins}</span>
          <p className="text-xs text-muted-foreground">Wins</p>
        </div>
        <div className="text-center">
          <span className="text-2xl block mb-1">💀</span>
          <span className="text-2xl font-bold text-destructive">{progress.losses}</span>
          <p className="text-xs text-muted-foreground">Losses</p>
        </div>
        <div className="text-center">
          <span className="text-2xl block mb-1">🃏</span>
          <span className="text-2xl font-bold text-foreground">{progress.ownedCardIds.length}</span>
          <p className="text-xs text-muted-foreground">Cards</p>
        </div>
      </div>

      {/* Chest notification */}
      {progress.chestsAvailable > 0 && (
        <Button 
          onClick={onOpenChest}
          variant="outline"
          className="relative animate-pulse border-amber-500 text-amber-500 hover:bg-amber-500/10"
        >
          <Package className="w-5 h-5 mr-2" />
          Open Chest ({progress.chestsAvailable} available)
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-black rounded-full text-xs flex items-center justify-center font-bold">
            {progress.chestsAvailable}
          </span>
        </Button>
      )}

      {/* Main actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button 
          onClick={onBattle}
          size="lg"
          className="text-xl py-6 gap-2"
        >
          <Swords className="w-6 h-6" />
          Battle
        </Button>
        
        <Button 
          onClick={onDeckBuilder}
          variant="secondary"
          size="lg"
          className="py-6 gap-2"
        >
          <span className="text-xl">🃏</span>
          Edit Deck
        </Button>

        <Button
          onClick={onCollection}
          variant="outline"
          size="lg"
          className="py-6 gap-2"
        >
          <LayoutGrid className="w-5 h-5" />
          Collection
        </Button>
      </div>

      {/* Reset button */}
      <Button 
        onClick={onReset}
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Reset Progress
      </Button>
    </div>
  );
}
