import { useState, useEffect, useCallback } from 'react';
import { PlayerProgress } from '@/types/game';
import { User } from '@supabase/supabase-js';
import { OnlinePlayer } from '@/hooks/useOnlinePresence';
import { BattleRequest } from '@/hooks/useBattleRequests';
import { MainMenu } from './MainMenu';
import { CardsPage } from './CardsPage';
import { CardBalanceInfo } from './DeckBuilder';
import { ClanScreen } from './ClanScreen';
import { ShopScreen } from './ShopScreen';
import { TrophyRoad } from './TrophyRoad';
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
  // Multiplayer props
  user: User | null;
  onlinePlayers: OnlinePlayer[];
  incomingRequests: BattleRequest[];
  outgoingRequests: BattleRequest[];
  onSendRequest: (userId: string, playerName: string) => Promise<boolean>;
  onAcceptRequest: (requestId: string) => Promise<boolean>;
  onDeclineRequest: (requestId: string) => Promise<boolean>;
  onCancelRequest: (requestId: string) => Promise<boolean>;
  onSignOut: () => void;
  onSignIn: () => void;
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
  // Multiplayer props
  user,
  onlinePlayers,
  incomingRequests,
  outgoingRequests,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onCancelRequest,
  onSignOut,
  onSignIn,
}: HomeNavigatorProps) {
  const [currentIndex, setCurrentIndex] = useState(2); // Start at battle (center)
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTrophyRoad, setShowTrophyRoad] = useState(false);
  
  const { shopState, purchaseItem, getTimeUntilRefresh } = useShop(progress.ownedCardIds);
  
  const trophies = progress.wins * 30;

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
            onOpenTrophyRoad={() => setShowTrophyRoad(true)}
            incomingRequestCount={incomingRequests.length}
          />
        </div>

        {/* Clan Screen */}
        <div className="w-full h-full flex-shrink-0" style={{ width: `${100 / SCREENS.length}%` }}>
          <ClanScreen
            playerName={progress.playerName}
            trophies={trophies}
            onBack={() => goToScreen('battle')}
            user={user}
            onlinePlayers={onlinePlayers}
            incomingRequests={incomingRequests}
            outgoingRequests={outgoingRequests}
            onSendRequest={onSendRequest}
            onAcceptRequest={onAcceptRequest}
            onDeclineRequest={onDeclineRequest}
            onCancelRequest={onCancelRequest}
            onSignOut={onSignOut}
          />
        </div>
      </div>

      {/* Trophy Road Overlay */}
      {showTrophyRoad && (
        <div className="absolute inset-0 z-50">
          <TrophyRoad
            trophies={trophies}
            onClose={() => setShowTrophyRoad(false)}
          />
        </div>
      )}
    </div>
  );
}
