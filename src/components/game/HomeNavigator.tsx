import { useState, useEffect, useCallback } from 'react';
import { PlayerProgress } from '@/types/game';
import { MainMenu } from './MainMenu';
import { DeckBuilder } from './DeckBuilder';
import { ClanScreen } from './ClanScreen';
import { cn } from '@/lib/utils';

type HomeScreen = 'deck-builder' | 'battle' | 'clan';

const SCREENS: HomeScreen[] = ['deck-builder', 'battle', 'clan'];

interface HomeNavigatorProps {
  progress: PlayerProgress;
  onBattle: () => void;
  onOpenChest: () => void;
  onReset: () => void;
  onOpenProfile: () => void;
  onSaveDeck: (deckId: string, cardIds: string[]) => void;
  onSetActiveDeck: (deckId: string) => void;
}

export function HomeNavigator({
  progress,
  onBattle,
  onOpenChest,
  onReset,
  onOpenProfile,
  onSaveDeck,
  onSetActiveDeck,
}: HomeNavigatorProps) {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at battle (center)
  const [isAnimating, setIsAnimating] = useState(false);

  const navigateTo = useCallback((index: number) => {
    if (isAnimating || index < 0 || index >= SCREENS.length) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      navigateTo(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      navigateTo(currentIndex + 1);
    }
  }, [currentIndex, navigateTo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const goToScreen = (screen: HomeScreen) => {
    const index = SCREENS.indexOf(screen);
    if (index !== -1) {
      navigateTo(index);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Sliding container */}
      <div 
        className={cn(
          "flex h-full transition-transform duration-300 ease-out",
        )}
        style={{ 
          width: `${SCREENS.length * 100}%`,
          transform: `translateX(-${currentIndex * (100 / SCREENS.length)}%)`
        }}
      >
        {/* Deck Builder Screen */}
        <div className="w-full h-full flex-shrink-0" style={{ width: `${100 / SCREENS.length}%` }}>
          <DeckBuilder
            ownedCardIds={progress.ownedCardIds}
            deckSlots={progress.deckSlots}
            activeDeckId={progress.activeDeckId}
            onSaveDeck={onSaveDeck}
            onSetActiveDeck={onSetActiveDeck}
            onStartBattle={onBattle}
            onBack={() => goToScreen('battle')}
          />
        </div>

        {/* Battle/Main Menu Screen */}
        <div className="w-full h-full flex-shrink-0" style={{ width: `${100 / SCREENS.length}%` }}>
          <MainMenu
            progress={progress}
            onBattle={onBattle}
            onDeckBuilder={() => goToScreen('deck-builder')}
            onCollection={() => goToScreen('deck-builder')}
            onClan={() => goToScreen('clan')}
            onOpenChest={onOpenChest}
            onReset={onReset}
            onOpenProfile={onOpenProfile}
          />
        </div>

        {/* Clan Screen */}
        <div className="w-full h-full flex-shrink-0" style={{ width: `${100 / SCREENS.length}%` }}>
          <ClanScreen
            playerName={progress.playerName}
            trophies={progress.wins * 30}
            onBack={() => goToScreen('battle')}
          />
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {SCREENS.map((screen, index) => (
          <button
            key={screen}
            onClick={() => navigateTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentIndex === index 
                ? "bg-cyan-400 w-6" 
                : "bg-gray-600 hover:bg-gray-500"
            )}
            aria-label={`Go to ${screen}`}
          />
        ))}
      </div>
    </div>
  );
}
