import { useState, useEffect, useCallback } from 'react';
import { PlayerProgress } from '@/types/game';
import { MainMenu } from './MainMenu';
import { CardsPage } from './CardsPage';
import { CardBalanceInfo } from './DeckBuilder';
import { ClanScreen } from './ClanScreen';
import { ShopScreen } from './ShopScreen';
import { useShop } from '@/hooks/useShop';
import { cn } from '@/lib/utils';

type HomeScreen = 'shop' | 'cards' | 'battle' | 'clan';

const SCREENS: HomeScreen[] = ['shop', 'cards', 'battle', 'clan'];

interface HomeNavigatorProps {
  progress: PlayerProgress;
  onBattle: () => void;
  onOpenChest: () => void;
  onReset: () => void;
  onOpenProfile: () => void;
  onSaveDeck: (deckId: string, cardIds: string[]) => void;
  onSetActiveDeck: (deckId: string) => void;
  onAddDeck: () => void;
  cardBalanceInfo?: CardBalanceInfo[];
  onSpendGold: (amount: number) => boolean;
  onAddCard: (cardId: string) => void;
}

export function HomeNavigator({
  progress,
  onBattle,
  onOpenChest,
  onReset,
  onOpenProfile,
  onSaveDeck,
  onSetActiveDeck,
  onAddDeck,
  cardBalanceInfo = [],
  onSpendGold,
  onAddCard,
}: HomeNavigatorProps) {
  const [currentIndex, setCurrentIndex] = useState(2); // Start at battle (center)
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { shopState, purchaseItem, getTimeUntilRefresh } = useShop(progress.ownedCardIds);

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

  const handleShopPurchase = (itemId: string, price: number, cardId: string) => {
    if (onSpendGold(price)) {
      purchaseItem(itemId);
      onAddCard(cardId);
    }
  };

  const handleClaimFreebie = (itemId: string, cardId: string) => {
    purchaseItem(itemId);
    onAddCard(cardId);
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
        {/* Shop Screen */}
        <div className="w-full h-full flex-shrink-0" style={{ width: `${100 / SCREENS.length}%` }}>
          <ShopScreen
            shopState={shopState}
            gold={progress.gold}
            ownedCardIds={progress.ownedCardIds}
            onPurchase={handleShopPurchase}
            onClaimFreebie={handleClaimFreebie}
            onBack={() => goToScreen('cards')}
            timeUntilRefresh={getTimeUntilRefresh()}
          />
        </div>

        {/* Cards Screen */}
        <div className="w-full h-full flex-shrink-0" style={{ width: `${100 / SCREENS.length}%` }}>
          <CardsPage
            progress={progress}
            onSaveDeck={onSaveDeck}
            onSetActiveDeck={onSetActiveDeck}
            onAddDeck={onAddDeck}
            onStartBattle={onBattle}
            cardBalanceInfo={cardBalanceInfo}
          />
        </div>

        {/* Battle/Main Menu Screen */}
        <div className="w-full h-full flex-shrink-0" style={{ width: `${100 / SCREENS.length}%` }}>
          <MainMenu
            progress={progress}
            onBattle={onBattle}
            onDeckBuilder={() => goToScreen('cards')}
            onCollection={() => goToScreen('cards')}
            onClan={() => goToScreen('clan')}
            onShop={() => goToScreen('shop')}
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

    </div>
  );
}
